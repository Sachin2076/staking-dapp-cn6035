/**
 * StakeForm.js
 * ────────────
 * Form component for staking ETH.
 * Handles input, button states, and status feedback.
 */

import React, { useState } from "react";
import { ANNUAL_RATE } from "../utils/helpers";

export default function StakeForm({ account, onStake, status }) {
  const [stakeAmount, setStakeAmount]   = useState("");
  const [hoveredBtn, setHoveredBtn]     = useState(false);
  const [pressedBtn, setPressedBtn]     = useState(false);

  const handleSubmit = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    onStake(stakeAmount);
    setStakeAmount("");
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "2px solid #e2e8f0",
        borderRadius: 16,
        padding: "clamp(24px, 4vw, 40px)",
        marginBottom: 32,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#2d3748", marginBottom: 8 }}>
        Stake ETH
      </h2>
      <p style={{ fontSize: 15, color: "#718096", marginBottom: 24, lineHeight: 1.6 }}>
        Enter the amount to stake and earn {ANNUAL_RATE}% APR.
      </p>

      {/* Amount Input */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2d3748", marginBottom: 8 }}>
          Amount (ETH) — Minimum 0.001 ETH
        </label>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="0.001"
          min="0.001"
          step="0.001"
          style={{
            width: "100%",
            padding: 16,
            fontSize: 18,
            border: "2px solid #e2e8f0",
            borderRadius: 10,
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.2s ease",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>

      {/* Stake Button */}
      <button
        onClick={() => {
          setPressedBtn(true);
          setTimeout(() => { setPressedBtn(false); handleSubmit(); }, 150);
        }}
        onMouseEnter={() => setHoveredBtn(true)}
        onMouseLeave={() => { setHoveredBtn(false); setPressedBtn(false); }}
        disabled={!account}
        style={{
          width: "100%",
          padding: 16,
          fontSize: 16,
          fontWeight: 700,
          color: "#fff",
          background: !account
            ? "#cbd5e0"
            : pressedBtn
            ? "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          borderRadius: 10,
          cursor: account ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          transform: pressedBtn ? "scale(0.97)" : hoveredBtn ? "scale(1.02)" : "scale(1)",
          boxShadow: hoveredBtn
            ? "0 6px 20px rgba(102, 126, 234, 0.4)"
            : "0 2px 8px rgba(102, 126, 234, 0.2)",
          transition: "all 0.15s ease",
        }}
      >
        {account ? "Stake Now" : "Connect Wallet First"}
      </button>

      {/* Status Message */}
      {status && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            fontSize: 14,
            background: status.includes("✅")
              ? "#d4edda"
              : status.includes("❌")
              ? "#f8d7da"
              : "#edf2f7",
            color: status.includes("✅")
              ? "#155724"
              : status.includes("❌")
              ? "#721c24"
              : "#2d3748",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}
