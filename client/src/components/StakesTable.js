/**
 * StakesTable.js
 * ──────────────
 * Displays all user stakes in a responsive table.
 * Shows live rewards, lock status, and a withdraw button per row.
 */

import React, { useState } from "react";
import { toEth, toEth4, toDate, lockInfo } from "../utils/helpers";

export default function StakesTable({ stakes, liveRewards, onWithdraw, status }) {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [pressedBtn, setPressedBtn] = useState(null);

  if (stakes.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "2px solid #e2e8f0",
          borderRadius: 16,
          padding: "clamp(24px, 4vw, 40px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#2d3748", marginBottom: 24 }}>
          My Stakes
        </h2>
        <div
          style={{
            padding: 48,
            textAlign: "center",
            background: "#f7fafc",
            borderRadius: 12,
            color: "#718096",
            fontSize: 16,
          }}
        >
          No stakes yet. Start staking above to earn rewards!
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "2px solid #e2e8f0",
        borderRadius: 16,
        padding: "clamp(24px, 4vw, 40px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#2d3748", marginBottom: 8 }}>
        My Stakes
      </h2>
      <p style={{ fontSize: 15, color: "#718096", marginBottom: 24 }}>
        View and manage all your active and completed stakes.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750, fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", background: "#f7fafc" }}>
              {["#", "Amount", "Started", "Live Rewards", "Status", "Action"].map((h) => (
                <th key={h} style={{ padding: 16, textAlign: "left", fontWeight: 600, color: "#4a5568" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stakes.map((s) => {
              const reward = liveRewards[s.index] || 0n;
              const lock   = lockInfo(s.startTime, s.lockDuration);
              const canW   = lock.canWithdraw && !s.withdrawn;

              const stakeStatus = s.withdrawn
                ? "withdrawn"
                : lock.canWithdraw
                ? "unlocked"
                : "locked";

              const statusStyle = {
                withdrawn: { bg: "#e2e8f0", color: "#718096", label: "Withdrawn" },
                unlocked:  { bg: "#c6f6d5", color: "#276749", label: "Ready" },
                locked:    { bg: "#fed7d7", color: "#742a2a", label: lock.text },
              }[stakeStatus];

              return (
                <tr
                  key={s.index}
                  style={{ borderBottom: "1px solid #e2e8f0", transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f7fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 16, fontWeight: 600, color: "#2d3748" }}>{s.index + 1}</td>
                  <td style={{ padding: 16, fontWeight: 700, color: "#2d3748" }}>{toEth4(s.amount)} ETH</td>
                  <td style={{ padding: 16, fontSize: 13, color: "#718096" }}>{toDate(s.startTime)}</td>
                  <td style={{ padding: 16, fontWeight: 700, color: s.withdrawn ? "#a0aec0" : "#48bb78" }}>
                    {s.withdrawn ? "—" : toEth(reward) + " ETH"}
                  </td>
                  <td style={{ padding: 16 }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        borderRadius: 6,
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <button
                      disabled={!canW}
                      onClick={() => {
                        setPressedBtn(`w${s.index}`);
                        setTimeout(() => { setPressedBtn(null); onWithdraw(s.index); }, 150);
                      }}
                      onMouseEnter={() => setHoveredBtn(`w${s.index}`)}
                      onMouseLeave={() => { setHoveredBtn(null); setPressedBtn(null); }}
                      style={{
                        background: canW
                          ? pressedBtn === `w${s.index}` ? "#5568d3" : "#667eea"
                          : "#e2e8f0",
                        color: canW ? "#fff" : "#a0aec0",
                        border: "none",
                        padding: "10px 20px",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: canW ? "pointer" : "not-allowed",
                        borderRadius: 8,
                        fontFamily: "inherit",
                        transform:
                          pressedBtn === `w${s.index}`
                            ? "scale(0.95)"
                            : hoveredBtn === `w${s.index}` && canW
                            ? "scale(1.05)"
                            : "scale(1)",
                        transition: "all 0.15s",
                      }}
                    >
                      {s.withdrawn ? "Done" : "Withdraw"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
