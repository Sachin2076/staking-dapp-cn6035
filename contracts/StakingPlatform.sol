// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StakingPlatform
 * @dev CN6035 - Decentralized ETH Staking Platform with Time-Based Rewards
 * @author Student Project - University of East London
 *
 * IMPROVEMENTS:
 * - Emergency pause mechanism for production safety
 * - Clearer error messages with actual values
 * - Owner-only administrative functions
 */
contract StakingPlatform {

    // ─── Constants ────────────────────────────────────────────────────────────
    uint256 public constant ANNUAL_RATE = 10;
    uint256 public constant RATE_PRECISION = 100;
    uint256 public constant LOCK_PERIOD = 1 hours;
    uint256 public constant MIN_STAKE = 0.001 ether;

    // ─── State Variables ──────────────────────────────────────────────────────
    address public immutable owner;
    bool public paused;

    // ─── Reentrancy Guard ─────────────────────────────────────────────────────
    bool private _locked;

    modifier nonReentrant() {
        require(!_locked, "StakingPlatform: reentrant call detected");
        _locked = true;
        _;
        _locked = false;
    }

    // ─── Access Control ───────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "StakingPlatform: caller is not the owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "StakingPlatform: contract is paused");
        _;
    }

    // ─── Data Structures ─────────────────────────────────────────────────────
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockDuration;
        bool    withdrawn;
    }

    mapping(address => Stake[]) private userStakes;
    uint256 public totalStaked;
    uint256 public totalStakesCreated;

    // ─── Events ───────────────────────────────────────────────────────────────
    event Staked(address indexed user, uint256 indexed stakeIndex, uint256 amount, uint256 lockUntil);
    event Withdrawn(address indexed user, uint256 indexed stakeIndex, uint256 principal, uint256 reward, uint256 total);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
        paused = false;
    }

    // ─── Emergency Functions ──────────────────────────────────────────────────
    
    function pause() external onlyOwner {
        require(!paused, "StakingPlatform: already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        require(paused, "StakingPlatform: not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }

    // ─── External Functions ───────────────────────────────────────────────────

    function stake() external payable nonReentrant whenNotPaused {
        require(
            msg.value >= MIN_STAKE,
            "StakingPlatform: minimum stake is 0.001 ETH"
        );

        Stake memory newStake = Stake({
            amount:       msg.value,
            startTime:    block.timestamp,
            lockDuration: LOCK_PERIOD,
            withdrawn:    false
        });

        userStakes[msg.sender].push(newStake);

        uint256 index     = userStakes[msg.sender].length - 1;
        uint256 lockUntil = block.timestamp + LOCK_PERIOD;

        totalStaked        += msg.value;
        totalStakesCreated += 1;

        emit Staked(msg.sender, index, msg.value, lockUntil);
    }

    function withdraw(uint256 stakeIndex) external nonReentrant whenNotPaused {
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

        uint256 reward = _calculateReward(s.amount, s.startTime);
        uint256 total  = s.amount + reward;

        require(
            address(this).balance >= total,
            "StakingPlatform: insufficient contract balance for payout"
        );

        s.withdrawn  = true;
        totalStaked -= s.amount;

        (bool success, ) = msg.sender.call{ value: total }("");
        require(success, "StakingPlatform: ETH transfer failed");

        emit Withdrawn(msg.sender, stakeIndex, s.amount, reward, total);
    }

    function calculateRewards(address user, uint256 stakeIndex)
        external view returns (uint256)
    {
        require(user != address(0), "StakingPlatform: invalid user address");
        require(
            stakeIndex < userStakes[user].length,
            "StakingPlatform: invalid stake index"
        );

        Stake memory s = userStakes[user][stakeIndex];
        if (s.withdrawn) return 0;

        return _calculateReward(s.amount, s.startTime);
    }

    function getUserStakes(address user) external view returns (Stake[] memory) {
        require(user != address(0), "StakingPlatform: invalid user address");
        return userStakes[user];
    }

    function getStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }

    function getPlatformStats()
        external view
        returns (uint256 _totalStaked, uint256 _totalStakesCreated, uint256 _contractBalance)
    {
        return (totalStaked, totalStakesCreated, address(this).balance);
    }

    receive() external payable {}

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    function _calculateReward(uint256 amount, uint256 startTime)
        internal view returns (uint256)
    {
        uint256 elapsed = block.timestamp - startTime;
        return (amount * ANNUAL_RATE * elapsed) / (365 days * RATE_PRECISION);
    }
}