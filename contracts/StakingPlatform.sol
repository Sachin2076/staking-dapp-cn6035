// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StakingPlatform
 * @dev CN6035 - Decentralized ETH Staking Platform with Time-Based Rewards
 * @author Student Project - University of East London
 *
 * Each user can hold multiple independent stakes.
 * Rewards accrue linearly: reward = amount * RATE * timeElapsed / (365 days * PRECISION)
 * A lock period prevents early withdrawal.
 */
contract StakingPlatform {

    // ─── Constants ────────────────────────────────────────────────────────────

    /// @dev Annual interest rate expressed as a percentage (10 = 10% p.a.)
    uint256 public constant ANNUAL_RATE = 10;

    /// @dev Divisor used together with ANNUAL_RATE so we avoid floating-point maths
    uint256 public constant RATE_PRECISION = 100;

    /// @dev Lock period before withdrawal is allowed (1 hour – suitable for testing)
    uint256 public constant LOCK_PERIOD = 1 hours;

    // ─── Data Structures ─────────────────────────────────────────────────────

    struct Stake {
        uint256 amount;        // ETH staked (in wei)
        uint256 startTime;     // Unix timestamp when stake was created
        uint256 lockDuration;  // Seconds the stake is locked
        bool    withdrawn;     // True once the user has claimed this stake
    }

    // ─── State ────────────────────────────────────────────────────────────────

    /// @dev All stakes for every user; each address maps to an ordered array
    mapping(address => Stake[]) private userStakes;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Staked(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 amount,
        uint256 lockUntil
    );

    event Withdrawn(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 principal,
        uint256 reward,
        uint256 total
    );

    // ─── External Functions ───────────────────────────────────────────────────

    /**
     * @notice Stake ETH.  Each call creates a new, independent stake entry.
     * @dev    msg.value must be > 0.  The contract keeps the ETH until withdrawal.
     */
    function stake() external payable {
        require(msg.value > 0, "StakingPlatform: must send ETH to stake");

        Stake memory newStake = Stake({
            amount:       msg.value,
            startTime:    block.timestamp,
            lockDuration: LOCK_PERIOD,
            withdrawn:    false
        });

        userStakes[msg.sender].push(newStake);

        uint256 index    = userStakes[msg.sender].length - 1;
        uint256 lockUntil = block.timestamp + LOCK_PERIOD;

        emit Staked(msg.sender, index, msg.value, lockUntil);
    }

    /**
     * @notice Withdraw a specific stake after its lock period has expired.
     * @param  stakeIndex  Index of the stake in the caller's stakes array.
     */
    function withdraw(uint256 stakeIndex) external {
        require(
            stakeIndex < userStakes[msg.sender].length,
            "StakingPlatform: invalid stake index"
        );

        Stake storage s = userStakes[msg.sender][stakeIndex];

        require(!s.withdrawn, "StakingPlatform: already withdrawn");
        require(
            block.timestamp >= s.startTime + s.lockDuration,
            "StakingPlatform: lock period has not ended yet"
        );

        // Calculate reward before marking as withdrawn
        uint256 reward = _calculateReward(s.amount, s.startTime);
        uint256 total  = s.amount + reward;

        // Mark withdrawn first to prevent re-entrancy
        s.withdrawn = true;

        // The contract must hold enough ETH to cover rewards.
        // In production this would be funded separately; here we use the
        // contract balance (funded by stakers + an initial fund() call).
        require(
            address(this).balance >= total,
            "StakingPlatform: insufficient contract balance for reward"
        );

        (bool success, ) = msg.sender.call{ value: total }("");
        require(success, "StakingPlatform: ETH transfer failed");

        emit Withdrawn(msg.sender, stakeIndex, s.amount, reward, total);
    }

    /**
     * @notice Public view to calculate the current reward for a specific stake.
     * @param  user        Wallet address of the staker.
     * @param  stakeIndex  Index of the stake.
     * @return reward in wei.
     */
    function calculateRewards(address user, uint256 stakeIndex)
        external
        view
        returns (uint256)
    {
        require(
            stakeIndex < userStakes[user].length,
            "StakingPlatform: invalid stake index"
        );

        Stake memory s = userStakes[user][stakeIndex];
        if (s.withdrawn) return 0;

        return _calculateReward(s.amount, s.startTime);
    }

    /**
     * @notice Return the full stakes array for a given user.
     * @param  user  Wallet address.
     * @return Array of Stake structs (including already-withdrawn ones).
     */
    function getUserStakes(address user)
        external
        view
        returns (Stake[] memory)
    {
        return userStakes[user];
    }

    /**
     * @notice Returns the total number of stakes a user has ever made.
     */
    function getStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }

    /**
     * @notice Allow the contract owner / deployer to fund the reward pool.
     */
    receive() external payable {}

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    /**
     * @dev  Pure reward formula:
     *       reward = amount * ANNUAL_RATE * secondsElapsed / (365 days * RATE_PRECISION)
     *
     *       Example: 1 ETH staked for 1 year at 10% → 0.1 ETH reward.
     */
    function _calculateReward(uint256 amount, uint256 startTime)
        internal
        view
        returns (uint256)
    {
        uint256 elapsed = block.timestamp - startTime;
        return (amount * ANNUAL_RATE * elapsed) / (365 days * RATE_PRECISION);
    }
}
