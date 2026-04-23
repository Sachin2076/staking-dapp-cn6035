/**
 * Footer.js
 * ─────────
 * Simple site footer shown at the bottom of every page.
 */

import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#2d3748",
        borderTop: "4px solid #667eea",
        marginTop: 80,
        padding: 24,
        textAlign: "center",
        color: "#a0aec0",
        fontSize: 14,
      }}
    >
      Decentralized Staking Platform — Built with Solidity · Hardhat · ethers.js · React
    </footer>
  );
}
