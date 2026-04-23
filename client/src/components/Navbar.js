/**
 * Navbar.js — fully responsive with hamburger menu for mobile
 */
import React, { useState } from "react";

export default function Navbar({ setPage, username, onLogout, account, onConnectWallet }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (label, action) => (
    <button
      key={label}
      onClick={() => { setPage(action); setMenuOpen(false); }}
      style={{
        padding: "10px 16px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 600,
        color: "#4a5568",
        borderRadius: 8,
        fontFamily: "inherit",
        textAlign: "left",
        width: "100%",
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-user-desktop  { display: none !important; }
          .nav-hamburger     { display: flex !important; }
        }
        @media (min-width: 641px) {
          .nav-mobile-menu   { display: none !important; }
          .nav-hamburger     { display: none !important; }
        }
      `}</style>

      <nav style={{
        background: "#fff",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 200,
        borderBottom: "2px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>

        {/* Brand */}
        <div onClick={() => setPage("home")}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 13, height: 13, background: "#fff", borderRadius: "50%" }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#2d3748" }}>ETH Staking</span>
        </div>

        {/* Desktop nav links */}
        <div className="nav-links-desktop" style={{ display: "flex", gap: 4 }}>
          {[["Dashboard","home"],["Learn","learn"],["Calculator","calc"]].map(([l,a]) => (
            <button key={l} onClick={() => setPage(a)} style={{
              padding: "8px 14px", background: "transparent", border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#4a5568",
              borderRadius: 8, fontFamily: "inherit",
            }}>{l}</button>
          ))}
        </div>

        {/* Desktop user actions */}
        <div className="nav-user-desktop" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#2d3748" }}>{username}</span>
          {!account && (
            <button onClick={onConnectWallet} style={{
              padding: "8px 14px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff", border: "none", borderRadius: 8,
              cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            }}>🦊 Connect</button>
          )}
          <button onClick={onLogout} style={{
            padding: "8px 14px", background: "transparent",
            color: "#e53e3e", border: "2px solid #e53e3e",
            borderRadius: 8, cursor: "pointer", fontSize: 13,
            fontWeight: 600, fontFamily: "inherit",
          }}>Logout</button>
        </div>

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none", flexDirection: "column", gap: 5,
            background: "transparent", border: "none", cursor: "pointer", padding: 8,
          }}
        >
          <span style={{ width: 24, height: 2, background: "#2d3748", display: "block",
            transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
            transition: "all 0.2s" }} />
          <span style={{ width: 24, height: 2, background: "#2d3748", display: "block",
            opacity: menuOpen ? 0 : 1, transition: "all 0.2s" }} />
          <span style={{ width: 24, height: 2, background: "#2d3748", display: "block",
            transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
            transition: "all 0.2s" }} />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      <div className="nav-mobile-menu" style={{
        display: menuOpen ? "block" : "none",
        position: "fixed", top: 64, left: 0, right: 0,
        background: "#fff", zIndex: 199,
        borderBottom: "2px solid #e2e8f0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        padding: "8px 16px 16px",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#718096",
          padding: "8px 16px 4px", textTransform: "uppercase", letterSpacing: 1 }}>
          Hi, {username}
        </div>
        {navLink("Dashboard", "home")}
        {navLink("Learn", "learn")}
        {navLink("Calculator", "calc")}
        <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 8, paddingTop: 8 }}>
          {!account && (
            <button onClick={() => { onConnectWallet(); setMenuOpen(false); }} style={{
              width: "100%", padding: "12px 16px", marginBottom: 8,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff", border: "none", borderRadius: 8,
              cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit",
            }}>🦊 Connect Wallet</button>
          )}
          <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{
            width: "100%", padding: "12px 16px",
            background: "transparent", color: "#e53e3e",
            border: "2px solid #e53e3e", borderRadius: 8,
            cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit",
          }}>Logout</button>
        </div>
      </div>
    </>
  );
}