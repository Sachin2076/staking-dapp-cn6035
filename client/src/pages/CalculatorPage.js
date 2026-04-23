/**
 * CalculatorPage.js
 * ─────────────────
 * Interactive staking reward calculator.
 * Pulls live ETH price to show estimated USD value.
 */

import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { fetchETHPrice } from "../services/api";
import { ANNUAL_RATE } from "../utils/helpers";

export default function CalculatorPage({ onBack }) {
  const [amount,   setAmount]   = useState("1");
  const [months,   setMonths]   = useState(12);
  const [ethPrice, setEthPrice] = useState(0);

  useEffect(() => { fetchETHPrice().then(setEthPrice); }, []);

  const principal = parseFloat(amount) || 0;
  const reward    = principal * (ANNUAL_RATE / 100) * (months / 12);
  const total     = principal + reward;

  return (
    <div style={{ background: "#f7f9fc", minHeight: "100vh", paddingBottom: 80 }}>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "clamp(30px, 5vw, 50px) 24px",
          borderBottom: "4px solid #5a67d8",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.4)",
              color: "#fff",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: 8,
              marginBottom: 20,
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.3)"; e.target.style.transform = "translateX(-4px)"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.2)"; e.target.style.transform = "translateX(0)"; }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Staking Calculator
          </h1>
          <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "rgba(255,255,255,0.9)" }}>
            Estimate your potential rewards based on amount and duration.
          </p>
        </div>
      </div>

      {/* Calculator Card */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(30px, 5vw, 60px) 24px" }}>
        <div
          style={{
            background: "#fff",
            border: "2px solid #e2e8f0",
            borderRadius: 16,
            padding: "clamp(24px, 4vw, 48px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          {/* Amount Input */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: 15, fontWeight: 600, color: "#2d3748", marginBottom: 10 }}>
              Staking Amount (ETH)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.001"
              step="0.001"
              style={{
                width: "100%",
                padding: 16,
                fontSize: 18,
                border: "2px solid #e2e8f0",
                borderRadius: 10,
                boxSizing: "border-box",
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Duration Slider */}
          <div style={{ marginBottom: 40 }}>
            <label style={{ display: "block", fontSize: 15, fontWeight: 600, color: "#2d3748", marginBottom: 10 }}>
              Staking Duration: <strong>{months} months</strong>
            </label>
            <input
              type="range"
              min="1"
              max="36"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, color: "#718096" }}>
              <span>1 month</span>
              <span>36 months</span>
            </div>
          </div>

          {/* Results */}
          <div
            style={{
              background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
              padding: "clamp(20px, 3vw, 32px)",
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#718096", marginBottom: 6 }}>Initial Stake</div>
              <div style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: "#2d3748" }}>
                {principal.toFixed(4)} ETH
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#718096", marginBottom: 6 }}>
                Estimated Rewards ({ANNUAL_RATE}% APR)
              </div>
              <div style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: "#48bb78" }}>
                +{reward.toFixed(6)} ETH
              </div>
            </div>
            <div style={{ borderTop: "2px solid #cbd5e0", paddingTop: 20, marginTop: 20 }}>
              <div style={{ fontSize: 13, color: "#718096", marginBottom: 6 }}>
                Total After {months} Months
              </div>
              <div style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#2d3748", marginBottom: 8 }}>
                {total.toFixed(6)} ETH
              </div>
              {ethPrice > 0 && (
                <div style={{ fontSize: 16, color: "#4a5568" }}>
                  ≈ ${(total * ethPrice).toFixed(2)} USD
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div
            style={{
              background: "#fff3cd",
              border: "2px solid #ffc107",
              borderRadius: 10,
              padding: 16,
              fontSize: 14,
              color: "#856404",
              lineHeight: 1.6,
            }}
          >
            ⚠️ <strong>Note:</strong> Estimates are based on {ANNUAL_RATE}% APR.
            Actual rewards may vary. Gas fees are not included.
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
