# Decentralized Staking Platform for Token Rewards

A Full-Stack DApp allowing users to stake ETH, earn time-based rewards, and withdraw with lockup periods, built with Hardhat and React.

## ✨ Features

- **Login Page**: Secure MetaMask connection with animated button feedback
- **Responsive Design**: Works perfectly on all devices (mobile, tablet, desktop)
- **Live ETH Price Chart**: Real-time Ethereum price with 7-day history visualization
- **Staking Calculator**: Calculate potential rewards before staking
- **Educational Content**: Comprehensive Learn page with expandable FAQs
- **Sticky Sidebar**: Warning messages and contract info stay visible while scrolling
- **Button Click Feedback**: All buttons have press animations for better UX
- **Better Contrast**: Enhanced readability with darker text on light backgrounds
- **Navigation**: Easy back buttons from Learn and Calculator pages

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have these installed:
- Node.js (v16 or higher)
- MetaMask browser extension
- Git

### Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 2: Start Hardhat Local Network

Open a **new terminal window** and run:

```bash
npx hardhat node
```

**Keep this terminal running!** This is your local blockchain.

You should see a list of accounts with private keys. Keep this window open.

### Step 3: Deploy the Smart Contract

Open **another new terminal window** and run:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

You should see output like:
```
StakingPlatform deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Step 4: Start the React Frontend

In the same terminal (or a new one), run:

```bash
cd client
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

### Step 5: Connect MetaMask

1. **Import a test account into MetaMask:**
   - Copy one of the private keys from the Hardhat node terminal
   - In MetaMask, click your account icon → Import Account
   - Paste the private key
   
2. **Add the Hardhat network to MetaMask:**
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

3. **Connect to the app:**
   - Click "Connect MetaMask to Start" on the login page
   - Approve the connection in MetaMask

## 📱 How to Use

### Staking ETH
1. Enter the amount of ETH you want to stake
2. Click "Stake Now"
3. Confirm the transaction in MetaMask
4. Wait for confirmation (~1-2 seconds on local network)

### Viewing Stakes
- All your stakes appear in the "My Stakes" table
- Live rewards update every second
- See lock time remaining for each stake

### Withdrawing
1. Wait until the lock period expires (1 hour for testing)
2. Click "Withdraw" on the stake
3. Confirm in MetaMask
4. You'll receive your original stake + rewards

### Using the Calculator
1. Click "Calculator" in the navigation
2. Enter staking amount and duration
3. See estimated rewards instantly

### Learning About Staking
1. Click "Learn" in the navigation
2. Read educational cards about staking concepts
3. Expand FAQ questions for quick answers

## 🎨 Design Features

- **Gradient Backgrounds**: Purple gradient theme inspired by Kraken
- **Sticky Navigation**: Always accessible navigation bar
- **Responsive Grid**: Content adapts to screen size
- **Smooth Animations**: Button hover and press effects
- **Live Data**: Real ETH price from CoinGecko API
- **Price Chart**: SVG-based 7-day price history
- **Mobile-First**: Optimized for touch interfaces

## 🔧 Project Structure

```
staking-dapp/
├── contracts/
│   └── StakingPlatform.sol      # Smart contract
├── scripts/
│   └── deploy.js                # Deployment script
├── test/
│   └── StakingPlatform.test.js  # Contract tests
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js               # Main React component
│       ├── index.js             # React entry point
│       └── contractConfig.js    # Auto-generated contract config
├── hardhat.config.js
└── package.json
```

## 🧪 Running Tests

To test the smart contract:

```bash
npx hardhat test
```

## 🛠️ Development Notes

### Modifying the Contract
If you change `StakingPlatform.sol`:
1. Stop the Hardhat node (Ctrl+C)
2. Restart it: `npx hardhat node`
3. Redeploy: `npx hardhat run scripts/deploy.js --network localhost`
4. The contract address will update automatically in `contractConfig.js`

### Changing APR or Lock Period
Edit these constants in `contracts/StakingPlatform.sol`:
```solidity
uint256 public constant ANNUAL_RATE = 10;  // 10% APR
uint256 public constant LOCK_PERIOD = 3600;  // 1 hour in seconds
```

Then redeploy the contract.

### Resetting Everything
If things get messy:
1. Stop all terminals (Ctrl+C)
2. Delete `client/src/contractConfig.js`
3. Start from Step 2 again

## 📊 Smart Contract Details

- **Annual Rate**: 10% APR
- **Lock Period**: 1 hour (3600 seconds)
- **Reward Calculation**: `(staked_amount * 10% * time_elapsed) / year`
- **Features**:
  - Multiple stakes per user
  - Time-based reward accrual
  - Lock period enforcement
  - Withdraw with rewards

## 🌐 API Integration

The app uses the CoinGecko API for:
- Current ETH price (USD)
- 7-day price history for charts

No API key required for basic usage.

## 🐛 Troubleshooting

### "MetaMask not found"
- Install MetaMask browser extension
- Refresh the page

### "Transaction failed"
- Make sure you have enough ETH in your wallet
- Check that Hardhat node is running
- Verify you're on the Hardhat network in MetaMask

### "Cannot connect to network"
- Verify Hardhat node is running on port 8545
- Check MetaMask network settings
- Try restarting the Hardhat node

### Contract address mismatch
- Redeploy the contract
- Clear browser cache
- Refresh the page

## 🎓 Educational Purpose

This project is built for educational purposes to demonstrate:
- Smart contract development with Solidity
- Local blockchain testing with Hardhat
- React integration with Web3
- MetaMask wallet connection
- Real-time data visualization
- Responsive web design

## 📝 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Built with Hardhat, React, and ethers.js
- Design inspired by Kraken's staking interface
- Educational content based on Ethereum staking concepts

---

**Happy Staking! 🚀**

For any issues or questions, refer to the troubleshooting section above.
