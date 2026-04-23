/**
 * LearnPage.js
 * ────────────
 * Educational page covering staking fundamentals.
 * Includes topic cards with hover animations and an expandable FAQ section.
 */

import React, { useState } from "react";
import Footer from "../components/Footer";

const TOPICS = [
  { icon: "💰", title: "What is Staking?",   text: "Lock your ETH in a smart contract and earn passive rewards over time. Our platform offers 10% APR with rewards calculated every second." },
  { icon: "📊", title: "How Rewards Work",   text: "Rewards = (Staked Amount × 10% × Time) / Year. Example: Staking 1 ETH for 6 months earns 0.05 ETH in rewards." },
  { icon: "🔒", title: "Lock Periods",       text: "Your ETH is locked for 1 hour before withdrawal. This prevents instant withdrawals and maintains platform stability." },
  { icon: "⚡", title: "Smart Contracts",    text: "Self-executing code on Ethereum blockchain. No intermediaries, fully transparent, and immutable once deployed." },
  { icon: "⛽", title: "Gas Fees",           text: "Small fees paid to validators for processing transactions. On Hardhat local network, gas is free for testing." },
  { icon: "📈", title: "APR vs APY",         text: "APR is simple interest (our 10%). APY includes compounding. We use APR for transparent, linear calculations." },
];

const FAQS = [
  { q: "When do rewards start?",       a: "Immediately after your stake is confirmed on the blockchain. Rewards accrue every second." },
  { q: "Can I add to existing stakes?", a: "Each stake is independent. Create a new stake to add more ETH." },
  { q: "What if I withdraw early?",    a: "The smart contract will reject early withdrawals. You must wait until the lock period expires." },
  { q: "Is my ETH safe?",              a: "Your ETH is secured by the Ethereum blockchain smart contract. Always verify the contract address." },
  { q: "How are rewards calculated?",  a: "Rewards = (Amount × 10% × Time) / Year. Calculated on-chain every second." },
  { q: "Can I withdraw just rewards?", a: "No, withdrawal includes both principal and rewards together in one transaction." },
];

export default function LearnPage({ onBack }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

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
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
            Learn About Staking
          </h1>
          <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "rgba(255,255,255,0.9)", maxWidth: 600 }}>
            Master the fundamentals of decentralized staking and earn passive rewards on your ETH.
          </p>
        </div>
      </div>

      {/* Topic Cards */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(30px, 5vw, 60px) 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {TOPICS.map((t, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: "#fff",
                border: "2px solid #e2e8f0",
                borderRadius: 16,
                padding: 28,
                transition: "all 0.3s ease",
                cursor: "default",
                transform: hoveredCard === i ? "translateY(-8px)" : "translateY(0)",
                boxShadow: hoveredCard === i
                  ? "0 12px 32px rgba(102,126,234,0.15)"
                  : "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{t.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#2d3748", marginBottom: 12 }}>{t.title}</h3>
              <p style={{ fontSize: 15, color: "#4a5568", lineHeight: 1.7 }}>{t.text}</p>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, color: "#2d3748", marginBottom: 24 }}>
            Frequently Asked Questions
          </h2>
          {FAQS.map((faq, i) => {
            const isExpanded = expandedFAQ === i;
            return (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "2px solid #e2e8f0",
                  borderRadius: 12,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <button
                  onClick={() => setExpandedFAQ(isExpanded ? null : i)}
                  style={{
                    width: "100%",
                    padding: 20,
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: "inherit",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#2d3748",
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 20, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>
                    ▼
                  </span>
                </button>
                <div style={{ maxHeight: isExpanded ? 200 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
                  <p style={{ padding: "0 20px 20px", fontSize: 15, color: "#4a5568", lineHeight: 1.7 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
