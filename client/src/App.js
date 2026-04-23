/**
 * Professional Ethereum Staking Platform
 * University Submission - Production Ready
 */

import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";

const ANNUAL_RATE = 10;
const RATE_PRECISION = 100;
const YEAR_SECONDS = 365 * 24 * 3600;

const toEth = (wei) => parseFloat(ethers.formatEther(wei)).toFixed(6);
const toEth4 = (wei) => parseFloat(ethers.formatEther(wei)).toFixed(4);
const toDate = (unix) =>
  new Date(Number(unix) * 1000).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });


const calcReward = (amountWei, startTime) => {
  const elapsed = BigInt(Math.floor(Date.now() / 1000)) - BigInt(startTime);
  return (
    (BigInt(amountWei) * BigInt(ANNUAL_RATE) * elapsed) /
    (BigInt(YEAR_SECONDS) * BigInt(RATE_PRECISION))
  );
};

const lockInfo = (startTime, lockDuration) => {
  const unlockAt = Number(startTime) + Number(lockDuration);
  const remaining = unlockAt - Math.floor(Date.now() / 1000);
  if (remaining <= 0) return { text: "Ready", canWithdraw: true };
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { text: `${h}h ${m}m ${s}s`, canWithdraw: false };
};

const getProvider = () => new ethers.BrowserProvider(window.ethereum);
const getSignedCon = async () => {
  const signer = await getProvider().getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

const fetchChainData = async (address) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, getProvider());
  const provider = getProvider();
  const raw = await contract.getUserStakes(address);
  const bal = await provider.getBalance(CONTRACT_ADDRESS);
  return {
    stakes: raw.map((s, i) => ({
      index: i,
      amount: s.amount,
      startTime: s.startTime,
      lockDuration: s.lockDuration,
      withdrawn: s.withdrawn,
    })),
    contractBalance: bal,
  };
};

const fetchETHPrice = async () => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await res.json();
    return data.ethereum.usd;
  } catch {
    return 0;
  }
};

const fetchPriceHistory = async () => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily"
    );
    const data = await res.json();
    return data.prices || [];
  } catch {
    return [];
  }
};

function NotificationBanner({ message, onClose, onLearnMore }) {
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
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#ffb300";
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "#ffc107";
          e.target.style.transform = "scale(1)";
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

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [pressedBtn, setPressedBtn] = useState(false);

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
        setError("Account not found");
        return;
      }
      const user = JSON.parse(stored);
      if (user.password !== password) {
        setError("Wrong password");
        return;
      }
      onLogin(username);
    } else {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      if (password.length < 6) {
        setError("Password too short (min 6)");
        return;
      }
      if (localStorage.getItem("user_" + username)) {
        setError("Username exists");
        return;
      }
      localStorage.setItem("user_" + username, JSON.stringify({ username, password }));
      onLogin(username);
    }
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
          <div
            style={{
              width: 32,
              height: 32,
              background: "#fff",
              borderRadius: "50%",
            }}
          />
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1a202c",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#718096",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          {isLogin ? "Sign in to your dashboard" : "Sign up to start staking"}
        </p>

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
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#2d3748",
                marginBottom: 8,
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: "100%",
                padding: 14,
                fontSize: 15,
                border: "2px solid #e2e8f0",
                borderRadius: 10,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.transform = "scale(1.01)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.transform = "scale(1)";
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#2d3748",
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: 14,
                fontSize: 15,
                border: "2px solid #e2e8f0",
                borderRadius: 10,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.transform = "scale(1.01)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.transform = "scale(1)";
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#2d3748",
                  marginBottom: 8,
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                style={{
                  width: "100%",
                  padding: 14,
                  fontSize: 15,
                  border: "2px solid #e2e8f0",
                  borderRadius: 10,
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.transform = "scale(1.01)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.transform = "scale(1)";
                }}
              />
            </div>
          )}

          <button
            type="submit"
            onMouseDown={() => setPressedBtn(true)}
            onMouseUp={() => setPressedBtn(false)}
            onMouseEnter={() => setHoveredBtn(true)}
            onMouseLeave={() => {
              setHoveredBtn(false);
              setPressedBtn(false);
            }}
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
              boxShadow: pressedBtn
                ? "0 2px 8px rgba(102,126,234,0.3)"
                : hoveredBtn
                  ? "0 8px 24px rgba(102,126,234,0.4)"
                  : "0 4px 16px rgba(102,126,234,0.3)",
              transition: "all 0.15s ease",
            }}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 14,
            color: "#718096",
          }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#667eea",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: 14,
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectWalletPage({ onConnect, username }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

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
        <div style={{ fontSize: 64, marginBottom: 20 }}>🦊</div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#1a202c",
            marginBottom: 12,
          }}
        >
          Connect Wallet
        </h1>
        <p style={{ fontSize: 16, color: "#4a5568", marginBottom: 8 }}>
          Welcome, <strong>{username}</strong>!
        </p>
        <p style={{ fontSize: 16, color: "#718096", marginBottom: 40 }}>
          Connect MetaMask to start staking
        </p>
        <button
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            setPressed(false);
          }}
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
            transform: pressed ? "scale(0.97)" : hovered ? "scale(1.03)" : "scale(1)",
            boxShadow: pressed
              ? "0 2px 8px rgba(102,126,234,0.3)"
              : hovered
                ? "0 8px 24px rgba(102,126,234,0.4)"
                : "0 4px 16px rgba(102,126,234,0.3)",
            transition: "all 0.15s",
          }}
        >
          Connect MetaMask
        </button>
      </div>
    </div>
  );
}

function LearnPage({ onBack }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const topics = [
    {
      icon: "💰",
      title: "What is Staking?",
      text: "Lock your ETH in a smart contract and earn passive rewards over time. Our platform offers 10% APR with rewards calculated every second.",
    },
    {
      icon: "📊",
      title: "How Rewards Work",
      text: "Rewards = (Staked Amount × 10% × Time) / Year. Example: Staking 1 ETH for 6 months earns 0.05 ETH in rewards.",
    },
    {
      icon: "🔒",
      title: "Lock Periods",
      text: "Your ETH is locked for 1 hour before withdrawal. This prevents instant withdrawals and maintains platform stability.",
    },
    {
      icon: "⚡",
      title: "Smart Contracts",
      text: "Self-executing code on Ethereum blockchain. No intermediaries, fully transparent, and immutable once deployed.",
    },
    {
      icon: "⛽",
      title: "Gas Fees",
      text: "Small fees paid to validators for processing transactions. On local Hardhat network, gas is free for testing.",
    },
    {
      icon: "📈",
      title: "APR vs APY",
      text: "APR is simple interest (our 10%). APY includes compounding. We use APR for transparent, linear calculations.",
    },
  ];

  const faqs = [
    {
      q: "When do rewards start?",
      a: "Immediately after your stake is confirmed on the blockchain. Rewards accrue every second.",
    },
    {
      q: "Can I add to existing stakes?",
      a: "Each stake is independent. Create a new stake to add more ETH.",
    },
    {
      q: "What if I withdraw early?",
      a: "The smart contract will reject early withdrawals. You must wait until the lock period expires.",
    },
    {
      q: "Is my ETH safe?",
      a: "Your ETH is secured by the Ethereum blockchain smart contract. Always verify the contract address.",
    },
    {
      q: "How are rewards calculated?",
      a: "Rewards = (Amount × 10% × Time) / Year. Calculated on-chain every second.",
    },
    {
      q: "Can I withdraw just rewards?",
      a: "No, withdrawal includes both principal and rewards together.",
    },
  ];

  return (
    <div style={{ background: "#f7f9fc", minHeight: "100vh", paddingBottom: 80 }}>
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
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateX(-4px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateX(0)";
            }}
          >
            ← Back
          </button>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Learn About Staking
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 18px)",
              color: "rgba(255,255,255,0.9)",
              maxWidth: 600,
            }}
          >
            Master the fundamentals of decentralized staking and earn passive rewards on your ETH.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(30px, 5vw, 60px) 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {topics.map((t, i) => (
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
                cursor: "pointer",
                transform: hoveredCard === i ? "translateY(-8px)" : "translateY(0)",
                boxShadow:
                  hoveredCard === i
                    ? "0 12px 32px rgba(102,126,234,0.15)"
                    : "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{t.icon}</div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#2d3748",
                  marginBottom: 12,
                }}
              >
                {t.title}
              </h3>
              <p style={{ fontSize: 15, color: "#4a5568", lineHeight: 1.7 }}>{t.text}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 60 }}>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 32px)",
              fontWeight: 700,
              color: "#2d3748",
              marginBottom: 24,
            }}
          >
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => {
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
                  <span
                    style={{
                      fontSize: 20,
                      transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                    }}
                  >
                    ▼
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isExpanded ? 200 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <p
                    style={{
                      padding: "0 20px 20px",
                      fontSize: 15,
                      color: "#4a5568",
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CalculatorPage({ onBack }) {
  const [amount, setAmount] = useState("1");
  const [months, setMonths] = useState(12);
  const [ethPrice, setEthPrice] = useState(0);

  useEffect(() => {
    fetchETHPrice().then(setEthPrice);
  }, []);

  const principal = parseFloat(amount) || 0;
  const reward = principal * (ANNUAL_RATE / 100) * (months / 12);
  const total = principal + reward;

  return (
    <div style={{ background: "#f7f9fc", minHeight: "100vh", paddingBottom: 80 }}>
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
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateX(-4px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateX(0)";
            }}
          >
            ← Back
          </button>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Staking Calculator
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 18px)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Calculate your potential rewards
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "clamp(30px, 5vw, 60px) 24px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "2px solid #e2e8f0",
            borderRadius: 16,
            padding: "clamp(24px, 4vw, 48px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <label
              style={{
                display: "block",
                fontSize: 15,
                fontWeight: 600,
                color: "#2d3748",
                marginBottom: 10,
              }}
            >
              Amount (ETH)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: 16,
                fontSize: 18,
                border: "2px solid #e2e8f0",
                borderRadius: 10,
                boxSizing: "border-box",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.transform = "scale(1.01)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.transform = "scale(1)";
              }}
            />
          </div>

          <div style={{ marginBottom: 40 }}>
            <label
              style={{
                display: "block",
                fontSize: 15,
                fontWeight: 600,
                color: "#2d3748",
                marginBottom: 10,
              }}
            >
              Duration: {months} months
            </label>
            <input
              type="range"
              min="1"
              max="36"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              style={{ width: "100%", cursor: "pointer" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 13,
                color: "#718096",
              }}
            >
              <span>1 month</span>
              <span>36 months</span>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
              padding: "clamp(20px, 3vw, 32px)",
              borderRadius: 12,
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#718096", marginBottom: 6 }}>Initial Stake</div>
              <div
                style={{
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: 700,
                  color: "#2d3748",
                }}
              >
                {principal.toFixed(4)} ETH
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#718096", marginBottom: 6 }}>
                Estimated Rewards ({ANNUAL_RATE}% APR)
              </div>
              <div
                style={{
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: 700,
                  color: "#48bb78",
                }}
              >
                +{reward.toFixed(6)} ETH
              </div>
            </div>
            <div
              style={{
                borderTop: "2px solid #cbd5e0",
                paddingTop: 20,
                marginTop: 20,
              }}
            >
              <div style={{ fontSize: 13, color: "#718096", marginBottom: 6 }}>
                Total After {months} Months
              </div>
              <div
                style={{
                  fontSize: "clamp(24px, 4vw, 36px)",
                  fontWeight: 700,
                  color: "#2d3748",
                  marginBottom: 8,
                }}
              >
                {total.toFixed(6)} ETH
              </div>
              {ethPrice > 0 && (
                <div style={{ fontSize: 16, color: "#4a5568" }}>
                  ≈ ${(total * ethPrice).toFixed(2)} USD
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp({ account, username, onLogout }) {
  const [page, setPage] = useState("home");
  const [stakes, setStakes] = useState([]);
  const [contractBalance, setContractBalance] = useState(0n);
  const [stakeAmount, setStakeAmount] = useState("");
  const [status, setStatus] = useState("");
  const [liveRewards, setLiveRewards] = useState({});
  const [ethPrice, setEthPrice] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [notification, setNotification] = useState(
    "Don't invest unless you're prepared to lose all the money you invest. This is a high-risk platform and you should not expect to be protected if something goes wrong."
  );
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [pressedBtn, setPressedBtn] = useState(null);

  useEffect(() => {
    fetchETHPrice().then(setEthPrice);
    fetchPriceHistory().then(setPriceHistory);
  }, []);

  const loadData = useCallback(async () => {
    if (!account) return;
    try {
      const data = await fetchChainData(account);
      setStakes(data.stakes);
      setContractBalance(data.contractBalance);
    } catch (err) {
      console.error(err);
    }
  }, [account]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = {};
      stakes.forEach((s) => {
        if (!s.withdrawn) updated[s.index] = calcReward(s.amount, s.startTime);
      });
      setLiveRewards(updated);
    }, 1000);
    return () => clearInterval(timer);
  }, [stakes]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setStatus("Enter valid amount");
      return;
    }
    try {
      setStatus("Processing...");
      const contract = await getSignedCon();
      const tx = await contract.stake({
        value: ethers.parseEther(stakeAmount),
      });
      await tx.wait();
      setStatus("✅ Staked successfully!");
      setStakeAmount("");
      loadData();
    } catch (err) {
      setStatus("❌ Transaction failed");
    }
  };

  const handleWithdraw = async (index) => {
    try {
      setStatus("Withdrawing...");
      const contract = await getSignedCon();
      const tx = await contract.withdraw(index);
      await tx.wait();
      setStatus("✅ Withdrawn successfully!");
      loadData();
    } catch (err) {
      setStatus("❌ Withdrawal failed");
    }
  };

  const activeStakes = stakes.filter((s) => !s.withdrawn);
  const totalStaked = activeStakes.reduce((sum, s) => sum + BigInt(s.amount), 0n);
  const totalRewards = Object.values(liveRewards).reduce((sum, r) => sum + r, 0n);

  const chartWidth = 600;
  const chartHeight = 180;
  const padding = 30;
  let pathData = "";

  if (priceHistory.length > 0) {
    const prices = priceHistory.map((p) => p[1]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    pathData = priceHistory
      .map((p, i) => {
        const x = padding + (i / (priceHistory.length - 1)) * (chartWidth - padding * 2);
        const y =
          padding +
          (chartHeight - padding * 2) -
          ((p[1] - minPrice) / range) * (chartHeight - padding * 2);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }

  if (page === "learn") return <LearnPage onBack={() => setPage("home")} />;
  if (page === "calc") return <CalculatorPage onBack={() => setPage("home")} />;

  return (
    <div style={{ background: "#f7f9fc", minHeight: "100vh" }}>
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
        <div
          onClick={() => setPage("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
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
            <div
              style={{
                width: 14,
                height: 14,
                background: "#fff",
                borderRadius: "50%",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "clamp(14px, 2vw, 17px)",
              fontWeight: 700,
              color: "#2d3748",
            }}
          >
            ETH Staking
          </span>
        </div>

        <div style={{ display: "flex", gap: "clamp(8px, 1.5vw, 16px)" }}>
          {[
            { label: "Dashboard", action: "home" },
            { label: "Learn", action: "learn" },
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

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span
            style={{
              fontSize: "clamp(12px, 1.5vw, 14px)",
              fontWeight: 600,
              color: "#2d3748",
            }}
          >
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
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <NotificationBanner
        message={notification}
        onClose={() => setNotification("")}
        onLearnMore={() => setPage("learn")}
      />

      <div style={{ marginTop: notification ? 60 : 0 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "clamp(40px, 6vw, 80px) 24px",
            borderBottom: "4px solid #5a67d8",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h1
              style={{
                fontSize: "clamp(32px, 6vw, 56px)",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 20,
              }}
            >
              Ethereum Staking
            </h1>
            <p
              style={{
                fontSize: "clamp(16px, 2.5vw, 22px)",
                color: "rgba(255,255,255,0.9)",
                marginBottom: 40,
              }}
            >
              Earn up to {ANNUAL_RATE}% APR by staking ETH
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 20,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  padding: 24,
                  borderRadius: 12,
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    marginBottom: 8,
                  }}
                >
                  Total Staked
                </div>
                <div
                  style={{
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {toEth4(totalStaked)} ETH
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  padding: 24,
                  borderRadius: 12,
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    marginBottom: 8,
                  }}
                >
                  Rewards Earned
                </div>
                <div
                  style={{
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 700,
                    color: "#48bb78",
                  }}
                >
                  {toEth(totalRewards)} ETH
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  padding: 24,
                  borderRadius: 12,
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    marginBottom: 8,
                  }}
                >
                  Annual Rate
                </div>
                <div
                  style={{
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {ANNUAL_RATE}% APR
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Stake Section (Kraken Style) */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "clamp(40px, 6vw, 80px) 24px",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 700,
                color: "#1a202c",
                marginBottom: 12,
              }}
            >
              Why stake Ethereum on our platform?
            </h2>
            <p
              style={{
                fontSize: "clamp(14px, 2vw, 16px)",
                color: "#718096",
                marginBottom: 48,
              }}
            >
              Learn why staking with us is secure, profitable, and easy.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 32,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: 12,
                  }}
                >
                  Fast. Easy. No minimums
                </h3>
                <p style={{ fontSize: 15, color: "#4a5568", lineHeight: 1.7 }}>
                  Stake any amount of ETH with just a few clicks. No minimum requirements, instant
                  rewards.
                </p>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: 12,
                  }}
                >
                  Smart Contract Integration
                </h3>
                <p style={{ fontSize: 15, color: "#4a5568", lineHeight: 1.7 }}>
                  Direct blockchain interaction. Transparent, secure, and fully decentralized
                  staking.
                </p>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: 12,
                  }}
                >
                  World-class security
                </h3>
                <p style={{ fontSize: 15, color: "#4a5568", lineHeight: 1.7 }}>
                  Your funds remain safe with audited smart contracts and MetaMask integration.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "clamp(30px, 5vw, 60px) 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: window.innerWidth > 1024 ? "1fr 350px" : "1fr",
              gap: 32,
            }}
          >
            <div>
              {/* Stake Section */}
              <div
                style={{
                  background: "#fff",
                  border: "2px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "clamp(24px, 4vw, 40px)",
                  marginBottom: 32,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(24px, 3vw, 32px)",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: 24,
                  }}
                >
                  Stake ETH
                </h2>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: 16,
                    fontSize: 18,
                    border: "2px solid #e2e8f0",
                    borderRadius: 10,
                    marginBottom: 20,
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.transform = "scale(1.01)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.transform = "scale(1)";
                  }}
                />

                <button
                  onClick={handleStake}
                  disabled={!account}
                  onMouseDown={() => setPressedBtn("stake")}
                  onMouseUp={() => setPressedBtn(null)}
                  onMouseEnter={() => setHoveredBtn("stake")}
                  onMouseLeave={() => {
                    setHoveredBtn(null);
                    setPressedBtn(null);
                  }}
                  style={{
                    width: "100%",
                    padding: 16,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#fff",
                    background: !account
                      ? "#cbd5e0"
                      : pressedBtn === "stake"
                        ? "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 10,
                    cursor: account ? "pointer" : "not-allowed",
                    transform:
                      pressedBtn === "stake"
                        ? "scale(0.97)"
                        : hoveredBtn === "stake"
                          ? "scale(1.02)"
                          : "scale(1)",
                    boxShadow:
                      pressedBtn === "stake"
                        ? "0 2px 8px rgba(102,126,234,0.3)"
                        : hoveredBtn === "stake"
                          ? "0 6px 20px rgba(102,126,234,0.4)"
                          : "0 2px 8px rgba(102,126,234,0.2)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {account ? "Stake Now" : "Connect Wallet"}
                </button>

                {status && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 14,
                      background: status.includes("✅")
                        ? "#d4edda"
                        : status.includes("❌")
                          ? "#f8d7da"
                          : "#edf2f7",
                      color: status.includes("✅")
                        ? "#155724"
                        : status.includes("❌")
                          ? "#721c24"
                          : "#2d3748",
                    }}
                  >
                    {status}
                  </div>
                )}
              </div>

              {/* Stakes Table */}
              <div
                style={{
                  background: "#fff",
                  border: "2px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "clamp(24px, 4vw, 40px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(24px, 3vw, 32px)",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: 24,
                  }}
                >
                  My Stakes
                </h2>

                {stakes.length === 0 ? (
                  <div
                    style={{
                      padding: 48,
                      textAlign: "center",
                      background: "#f7fafc",
                      borderRadius: 12,
                      color: "#718096",
                    }}
                  >
                    No stakes yet. Start staking to earn rewards!
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 800,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "2px solid #e2e8f0",
                            background: "#f7fafc",
                          }}
                        >
                          <th
                            style={{
                              padding: 16,
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#4a5568",
                            }}
                          >
                            #
                          </th>
                          <th
                            style={{
                              padding: 16,
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#4a5568",
                            }}
                          >
                            Amount
                          </th>
                          <th
                            style={{
                              padding: 16,
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#4a5568",
                            }}
                          >
                            Started
                          </th>
                          <th
                            style={{
                              padding: 16,
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#4a5568",
                            }}
                          >
                            Rewards
                          </th>
                          <th
                            style={{
                              padding: 16,
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#4a5568",
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              padding: 16,
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#4a5568",
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stakes.map((s) => {
                          const reward = liveRewards[s.index] || 0n;
                          const lock = lockInfo(s.startTime, s.lockDuration);
                          const canW = lock.canWithdraw && !s.withdrawn;

                          return (
                            <tr key={s.index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: 16, fontWeight: 600 }}>{s.index + 1}</td>
                              <td style={{ padding: 16, fontWeight: 700 }}>
                                {toEth4(s.amount)} ETH
                              </td>
                              <td
                                style={{
                                  padding: 16,
                                  fontSize: 13,
                                  color: "#718096",
                                }}
                              >
                                {toDate(s.startTime)}
                              </td>
                              <td
                                style={{
                                  padding: 16,
                                  fontWeight: 700,
                                  color: s.withdrawn ? "#a0aec0" : "#48bb78",
                                }}
                              >
                                {s.withdrawn ? "—" : toEth(reward) + " ETH"}
                              </td>
                              <td style={{ padding: 16, fontSize: 12 }}>
                                {s.withdrawn ? "Withdrawn" : lock.canWithdraw ? "Ready" : lock.text}
                              </td>
                              <td style={{ padding: 16 }}>
                                <button
                                  disabled={!canW}
                                  onClick={() => handleWithdraw(s.index)}
                                  onMouseDown={() => setPressedBtn(`w${s.index}`)}
                                  onMouseUp={() => setPressedBtn(null)}
                                  onMouseEnter={() => setHoveredBtn(`w${s.index}`)}
                                  onMouseLeave={() => {
                                    setHoveredBtn(null);
                                    setPressedBtn(null);
                                  }}
                                  style={{
                                    background: canW
                                      ? pressedBtn === `w${s.index}`
                                        ? "#5568d3"
                                        : "#667eea"
                                      : "#e2e8f0",
                                    color: canW ? "#fff" : "#a0aec0",
                                    border: "none",
                                    padding: "10px 20px",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: canW ? "pointer" : "not-allowed",
                                    borderRadius: 8,
                                    transition: "all 0.15s",
                                    transform:
                                      pressedBtn === `w${s.index}`
                                        ? "scale(0.95)"
                                        : hoveredBtn === `w${s.index}` && canW
                                          ? "scale(1.05)"
                                          : "scale(1)",
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
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div
                style={{
                  position: window.innerWidth > 1024 ? "sticky" : "static",
                  top: notification ? 148 : 88,
                }}
              >
                <div
                  style={{
                    background: "#fff3cd",
                    border: "2px solid #ffc107",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#856404",
                      marginBottom: 8,
                    }}
                  >
                    ⚠️ Important
                  </div>
                  <p style={{ fontSize: 14, color: "#856404", margin: 0 }}>
                    Lock: 1 hour. {ANNUAL_RATE}% APR. Verify contract address.
                  </p>
                </div>

                <div
                  style={{
                    background: "#fff",
                    border: "2px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 24,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#2d3748",
                      marginBottom: 4,
                    }}
                  >
                    ETH Price
                  </h3>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#667eea",
                      marginBottom: 16,
                    }}
                  >
                    ${ethPrice > 0 ? ethPrice.toLocaleString() : "—"}
                  </div>
                  {priceHistory.length > 0 && (
                    <svg width="100%" height="140" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#667eea" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`${pathData} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
                        fill="url(#grad)"
                      />
                      <path d={pathData} stroke="#667eea" strokeWidth="3" fill="none" />
                    </svg>
                  )}
                  <div
                    style={{
                      fontSize: 12,
                      color: "#718096",
                      marginTop: 8,
                      textAlign: "center",
                    }}
                  >
                    Last 7 days
                  </div>
                </div>

                <div
                  style={{
                    background: "#fff",
                    border: "2px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#2d3748",
                      marginBottom: 12,
                    }}
                  >
                    Contract
                  </h3>
                  <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>TVL:</strong> {toEth4(contractBalance)} ETH
                    </div>
                    <div>
                      <strong>APR:</strong> {ANNUAL_RATE}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer
          style={{
            background: "#2d3748",
            borderTop: "4px solid #667eea",
            padding: 24,
            textAlign: "center",
            color: "#a0aec0",
            fontSize: 14,
          }}
        >
          Decentralized Staking Platform — Built with Solidity · Hardhat · React
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  const [account, setAccount] = useState(null);
  const [username, setUsername] = useState("");
  const [stage, setStage] = useState("auth");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setStage("app");
    } catch (err) {
      console.error(err);
    }
  };

  if (stage === "auth")
    return (
      <AuthPage
        onLogin={(u) => {
          setUsername(u);
          setStage("connect");
        }}
      />
    );
  if (stage === "connect")
    return <ConnectWalletPage username={username} onConnect={connectWallet} />;
  return (
    <MainApp
      account={account}
      username={username}
      onLogout={() => {
        setAccount(null);
        setUsername("");
       setStage("auth");
  }}
  />
);
}