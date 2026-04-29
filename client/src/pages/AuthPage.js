/**
 * AuthPage.js
 * ───────────
 * Login and sign-up page matching the ETH Staking app design.
 * Purple/blue gradient background, white card, matching logo style.
 *
 * Improvements over original:
 *  - Exact visual match to existing app (gradient, logo, fonts)
 *  - Real email validation (not just username)
 *  - Password strength meter on sign-up
 *  - Inline field-level error messages
 *  - Loading state on submit button
 *  - Show/hide password toggle
 *  - "Forgot password" placeholder
 *  - Risk warning banner (matches dashboard)
 *
 * NOTE: Still uses localStorage for demo. For production:
 *   → Replace handleLogin/handleSignup with real API calls
 *   → Use JWT + bcrypt hashed passwords + secure backend
 */

import React, { useState, useCallback } from "react";

// ─── helpers ────────────────────────────────────────────────────────────────
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function passwordStrength(p) {
  if (!p) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (p.length >= 8)                          score++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p))   score++;
  if (/[^A-Za-z0-9]/.test(p))               score++;
  const map = [
    null,
    { label: "Weak",   color: "#e05252" },
    { label: "Fair",   color: "#e0a952" },
    { label: "Strong", color: "#4caf7d" },
  ];
  return { score, ...map[score] };
}

// ─── sub-components ─────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PasswordInput({ id, value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          ...inputBase,
          borderColor: error ? "#e05252" : "#e2e8f0",
          paddingRight: 44,
        }}
        onFocus={(e) => { if (!error) e.target.style.borderColor = "#667eea"; }}
        onBlur={(e)  => { if (!error) e.target.style.borderColor = "#e2e8f0"; }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: "#a0aec0", padding: 0, display: "flex", alignItems: "center",
        }}
        aria-label={show ? "Hide password" : "Show password"}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

// ─── shared styles ───────────────────────────────────────────────────────────
const inputBase = {
  width: "100%",
  padding: "13px 14px",
  fontSize: 15,
  border: "2px solid #e2e8f0",
  borderRadius: 10,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
  color: "#1a202c",
  background: "#fff",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#4a5568",
  marginBottom: 7,
  letterSpacing: "0.02em",
};

const errorStyle = {
  fontSize: 12,
  color: "#e05252",
  marginTop: 5,
  minHeight: 16,
};

const gradientBtn = {
  width: "100%",
  padding: "15px 0",
  fontSize: 16,
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontFamily: "inherit",
  letterSpacing: "0.02em",
  transition: "opacity 0.15s, transform 0.1s",
};

// ─── main component ───────────────────────────────────────────────────────────
export default function AuthPage({ onLogin }) {
  const [isLogin,    setIsLogin]    = useState(true);
  const [loading,    setLoading]    = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // login fields
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPass,     setLoginPass]     = useState("");
  const [loginErrors,   setLoginErrors]   = useState({});

  // signup fields
  const [signEmail,     setSignEmail]     = useState("");
  const [signPass,      setSignPass]      = useState("");
  const [signConfirm,   setSignConfirm]   = useState("");
  const [signErrors,    setSignErrors]    = useState({});

  const strength = passwordStrength(signPass);

  // ── login submit ────────────────────────────────────────────────────────
  const handleLogin = useCallback(
    (e) => {
      e.preventDefault();
      const errs = {};
      if (!validateEmail(loginEmail))    errs.email    = "Enter a valid email address";
      if (!loginPass)                     errs.password = "Password is required";
      if (Object.keys(errs).length) { setLoginErrors(errs); return; }
      setLoginErrors({});
      setLoading(true);

      // ── REPLACE THIS BLOCK WITH A REAL API CALL ──────────────────────
      // Example:
      //   const res = await fetch("/api/auth/login", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ email: loginEmail, password: loginPass }),
      //   });
      //   const data = await res.json();
      //   if (!res.ok) { setLoginErrors({ password: data.message }); return; }
      //   onLogin(data.user);
      // ─────────────────────────────────────────────────────────────────

      // Demo localStorage fallback
      setTimeout(() => {
        setLoading(false);
        const stored = localStorage.getItem("eth_user_" + loginEmail.toLowerCase());
        if (!stored) {
          setLoginErrors({ email: "No account found. Please sign up first." });
          return;
        }
        const user = JSON.parse(stored);
        if (user.password !== loginPass) {
          setLoginErrors({ password: "Incorrect password" });
          return;
        }
        onLogin(loginEmail);
      }, 900);
    },
    [loginEmail, loginPass, onLogin]
  );

  // ── signup submit ───────────────────────────────────────────────────────
  const handleSignup = useCallback(
    (e) => {
      e.preventDefault();
      const errs = {};
      if (!validateEmail(signEmail))       errs.email    = "Enter a valid email address";
      if (signPass.length < 8)             errs.password = "Password must be at least 8 characters";
      if (signPass !== signConfirm)        errs.confirm  = "Passwords do not match";
      if (Object.keys(errs).length) { setSignErrors(errs); return; }
      setSignErrors({});
      setLoading(true);

      // ── REPLACE THIS BLOCK WITH A REAL API CALL ──────────────────────
      // Example:
      //   const res = await fetch("/api/auth/signup", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ email: signEmail, password: signPass }),
      //   });
      //   const data = await res.json();
      //   if (!res.ok) { setSignErrors({ email: data.message }); return; }
      //   onLogin(data.user);
      // ─────────────────────────────────────────────────────────────────

      // Demo localStorage fallback
      setTimeout(() => {
        setLoading(false);
        const key = "eth_user_" + signEmail.toLowerCase();
        if (localStorage.getItem(key)) {
          setSignErrors({ email: "An account with this email already exists" });
          return;
        }
        localStorage.setItem(key, JSON.stringify({ email: signEmail, password: signPass }));
        onLogin(signEmail);
      }, 1000);
    },
    [signEmail, signPass, signConfirm, onLogin]
  );

  // ── toggle tab ─────────────────────────────────────────────────────────
  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setLoginErrors({});
    setSignErrors({});
    setLoading(false);
  };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Risk Warning Banner (matches dashboard) ── */}
      {showBanner && (
        <div style={{
          width: "100%",
          maxWidth: 500,
          background: "#fefce8",
          border: "1px solid #fde68a",
          borderRadius: 10,
          padding: "10px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 13,
          color: "#92400e",
        }}>
          <span>⚠️ Don't invest unless you're prepared to lose all the money you invest. This is a high-risk platform.</span>
          <button
            onClick={() => setShowBanner(false)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#92400e", flexShrink: 0 }}
          >✕</button>
        </div>
      )}

      {/* ── Card ── */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "44px 40px 36px",
        maxWidth: 460,
        width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
      }}>

        {/* Logo — matches app header logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(102,126,234,0.4)",
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#fff",
            }} />
          </div>
        </div>

        {/* App name */}
        <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "#667eea", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
          ETH Staking
        </p>

        {/* Title */}
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a202c", textAlign: "center", marginBottom: 6 }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p style={{ fontSize: 14, color: "#718096", textAlign: "center", marginBottom: 28 }}>
          {isLogin
            ? "Sign in to access your staking dashboard"
            : "Sign up to start earning ETH rewards"}
        </p>

        {/* Tab switcher */}
        <div style={{
          display: "flex",
          background: "#f7f8fc",
          borderRadius: 10,
          padding: 4,
          marginBottom: 28,
          border: "1px solid #e2e8f0",
        }}>
          {["Sign In", "Sign Up"].map((label, i) => {
            const active = isLogin === (i === 0);
            return (
              <button
                key={label}
                onClick={() => switchTab(i === 0)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  background: active
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "transparent",
                  color: active ? "#fff" : "#718096",
                  boxShadow: active ? "0 2px 8px rgba(102,126,234,0.35)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Login Form ── */}
        {isLogin && (
          <form onSubmit={handleLogin} noValidate>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => { setLoginEmail(e.target.value); setLoginErrors((p) => ({ ...p, email: "" })); }}
                placeholder="you@example.com"
                style={{ ...inputBase, borderColor: loginErrors.email ? "#e05252" : "#e2e8f0" }}
                onFocus={(e) => { if (!loginErrors.email) e.target.style.borderColor = "#667eea"; }}
                onBlur={(e)  => { if (!loginErrors.email) e.target.style.borderColor = "#e2e8f0"; }}
              />
              <div style={errorStyle}>{loginErrors.email}</div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => alert("Forgot password — connect to your backend to send a reset email.")}
                  style={{ background: "none", border: "none", color: "#667eea", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                >
                  Forgot password?
                </button>
              </div>
              <PasswordInput
                id="login-pass"
                value={loginPass}
                onChange={(e) => { setLoginPass(e.target.value); setLoginErrors((p) => ({ ...p, password: "" })); }}
                placeholder="Enter your password"
                error={loginErrors.password}
              />
              <div style={errorStyle}>{loginErrors.password}</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...gradientBtn,
                opacity: loading ? 0.75 : 1,
                marginTop: 8,
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.target.style.opacity = "1"; }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}

        {/* ── Sign Up Form ── */}
        {!isLogin && (
          <form onSubmit={handleSignup} noValidate>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={signEmail}
                onChange={(e) => { setSignEmail(e.target.value); setSignErrors((p) => ({ ...p, email: "" })); }}
                placeholder="you@example.com"
                style={{ ...inputBase, borderColor: signErrors.email ? "#e05252" : "#e2e8f0" }}
                onFocus={(e) => { if (!signErrors.email) e.target.style.borderColor = "#667eea"; }}
                onBlur={(e)  => { if (!signErrors.email) e.target.style.borderColor = "#e2e8f0"; }}
              />
              <div style={errorStyle}>{signErrors.email}</div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Password</label>
              <PasswordInput
                id="signup-pass"
                value={signPass}
                onChange={(e) => { setSignPass(e.target.value); setSignErrors((p) => ({ ...p, password: "" })); }}
                placeholder="Min. 8 characters"
                error={signErrors.password}
              />
              {/* Password strength bar */}
              {signPass && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          background: i <= strength.score ? strength.color : "#e2e8f0",
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>
                    {strength.label}
                  </span>
                </div>
              )}
              <div style={errorStyle}>{signErrors.password}</div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Confirm Password</label>
              <PasswordInput
                id="signup-confirm"
                value={signConfirm}
                onChange={(e) => { setSignConfirm(e.target.value); setSignErrors((p) => ({ ...p, confirm: "" })); }}
                placeholder="Re-enter your password"
                error={signErrors.confirm}
              />
              <div style={errorStyle}>{signErrors.confirm}</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...gradientBtn,
                opacity: loading ? 0.75 : 1,
                marginTop: 8,
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.target.style.opacity = "1"; }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        {/* Switch tab link */}
        <p style={{ textAlign: "center", fontSize: 14, color: "#718096", marginTop: 22 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => switchTab(!isLogin)}
            style={{
              background: "none", border: "none", color: "#667eea",
              fontWeight: 700, cursor: "pointer", fontSize: 14,
              fontFamily: "inherit", textDecoration: "underline",
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>

        {/* Footer */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#a0aec0" }}>
            Secure · Decentralised · Built with Solidity
          </p>
        </div>
      </div>
    </div>
  );
}