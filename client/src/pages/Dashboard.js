/**
 * Dashboard.js
 * Main staking dashboard page.
 * Composes Navbar, NotificationBanner, StakeForm, StakesTable, and Sidebar.
 * All blockchain calls are delegated to the blockchain service.
 */

import React, { useState, useEffect, useCallback } from "react";
import Navbar                 from "../components/Navbar";
import NotificationBanner     from "../components/NotificationBanner";
import StakeForm              from "../components/StakeForm";
import StakesTable            from "../components/StakesTable";
import Sidebar                from "../components/Sidebar";
import Footer                 from "../components/Footer";
import { fetchChainData, stakeETH, withdrawStake } from "../services/blockchain";
import { fetchETHPrice, fetchPriceHistory }        from "../services/api";
import { calcReward, toEth, toEth4, ANNUAL_RATE }  from "../utils/helpers";
import LoadingSpinner from "../components/LoadingSpinner";
import TransactionHistory from '../components/TransactionHistory';


export default function Dashboard({ account, username, onLogout, setPage, onConnectWallet }) {
  // ── State ──────────────────────────────────────────────────────────────
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [stakes, setStakes] = useState([]);
  const [contractBalance, setContractBalance] = useState(0n);
  const [status, setStatus] = useState("");
  const [liveRewards, setLiveRewards] = useState({});
  const [ethPrice, setEthPrice] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [notification, setNotification] = useState(
    "Don't invest unless you're prepared to lose all the money you invest. This is a high-risk platform."
  );

  // ── Callbacks (Define BEFORE useEffect) ───────────────────────────────
  
  const loadData = useCallback(async () => {
    if (!account) return;
    try {
      setLoading(true);
      setLoadingMessage("Fetching your stakes...");
      
      const data = await fetchChainData(account);
      setStakes(data.stakes);
      setContractBalance(data.contractBalance);
    } catch (err) {
      console.error("Failed to load chain data:", err);
    } finally {
      setLoading(false);
    }
  }, [account]);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      // Sepolia = 0xaa36a7 (11155111 in decimal)
      if (chainId !== '0xaa36a7') {
        const networkNames = {
          '0x1': 'Ethereum Mainnet',
          '0x5': 'Goerli',
          '0x89': 'Polygon',
          '0xa': 'Optimism',
        };
        setCurrentNetwork(networkNames[chainId] || 'Unknown Network');
        setShowNetworkModal(true);
      } else {
        setShowNetworkModal(false);
      }
    } catch (error) {
      console.error('Network check failed:', error);
    }
  }, []);

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
      setShowNetworkModal(false);
    } catch (error) {
      // Network not added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia TestNet',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'SEP',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
          setShowNetworkModal(false);
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      } else {
        console.error('Failed to switch network:', error);
      }
    }
  };

  // ── Effects (Use functions defined above) ─────────────────────────────
  
  // Fetch price data on mount
  useEffect(() => {
    fetchETHPrice().then(setEthPrice);
    fetchPriceHistory().then(setPriceHistory);
  }, []);

  // Check network on mount and listen for changes
  useEffect(() => {
    checkNetwork();
    
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
      return () => {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      };
    }
  }, [checkNetwork]);

  // Load chain data when account changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live reward ticker
  useEffect(() => {
    if (!stakes.length) return;
    
    const timer = setInterval(() => {
      const updated = {};
      stakes.forEach((s) => {
        if (!s.withdrawn) {
          updated[s.index] = calcReward(s.amount, s.startTime);
        }
      });
      setLiveRewards(updated);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [stakes]);

  // ── Handlers ───────────────────────────────────────────────────────────
  
  const handleStake = async (amountEth) => {
    try {
      setLoading(true);
      setLoadingMessage("Preparing transaction...");
      setStatus("Processing transaction…");
      
      await stakeETH(amountEth);
      
      setLoadingMessage("Confirming on blockchain...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus("✅ Staked successfully!");
      loadData();
    } catch (err) {
      console.error("Stake error:", err);
      
      // Parse specific errors
      let errorMsg = "❌ Transaction failed";
      
      if (err.code === 4001) {
        errorMsg = "❌ Transaction rejected by user";
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMsg = "❌ Insufficient ETH for gas fees";
      } else if (err.message?.includes('minimum stake')) {
        errorMsg = "❌ Minimum stake is 0.001 ETH";
      } else if (err.message?.includes('paused')) {
        errorMsg = "❌ Contract is currently paused";
      } else if (err.code === -32603) {
        errorMsg = "❌ Network error - check connection";
      } else if (err.message?.includes('user rejected')) {
        errorMsg = "❌ Transaction cancelled";
      } else if (err.message) {
        // Show contract revert reason if available
        const revertMatch = err.message.match(/reason="([^"]+)"/);
        if (revertMatch) {
          errorMsg = `❌ ${revertMatch[1]}`;
        } else {
          errorMsg = `❌ ${err.message.slice(0, 80)}`;
        }
      }
      
      setStatus(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (index) => {
    try {
      setLoading(true);
      setLoadingMessage(`Withdrawing stake #${index + 1}...`);
      setStatus(`Withdrawing stake #${index + 1}…`);
      
      await withdrawStake(index);
      
      setLoadingMessage("Confirming withdrawal...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus("✅ Withdrawal successful!");
      loadData();
    } catch (err) {
      console.error("Withdraw error:", err);
      
      // Parse specific errors
      let errorMsg = "❌ Withdrawal failed";
      
      if (err.code === 4001) {
        errorMsg = "❌ Transaction rejected by user";
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMsg = "❌ Insufficient ETH for gas fees";
      } else if (err.message?.includes('lock period')) {
        errorMsg = "❌ Lock period has not ended yet (1 hour from stake)";
      } else if (err.message?.includes('already withdrawn')) {
        errorMsg = "❌ This stake has already been withdrawn";
      } else if (err.message?.includes('invalid stake index')) {
        errorMsg = "❌ Invalid stake - refresh page";
      } else if (err.message?.includes('paused')) {
        errorMsg = "❌ Contract is currently paused";
      } else if (err.message?.includes('insufficient contract balance')) {
        errorMsg = "❌ Contract has insufficient balance - contact admin";
      } else if (err.code === -32603) {
        errorMsg = "❌ Network error - check connection";
      } else if (err.message) {
        // Show contract revert reason
        const revertMatch = err.message.match(/reason="([^"]+)"/);
        if (revertMatch) {
          errorMsg = `❌ ${revertMatch[1]}`;
        } else {
          errorMsg = `❌ ${err.message.slice(0, 80)}`;
        }
      }
      
      setStatus(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived State ──────────────────────────────────────────────────────
  
  const activeStakes = stakes.filter((s) => !s.withdrawn);
  const totalStaked = activeStakes.reduce((sum, s) => sum + BigInt(s.amount), 0n);
  const totalRewards = Object.values(liveRewards).reduce((sum, r) => sum + r, 0n);

  // ── Render ─────────────────────────────────────────────────────────────
  
  return (
    <div style={{ background: "#f7f9fc", minHeight: "100vh" }}>
      {loading && <LoadingSpinner message={loadingMessage} />}

      <Navbar setPage={setPage} username={username} onLogout={onLogout} account={account} onConnectWallet={onConnectWallet} />

      <NotificationBanner
        message={notification}
        onClose={() => setNotification("")}
        onLearnMore={() => setPage("learn")}
      />

      {/* Animations + Mobile Styles */}
      <style>{`
      
       @keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeSlideLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes cardPop {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.stake-btn-hero:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 10px 32px rgba(255,255,255,0.3) !important;
}

.why-card:hover {
  transform: translateY(-8px) !important;
  box-shadow: 0 16px 40px rgba(102,126,234,0.18) !important;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 32px;
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr !important;
  }

  .sidebar-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .sidebar-section {
    grid-template-columns: 1fr !important;
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }

  .why-grid {
    grid-template-columns: 1fr !important;
  }
}
      `}</style>

      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "clamp(32px, 6vw, 80px) clamp(16px, 4vw, 40px)",
          borderBottom: "4px solid #5a67d8",
          marginTop: notification ? 58 : 0,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{
            fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 700, color: "#fff", marginBottom: 20,
            animation: "fadeSlideLeft 0.7s ease both",
          }}>
            Ethereum Staking
          </h1>
          <p style={{
            fontSize: "clamp(15px, 2vw, 20px)", color: "rgba(255,255,255,0.92)",
            marginBottom: 16, maxWidth: 680, lineHeight: 1.7,
            animation: "fadeSlideUp 0.8s ease 0.1s both",
          }}>
            Staking Ethereum lets you earn rewards on your ETH while also helping
            to secure the network. Stake your ETH directly on-chain and earn up
            to <strong>{ANNUAL_RATE}% APR</strong> — with rewards calculated every second.
          </p>

          {/* Stake ETH CTA Button */}
          <button
            className="stake-btn-hero"
            onClick={() => {
              const el = document.getElementById("stake-form-section");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              marginBottom: 40,
              padding: "16px 40px",
              fontSize: 18,
              fontWeight: 700,
              color: "#667eea",
              background: "#fff",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 20px rgba(255,255,255,0.2)",
              animation: "fadeSlideUp 0.9s ease 0.2s both",
            }}
          >
            Stake ETH →
          </button>

          {/* Stats Cards */}
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Your Total Staked", value: toEth4(totalStaked) + " ETH", color: "#fff" },
              { label: "Rewards Earned",    value: toEth(totalRewards) + " ETH",  color: "#48bb78" },
              { label: "Annual Rate",       value: ANNUAL_RATE + "% APR",         color: "#fff" },
            ].map((card, i) => (
              <div
                key={card.label}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  padding: 24,
                  borderRadius: 12,
                  border: "2px solid rgba(255,255,255,0.2)",
                  animation: `cardPop 0.6s ease ${0.3 + i * 0.15}s both`,
                }}
              >
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: card.color }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stake Section */}
      <section style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(32px, 6vw, 80px) clamp(16px, 4vw, 24px)" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: "#1a202c", marginBottom: 12 }}>
            Why stake on our platform?
          </h2>
          <p style={{ fontSize: 16, color: "#718096", marginBottom: 48 }}>
            Decentralized, transparent, and secure staking — no intermediaries.
          </p>
          <div className="why-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { icon: "⚡", title: "Fast. Easy. No minimums",       desc: "Stake any amount of ETH (min 0.001 ETH) with a few clicks. Rewards start immediately." },
              { icon: "🔗", title: "Smart Contract Integration",    desc: "Direct on-chain interaction. Transparent, immutable, and fully decentralized." },
              { icon: "🛡️", title: "Security First",               desc: "Reentrancy guards, CEI pattern, and strict input validation protect your funds." },
            ].map((f, i) => (
              <div
                key={f.title}
                className="why-card"
                style={{
                  textAlign: "center",
                  padding: 32,
                  borderRadius: 16,
                  border: "2px solid #e2e8f0",
                  background: "#fff",
                  transition: "all 0.3s ease",
                  animation: `cardPop 0.6s ease ${i * 0.15}s both`,
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 52, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#2d3748", marginBottom: 12 }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: "#4a5568", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="stake-form-section" style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(24px, 4vw, 60px) clamp(16px, 3vw, 24px)" }}>
        <div className="main-grid">
          {/* Left: Stake + Table */}
          <div>
            <StakeForm account={account} onStake={handleStake} status={status} />
            <StakesTable
              stakes={stakes}
              liveRewards={liveRewards}
              onWithdraw={handleWithdraw}
            />
            
            {/* Transaction History */}
            <TransactionHistory address={account} />
          </div>

          {/* Right: Sidebar */}
          <div className="sidebar-section">
            <Sidebar
              ethPrice={ethPrice}
              priceHistory={priceHistory}
              contractBalance={contractBalance}
              notificationVisible={!!notification}
            />
          </div>
        </div>
      </section>

      {/* Network Warning Modal */}
      {showNetworkModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 40,
            maxWidth: 500,
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'modalPop 0.3s ease',
          }}>
            <div style={{
              fontSize: 48,
              textAlign: 'center',
              marginBottom: 20,
            }}>
              ⚠️
            </div>
            
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1a202c',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              Wrong Network Detected
            </h2>
            
            <p style={{
              fontSize: 16,
              color: '#4a5568',
              marginBottom: 8,
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              You're currently on <strong>{currentNetwork}</strong>
            </p>
            
            <p style={{
              fontSize: 16,
              color: '#4a5568',
              marginBottom: 32,
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              This DApp requires <strong>Sepolia TestNet</strong>
            </p>
            
            <button
              onClick={switchToSepolia}
              style={{
                width: '100%',
                padding: '16px 32px',
                fontSize: 16,
                fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: 12,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(102,126,234,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Switch to Sepolia
            </button>
            
            <button
              onClick={() => setShowNetworkModal(false)}
              style={{
                width: '100%',
                padding: '12px 32px',
                fontSize: 14,
                fontWeight: 600,
                color: '#718096',
                background: 'transparent',
                border: '2px solid #e2e8f0',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#cbd5e0';
                e.target.style.color = '#4a5568';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.color = '#718096';
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}