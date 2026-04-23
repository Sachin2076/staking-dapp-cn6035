/**
 * AuthPage.js
 * ───────────
 * Login and sign-up page with form validation.
 * Uses localStorage for credential storage (demo only — see limitations).
 *
 * Limitation: Passwords stored in plaintext localStorage.
 * Production solution: JWT + hashed passwords + secure backend.
 */

import React, { useState } from "react";

export default function AuthPage({ onLogin }) {
  const [isLogin,         setIsLogin]         = useState(true);
  const [username,        setUsername]        = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");
  const [hoveredBtn,      setHoveredBtn]      = useState(false);
  const [pressedBtn,      setPressedBtn]      = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }

    if (isLogin) {
      const stored = localStorage.getItem("user_" + username);
      if (!stored) {
        setError("Account not found. Please sign up first.");
        return;
      }
      const user = JSON.parse(stored);
      if (user.password !== password) {
        setError("Incorrect password");
        return;
      }
      onLogin(username);
    } else {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (localStorage.getItem("user_" + username)) {
        setError("Username already taken");
        return;
      }
      localStorage.setItem(
        "user_" + username,
        JSON.stringify({ username, password })
      );
      onLogin(username);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: 14,
    fontSize: 15,
    border: "2px solid #e2e8f0",
    borderRadius: 10,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s ease",
    boxSizing: "border-box",
  };

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
          padding: "50px 40px",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            margin: "0 auto 24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 32, height: 32, background: "#fff", borderRadius: "50%" }} />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a202c", marginBottom: 8, textAlign: "center" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p style={{ fontSize: 15, color: "#718096", marginBottom: 32, textAlign: "center" }}>
          {isLogin
            ? "Sign in to access your staking dashboard"
            : "Sign up to start earning ETH rewards"}
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              fontSize: 14,
              color: "#c00",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2d3748", marginBottom: 8 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2d3748", marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2d3748", marginBottom: 8 }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>
          )}

          <button
            type="submit"
            onMouseDown={() => setPressedBtn(true)}
            onMouseUp={() => setPressedBtn(false)}
            onMouseEnter={() => setHoveredBtn(true)}
            onMouseLeave={() => { setHoveredBtn(false); setPressedBtn(false); }}
            style={{
              width: "100%",
              padding: "16px 32px",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              background: pressedBtn
                ? "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              transform: pressedBtn ? "scale(0.97)" : hoveredBtn ? "scale(1.03)" : "scale(1)",
              boxShadow: hoveredBtn
                ? "0 8px 24px rgba(102,126,234,0.4)"
                : "0 4px 16px rgba(102,126,234,0.3)",
              transition: "all 0.15s ease",
            }}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle Login / Signup */}
        <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#718096" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#667eea",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#a0aec0" }}>
            Secure · Decentralized · Built with Solidity
          </p>
        </div>
      </div>
    </div>
  );
}
