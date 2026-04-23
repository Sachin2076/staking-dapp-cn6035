require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * Hardhat Configuration
 * ─────────────────────
 * Networks configured:
 *   - hardhat  : ephemeral local chain (default for testing)
 *   - localhost : persistent local node started with `npx hardhat node`
 *   - sepolia   : Ethereum Sepolia testnet (set env vars in .env)
 *
 * Usage:
 *   npx hardhat compile
 *   npx hardhat node                          ← start local node
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 */

const SEPOLIA_RPC_URL   = process.env.SEPOLIA_RPC_URL   || "";
const PRIVATE_KEY       = process.env.PRIVATE_KEY        || "0x" + "0".repeat(64);
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY  || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // ── Local development chain ─────────────────────────────────────────────
    hardhat: {
      chainId: 31337,
      // Speed up mining so time-based tests are easier
      mining: {
        auto: true,
        interval: 0,
      },
    },

    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    // ── Sepolia testnet ─────────────────────────────────────────────────────
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },

  // ── Etherscan verification ────────────────────────────────────────────────
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  // ── Gas reporter (optional) ───────────────────────────────────────────────
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },

  // ── Test paths ────────────────────────────────────────────────────────────
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
};
