/**
 * helpers.js
 * ──────────
 * Pure utility functions shared across components.
 * No side effects, no blockchain calls — just data formatting.
 */

import { ethers } from "ethers";

// ─── Constants ────────────────────────────────────────────────────────────────
export const ANNUAL_RATE    = 10;
export const RATE_PRECISION = 100;
export const YEAR_SECONDS   = 365 * 24 * 3600;

// ─── Formatters ───────────────────────────────────────────────────────────────

/** Format wei to ETH with 6 decimal places */
export const toEth = (wei) =>
  parseFloat(ethers.formatEther(wei)).toFixed(6);

/** Format wei to ETH with 4 decimal places */
export const toEth4 = (wei) =>
  parseFloat(ethers.formatEther(wei)).toFixed(4);

/** Format unix timestamp to readable date string */
export const toDate = (unix) =>
  new Date(Number(unix) * 1000).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Truncate an Ethereum address: 0xABCD...1234 */
export const truncAddr = (a) =>
  a ? a.slice(0, 6) + "..." + a.slice(-4) : "—";

// ─── Staking Calculations ─────────────────────────────────────────────────────

/**
 * Calculate the accrued reward for a stake using the same linear formula
 * as the smart contract:
 *   reward = amount * ANNUAL_RATE * elapsed / (YEAR_SECONDS * RATE_PRECISION)
 */
export const calcReward = (amountWei, startTime) => {
  const elapsed =
    BigInt(Math.floor(Date.now() / 1000)) - BigInt(startTime);
  return (
    (BigInt(amountWei) * BigInt(ANNUAL_RATE) * elapsed) /
    (BigInt(YEAR_SECONDS) * BigInt(RATE_PRECISION))
  );
};

/**
 * Return lock status for a stake.
 * @returns {{ text: string, canWithdraw: boolean }}
 */
export const lockInfo = (startTime, lockDuration) => {
  const unlockAt  = Number(startTime) + Number(lockDuration);
  const remaining = unlockAt - Math.floor(Date.now() / 1000);
  if (remaining <= 0) return { text: "Ready", canWithdraw: true };
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { text: `${h}h ${m}m ${s}s`, canWithdraw: false };
};
