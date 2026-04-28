/**
 * StakingPlatform.test.js
 * ───────────────────────
 * Basic unit tests for the StakingPlatform smart contract.
 * Run with:  npx hardhat test
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("StakingPlatform", function () {
  let contract;
  let owner;
  let user1;
  let user2;

  const ONE_HOUR = 3600; // seconds

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("StakingPlatform");
    contract = await Factory.deploy();
    await contract.waitForDeployment();

    // Fund the contract so it can pay rewards
    await owner.sendTransaction({
      to: await contract.getAddress(),
      value: ethers.parseEther("10"),
    });
  });

  // ── Staking ────────────────────────────────────────────────────────────────

  describe("stake()", function () {
    it("should accept ETH and store a new stake", async function () {
      const amount = ethers.parseEther("1");
      await expect(contract.connect(user1).stake({ value: amount }))
        .to.emit(contract, "Staked")
        .withArgs(user1.address, 0, amount, anyValue);

      const stakes = await contract.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0].amount).to.equal(amount);
      expect(stakes[0].withdrawn).to.equal(false);
    });

    it("should allow multiple independent stakes", async function () {
      await contract.connect(user1).stake({ value: ethers.parseEther("1") });
      await contract.connect(user1).stake({ value: ethers.parseEther("2") });

      const stakes = await contract.getUserStakes(user1.address);
      expect(stakes.length).to.equal(2);
      expect(stakes[0].amount).to.equal(ethers.parseEther("1"));
      expect(stakes[1].amount).to.equal(ethers.parseEther("2"));
    });

    it("should revert when 0 ETH is sent", async function () {
      await expect(
        contract.connect(user1).stake({ value: 0 })
      ).to.be.revertedWith("StakingPlatform: minimum stake is 0.001 ETH");
    });
  });

  // ── Rewards ────────────────────────────────────────────────────────────────

  describe("calculateRewards()", function () {
    it("should return 0 for a brand-new stake", async function () {
      await contract.connect(user1).stake({ value: ethers.parseEther("1") });
      const reward = await contract.calculateRewards(user1.address, 0);
      expect(reward).to.be.lt(ethers.parseEther("0.0001"));
    });

    it("should return a positive reward after time passes", async function () {
      await contract.connect(user1).stake({ value: ethers.parseEther("1") });
      await time.increase(ONE_HOUR);

      const reward = await contract.calculateRewards(user1.address, 0);
      expect(reward).to.be.gt(0);
    });
  });

  // ── Withdrawal ─────────────────────────────────────────────────────────────

  describe("withdraw()", function () {
    it("should revert before lock period ends", async function () {
      await contract.connect(user1).stake({ value: ethers.parseEther("1") });
      await expect(
        contract.connect(user1).withdraw(0)
      ).to.be.revertedWith("StakingPlatform: lock period has not ended yet");
    });

    it("should pay principal + reward after lock period", async function () {
      const stakeAmount = ethers.parseEther("1");
      await contract.connect(user1).stake({ value: stakeAmount });

      await time.increase(ONE_HOUR + 1);

      const balanceBefore = await ethers.provider.getBalance(user1.address);

      const tx = await contract.connect(user1).withdraw(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      const netReceived = balanceAfter - balanceBefore + gasUsed;

      expect(netReceived).to.be.gt(stakeAmount);
    });

    it("should mark stake as withdrawn", async function () {
      await contract.connect(user1).stake({ value: ethers.parseEther("1") });
      await time.increase(ONE_HOUR + 1);
      await contract.connect(user1).withdraw(0);

      const stakes = await contract.getUserStakes(user1.address);
      expect(stakes[0].withdrawn).to.equal(true);
    });

    it("should revert on double withdrawal", async function () {
      await contract.connect(user1).stake({ value: ethers.parseEther("1") });
      await time.increase(ONE_HOUR + 1);
      await contract.connect(user1).withdraw(0);

      await expect(
        contract.connect(user1).withdraw(0)
      ).to.be.revertedWith("StakingPlatform: already withdrawn");
    });
  });

  // ── Platform Stats ────────────────────────────────────────────────────────

  describe("getPlatformStats()", function () {
    it("should track total staked and stakes created correctly", async function () {
      await contract.connect(user1).stake({ value: ethers.parseEther("1") });
      await contract.connect(user2).stake({ value: ethers.parseEther("2") });

      const stats = await contract.getPlatformStats();
      expect(stats._totalStaked).to.equal(ethers.parseEther("3"));
      expect(stats._totalStakesCreated).to.equal(2n);
    });
  });

  // ── Multi-user isolation ──────────────────────────────────────────────────

  describe("Multi-user", function () {
    it("should isolate stakes between different users", async function () {
      await contract.connect(user1).stake({ value: ethers.parseEther("1") });
      await contract.connect(user2).stake({ value: ethers.parseEther("2") });

      const user1Stakes = await contract.getUserStakes(user1.address);
      const user2Stakes = await contract.getUserStakes(user2.address);

      expect(user1Stakes.length).to.equal(1);
      expect(user2Stakes.length).to.equal(1);
      expect(user1Stakes[0].amount).to.equal(ethers.parseEther("1"));
      expect(user2Stakes[0].amount).to.equal(ethers.parseEther("2"));
    });
  });

  // ── Emergency Functions ──────────────────────────────────────────────────

  describe("Emergency Functions", function () {
    it("should allow owner to pause", async function () {
      await contract.pause();
      const paused = await contract.paused();
      expect(paused).to.equal(true);
    });

    it("should prevent staking when paused", async function () {
      await contract.pause();
      await expect(
        contract.connect(user1).stake({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("StakingPlatform: contract is paused");
    });

    it("should allow owner to unpause", async function () {
      await contract.pause();
      await contract.unpause();
      const paused = await contract.paused();
      expect(paused).to.equal(false);
    });

    it("should prevent non-owner from pausing", async function () {
      await expect(
        contract.connect(user1).pause()
      ).to.be.revertedWith("StakingPlatform: caller is not the owner");
    });
  });
});