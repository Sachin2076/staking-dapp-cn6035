/**
 * ConnectWalletPage.js
 * ────────────────────
 * Shown after successful login, before wallet is connected.
 * Prompts the user to connect MetaMask.
 */

import React, { useState } from "react";

export default function ConnectWalletPage({ onConnect, onGuest, username }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hoveredGuest, setHoveredGuest] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "60px 50px",
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 20 }}>🦊</div>

        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a202c", marginBottom: 12 }}>
          Connect Your Wallet
        </h1>
        <p style={{ fontSize: 16, color: "#4a5568", marginBottom: 8 }}>
          Welcome back, <strong>{username}</strong>!
        </p>
        <p style={{ fontSize: 16, color: "#718096", marginBottom: 40, lineHeight: 1.6 }}>
          Connect MetaMask to access the staking platform
          and start earning rewards.
        </p>

        <button
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setPressed(false); }}
          onClick={onConnect}
          style={{
            width: "100%",
            padding: "18px 32px",
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            background: pressed
              ? "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            transform: pressed ? "scale(0.97)" : hovered ? "scale(1.03)" : "scale(1)",
            boxShadow: hovered
              ? "0 8px 24px rgba(102,126,234,0.4)"
              : "0 4px 16px rgba(102,126,234,0.3)",
            transition: "all 0.15s ease",
          }}
        >
          Connect MetaMask
        </button>

        {/* Guest Mode */}
        <button
          onClick={onGuest}
          onMouseEnter={() => setHoveredGuest(true)}
          onMouseLeave={() => setHoveredGuest(false)}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "14px 32px",
            fontSize: 15,
            fontWeight: 600,
            color: hoveredGuest ? "#667eea" : "#718096",
            background: "transparent",
            border: `2px solid ${hoveredGuest ? "#667eea" : "#e2e8f0"}`,
            borderRadius: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
          }}
        >
          👀 Browse Without Wallet
        </button>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: 13, color: "#a0aec0", lineHeight: 1.6 }}>
            Browse mode lets you explore the platform. Connect MetaMask to stake ETH and earn rewards.
          </p>
        </div>
      </div>
    </div>
  );
}