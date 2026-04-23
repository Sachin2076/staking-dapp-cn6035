/**
 * NotificationBanner.js
 * ─────────────────────
 * Fixed-position risk warning banner shown below the navbar.
 * Includes a "Learn more" CTA that navigates to the Learn page.
 */

import React from "react";

export default function NotificationBanner({ message, onClose, onLearnMore }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 70,
        left: 0,
        right: 0,
        zIndex: 99,
        background: "#fff3cd",
        borderBottom: "3px solid #ffc107",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        gap: 16,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: "#856404",
          fontWeight: 500,
          flex: 1,
          textAlign: "center",
        }}
      >
        ⚠️ {message}
      </p>

      <button
        onClick={onLearnMore}
        style={{
          background: "#ffc107",
          color: "#856404",
          border: "none",
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 6,
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#ffb300";
          e.target.style.transform  = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "#ffc107";
          e.target.style.transform  = "scale(1)";
        }}
      >
        Take 2 minutes to learn more →
      </button>

      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
          color: "#856404",
          padding: "0 8px",
          lineHeight: 1,
          fontFamily: "inherit",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
      >
        ×
      </button>
    </div>
  );
}
