/**
 * App.js
 * ──────
 * Root component — manages authentication stage and page routing only.
 *
 * Architecture:
 *   utils/helpers.js           → Pure utility functions and constants
 *   services/blockchain.js     → All ethers.js / smart-contract calls
 *   services/api.js            → CoinGecko price API calls
 *   components/Navbar.js       → Sticky navigation bar
 *   components/NotificationBanner.js → Risk warning banner
 *   components/StakeForm.js    → ETH stake input form
 *   components/StakesTable.js  → User stakes table with live rewards
 *   components/PriceChart.js   → SVG ETH price chart
 *   components/Sidebar.js      → Right-hand sticky sidebar
 *   components/Footer.js       → Site footer
 *   pages/AuthPage.js          → Login / sign-up
 *   pages/ConnectWalletPage.js → MetaMask connection prompt
 *   pages/Dashboard.js         → Main staking dashboard
 *   pages/LearnPage.js         → Educational content and FAQs
 *   pages/CalculatorPage.js    → Reward calculator
 */

import React, { useState } from "react";
import AuthPage            from "./pages/AuthPage";
import ConnectWalletPage   from "./pages/ConnectWalletPage";
import Dashboard           from "./pages/Dashboard";
import LearnPage           from "./pages/LearnPage";
import CalculatorPage      from "./pages/CalculatorPage";
import { connectMetaMask } from "./services/blockchain";

export default function App() {
  const [account,  setAccount]  = useState(null);
  const [username, setUsername] = useState("");
  const [stage,    setStage]    = useState("auth");
  const [page,     setPage]     = useState("home");

  const handleLogin = (user) => {
    setUsername(user);
    setStage("connect");
  };

  const handleConnect = async () => {
    try {
      const address = await connectMetaMask();
      setAccount(address);
      setStage("app");
      setPage("home");
    } catch (err) {
      alert(err.message || "Failed to connect MetaMask");
    }
  };

  const handleLogout = () => {
    setAccount(null);
    setUsername("");
    setStage("auth");
    setPage("home");
  };

  if (stage === "auth")    return <AuthPage onLogin={handleLogin} />;
  if (stage === "connect") return <ConnectWalletPage username={username} onConnect={handleConnect} />;
  if (page === "learn")    return <LearnPage onBack={() => setPage("home")} />;
  if (page === "calc")     return <CalculatorPage onBack={() => setPage("home")} />;

  return (
    <Dashboard
      account={account}
      username={username}
      onLogout={handleLogout}
      setPage={setPage}
    />
  );
}
