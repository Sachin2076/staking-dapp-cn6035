
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

  const handleGuest = () => {
    setAccount(null);
    setStage("app");
    setPage("home");
  };

  const handleLogout = () => {
    setAccount(null);
    setUsername("");
    setStage("auth");
    setPage("home");
  };

  if (stage === "auth")    return <AuthPage onLogin={handleLogin} />;
  if (stage === "connect") return <ConnectWalletPage username={username} onConnect={handleConnect} onGuest={handleGuest} />;
  if (page === "learn")    return <LearnPage onBack={() => setPage("home")} />;
  if (page === "calc")     return <CalculatorPage onBack={() => setPage("home")} />;

  return (
    <Dashboard
      account={account}
      username={username}
      onLogout={handleLogout}
      setPage={setPage}
      onConnectWallet={handleConnect}
    />
  );
}