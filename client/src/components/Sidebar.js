/**
 * Sidebar.js
 * ──────────
 * Sticky right-hand sidebar shown on the dashboard.
 * Contains risk warning, ETH price chart, and contract details.
 */

import React from "react";
import PriceChart from "./PriceChart";
import { toEth4, ANNUAL_RATE } from "../utils/helpers";
import { CONTRACT_ADDRESS } from "../contractConfig";

export default function Sidebar({
  ethPrice,
  priceHistory,
  contractBalance,
  notificationVisible,
}) {
  const stickyTop = notificationVisible ? 148 : 88;

  return (
    <div>
      <div style={{ position: "sticky", top: stickyTop }}>

        {/* Risk Warning */}
        <div
          style={{
            background: "#fff3cd",
            border: "2px solid #ffc107",
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: "#856404", marginBottom: 8 }}>
            ⚠️ Important
          </div>
          <p style={{ fontSize: 14, color: "#856404", margin: 0, lineHeight: 1.6 }}>
            Lock period: 1 hour. Rewards at {ANNUAL_RATE}% APR. Always verify
            the contract address before staking.
          </p>
        </div>

        {/* ETH Price Chart */}
        <PriceChart ethPrice={ethPrice} priceHistory={priceHistory} />

        {/* Contract Details */}
        <div
          style={{
            background: "#fff",
            border: "2px solid #e2e8f0",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d3748", marginBottom: 12 }}>
            Contract Details
          </h3>
          <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.9 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Address:</strong>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#718096",
                  wordBreak: "break-all",
                  marginTop: 4,
                }}
              >
                {CONTRACT_ADDRESS}
              </div>
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>TVL:</strong> {toEth4(contractBalance)} ETH
            </div>
            <div>
              <strong>APR:</strong> {ANNUAL_RATE}%
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
