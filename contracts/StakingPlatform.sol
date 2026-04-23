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
 *
 * Security features:
 * - Reentrancy guard on all state-changing functions
 * - Checks-Effects-Interactions pattern enforced in withdraw()
 * - Minimum stake amount to prevent dust attacks
 * - Strict input validation on all public functions
 */
contract StakingPlatform {

    // ─── Constants ────────────────────────────────────────────────────────────

    /// @dev Annual interest rate expressed as a percentage (10 = 10% p.a.)
    uint256 public constant ANNUAL_RATE = 10;

    /// @dev Divisor used together with ANNUAL_RATE so we avoid floating-point maths
    uint256 public constant RATE_PRECISION = 100;

    /// @dev Lock period before withdrawal is allowed (1 hour – suitable for testing)
    uint256 public constant LOCK_PERIOD = 1 hours;

    /// @dev Minimum stake amount to prevent dust attacks (0.001 ETH)
    uint256 public constant MIN_STAKE = 0.001 ether;

    // ─── Reentrancy Guard ─────────────────────────────────────────────────────

    /// @dev Mutex lock to prevent reentrancy attacks
    bool private _locked;

    /**
     * @dev Prevents a function from being called while it is already executing.
     *      Uses a boolean mutex rather than a counter for gas efficiency.
     */
    modifier nonReentrant() {
        require(!_locked, "StakingPlatform: reentrant call detected");
        _locked = true;
        _;
        _locked = false;
    }

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

    /// @dev Track total ETH currently staked across all users
    uint256 public totalStaked;

    /// @dev Track total number of stakes ever created
    uint256 public totalStakesCreated;

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
     * @notice Stake ETH. Each call creates a new, independent stake entry.
     * @dev    msg.value must meet minimum stake requirement.
     *         Uses nonReentrant guard to prevent reentrancy attacks.
     *         Emits a Staked event on success.
     */
    function stake() external payable nonReentrant {
        require(
            msg.value >= MIN_STAKE,
            "StakingPlatform: must send ETH to stake"
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

        // Update global tracking state
        totalStaked        += msg.value;
        totalStakesCreated += 1;

        emit Staked(msg.sender, index, msg.value, lockUntil);
    }

    /**
     * @notice Withdraw a specific stake after its lock period has expired.
     * @dev    Follows Checks-Effects-Interactions (CEI) pattern:
     *         1. CHECKS  – validate all conditions first
     *         2. EFFECTS – update state before external call
     *         3. INTERACTIONS – transfer ETH last
     *         nonReentrant guard provides additional protection.
     * @param  stakeIndex  Index of the stake in the caller's stakes array.
     */
    function withdraw(uint256 stakeIndex) external nonReentrant {
        // ── CHECKS ──────────────────────────────────────────────────────────
        require(
            stakeIndex < userStakes[msg.sender].length,
            "StakingPlatform: invalid stake index"
        );

        Stake storage s = userStakes[msg.sender][stakeIndex];

        require(
            !s.withdrawn,
            "StakingPlatform: already withdrawn"
        );
        require(
            block.timestamp >= s.startTime + s.lockDuration,
            "StakingPlatform: lock period has not ended yet"
        );

        // Calculate reward and total before any state changes
        uint256 reward = _calculateReward(s.amount, s.startTime);
        uint256 total  = s.amount + reward;

        require(
            address(this).balance >= total,
            "StakingPlatform: insufficient contract balance for payout"
        );

        // ── EFFECTS ─────────────────────────────────────────────────────────
        // Mark withdrawn BEFORE external call (prevents reentrancy)
        s.withdrawn  = true;
        totalStaked -= s.amount;

        // ── INTERACTIONS ────────────────────────────────────────────────────
        (bool success, ) = msg.sender.call{ value: total }("");
        require(success, "StakingPlatform: ETH transfer failed");

        emit Withdrawn(msg.sender, stakeIndex, s.amount, reward, total);
    }

    /**
     * @notice Public view to calculate the current reward for a specific stake.
     * @param  user        Wallet address of the staker.
     * @param  stakeIndex  Index of the stake.
     * @return Reward amount in wei.
     */
    function calculateRewards(address user, uint256 stakeIndex)
        external
        view
        returns (uint256)
    {
        require(
            user != address(0),
            "StakingPlatform: invalid user address"
        );
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
     * @param  user  Wallet address to query.
     * @return Array of Stake structs (includes already-withdrawn entries).
     */
    function getUserStakes(address user)
        external
        view
        returns (Stake[] memory)
    {
        require(
            user != address(0),
            "StakingPlatform: invalid user address"
        );
        return userStakes[user];
    }

    /**
     * @notice Returns the total number of stakes a user has ever made.
     * @param  user  Wallet address to query.
     * @return Total stake count for the user.
     */
    function getStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }

    /**
     * @notice Returns platform-level statistics.
     * @return _totalStaked         Current ETH locked in active stakes.
     * @return _totalStakesCreated  All-time number of stakes created.
     * @return _contractBalance     Current ETH balance of the contract.
     */
    function getPlatformStats()
        external
        view
        returns (
            uint256 _totalStaked,
            uint256 _totalStakesCreated,
            uint256 _contractBalance
        )
    {
        return (totalStaked, totalStakesCreated, address(this).balance);
    }

    /**
     * @notice Allow the contract to receive ETH to fund the reward pool.
     * @dev    Called automatically when ETH is sent without calldata.
     */
    receive() external payable {}

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    /**
     * @dev  Pure reward formula:
     *       reward = amount * ANNUAL_RATE * secondsElapsed / (365 days * RATE_PRECISION)
     *
     *       Example: 1 ETH staked for 365 days at 10% APR → 0.1 ETH reward.
     *       Example: 1 ETH staked for 1 hour at 10% APR  → ~0.00001141 ETH reward.
     *
     * @param  amount     ETH amount in wei.
     * @param  startTime  Unix timestamp the stake began.
     * @return Accrued reward in wei.
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
