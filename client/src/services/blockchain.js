/**
 * blockchain.js
 * ─────────────
 * All ethers.js / smart-contract interaction logic lives here.
 * Components call these service functions instead of touching ethers directly.
 * This separation makes the codebase easier to test and maintain.
 */

import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contractConfig";

// ─── Provider / Signer Helpers ────────────────────────────────────────────────

/** Create a read-only BrowserProvider backed by MetaMask */
export const getProvider = () =>
  new ethers.BrowserProvider(window.ethereum);

/** Return a contract instance signed by the current MetaMask account */
export const getSignedContract = async () => {
  const signer = await getProvider().getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/** Return a read-only contract instance (no signing required) */
export const getReadContract = () =>
  new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, getProvider());

// ─── Data Fetching ────────────────────────────────────────────────────────────

/**
 * Fetch all stakes and the contract balance for a given wallet address.
 * @param {string} address - The user's wallet address.
 * @returns {{ stakes: Array, contractBalance: bigint }}
 */
export const fetchChainData = async (address) => {
  const contract = getReadContract();
  const provider = getProvider();

  const raw = await contract.getUserStakes(address);
  const bal = await provider.getBalance(CONTRACT_ADDRESS);

  return {
    stakes: raw.map((s, i) => ({
      index:        i,
      amount:       s.amount,
      startTime:    s.startTime,
      lockDuration: s.lockDuration,
      withdrawn:    s.withdrawn,
    })),
    contractBalance: bal,
  };
};

// ─── Transactions ─────────────────────────────────────────────────────────────

/**
 * Submit a stake transaction.
 * @param {string} amountEth - Amount in ETH (e.g. "0.5")
 * @returns {Promise<ethers.TransactionReceipt>}
 */
export const stakeETH = async (amountEth) => {
  const contract = await getSignedContract();
  const tx = await contract.stake({
    value: ethers.parseEther(amountEth),
  });
  return tx.wait();
};

/**
 * Submit a withdraw transaction for a specific stake index.
 * @param {number} stakeIndex - Index of the stake to withdraw.
 * @returns {Promise<ethers.TransactionReceipt>}
 */
export const withdrawStake = async (stakeIndex) => {
  const contract = await getSignedContract();
  const tx = await contract.withdraw(stakeIndex);
  return tx.wait();
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

/**
 * Request MetaMask wallet connection.
 * @returns {Promise<string>} The connected wallet address.
 * @throws If MetaMask is not installed or user rejects.
 */
export const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts[0];
};
