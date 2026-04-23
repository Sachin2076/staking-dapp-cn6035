/**
 * Navbar.js
 * ─────────
 * Sticky top navigation bar.
 * Shows brand logo, page links, wallet address, and logout button.
 */

import React, { useState } from "react";

export default function Navbar({ setPage, username, onLogout }) {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  return (
    <nav
      style={{
        background: "#fff",
        height: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(16px, 3vw, 40px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "2px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Brand */}
      <div
        onClick={() => setPage("home")}
        style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 14, height: 14, background: "#fff", borderRadius: "50%" }} />
        </div>
        <span style={{ fontSize: "clamp(14px, 2vw, 17px)", fontWeight: 700, color: "#2d3748" }}>
          ETH Staking
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: "clamp(8px, 1.5vw, 16px)" }}>
        {[
          { label: "Dashboard", action: "home" },
          { label: "Learn",     action: "learn" },
          { label: "Calculator", action: "calc" },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={() => setPage(action)}
            onMouseEnter={() => setHoveredBtn(action)}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: "8px 16px",
              background: hoveredBtn === action ? "#f7fafc" : "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "clamp(12px, 1.5vw, 14px)",
              fontWeight: 600,
              color: hoveredBtn === action ? "#667eea" : "#4a5568",
              borderRadius: 8,
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* User + Logout */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: "clamp(12px, 1.5vw, 14px)", fontWeight: 600, color: "#2d3748" }}>
          {username}
        </span>
        <button
          onClick={onLogout}
          onMouseEnter={() => setHoveredBtn("logout")}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            padding: "8px 16px",
            background: hoveredBtn === "logout" ? "#e53e3e" : "transparent",
            color: hoveredBtn === "logout" ? "#fff" : "#e53e3e",
            border: "2px solid #e53e3e",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "clamp(11px, 1.5vw, 13px)",
            fontWeight: 600,
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
