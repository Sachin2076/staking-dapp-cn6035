# Decentralized Staking Platform for Token Rewards

🌐 **Live Demo:** https://staking-dapp-cn6035-6l2h.vercel.app/  
📝 **GitHub:** https://github.com/Sachin2076/staking-dapp-cn6035  
🔗 **Contract (Sepolia):** 0x341314fd5bcA243edC9d859eaD01C36db222d0D9  
✅ **Verified on Etherscan:** https://sepolia.etherscan.io/address/0x341314fd5bcA243edC9d859eaD01C36db222d0D9

A Full-Stack DApp allowing users to stake ETH, earn time-based rewards, and withdraw with lockup periods, built with Hardhat and React.

**CN6035 - Mobile & Distributed Systems**  
University of East London

---

## ✨ Features

### Smart Contract
- ✅ **Security-First Design**: Reentrancy protection, CEI pattern, input validation
- ✅ **Emergency Controls**: Pause/unpause mechanism for production safety
- ✅ **Time-Based Rewards**: 10% APR calculated per second
- ✅ **Lock Period**: 1 hour testing period (configurable)
- ✅ **Multiple Stakes**: Users can create unlimited independent stakes
- ✅ **Comprehensive Testing**: 11 unit tests, 100% statement coverage
- ✅ **Gas Optimized**: Custom reentrancy guard saves ~2000 gas

### Frontend
- ✅ **Login System**: Secure MetaMask connection with guest mode
- ✅ **Responsive Design**: Mobile-first with hamburger navigation
- ✅ **Live ETH Price**: Real-time from CoinGecko API with 7-day chart
- ✅ **Network Validation**: Auto-detect wrong network with switch button
- ✅ **Loading States**: Full loading indicators for all async operations
- ✅ **Staking Calculator**: Estimate rewards before staking
- ✅ **Educational Content**: Learn page with comprehensive FAQs
- ✅ **Live Rewards**: Real-time reward updates every second

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js v16+
MetaMask browser extension
Git
```

### Installation

```bash
# Clone repository
git clone https://github.com/Sachin2076/staking-dapp-cn6035
cd staking-dapp-cn6035

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Local Development

**Terminal 1: Start Hardhat Network**
```bash
npx hardhat node
# Keep running - this is your local blockchain
```

**Terminal 2: Deploy Contract**
```bash
npx hardhat run scripts/deploy.js --network localhost
# Note the contract address
```

**Terminal 3: Start React Frontend**
```bash
cd client
npm start
# Opens http://localhost:3000
```

### MetaMask Setup

1. **Import Test Account**
   - Copy private key from Hardhat node terminal
   - MetaMask → Import Account → Paste key

2. **Add Hardhat Network**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

3. **Connect to DApp**
   - Click "Connect MetaMask"
   - Approve connection

---

## 📊 Technical Stack

### Blockchain
- **Smart Contract**: Solidity 0.8.19
- **Development**: Hardhat 2.19.4
- **Testing**: Chai + Hardhat Network Helpers
- **Web3 Library**: ethers.js v6

### Frontend
- **Framework**: React 18.2
- **Styling**: Inline CSS with responsive design
- **API Integration**: CoinGecko (ETH price)
- **Deployment**: Vercel

### Code Quality
- **Linting**: ESLint (0 errors, 0 warnings)
- **Formatting**: Prettier
- **Gas Reporting**: Hardhat Gas Reporter
- **Coverage**: Solidity Coverage (100% statements)

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npx hardhat test

# With gas reporting
REPORT_GAS=true npx hardhat test

# Coverage analysis
npx hardhat coverage
```

### Test Results
```
✓ 11 passing (10s)
✓ 100% statement coverage
✓ 95.83% branch coverage
✓ 100% function coverage
```

### Gas Usage
| Function | Avg Gas |
|----------|---------|
| stake() | 52,341 |
| withdraw() | 43,567 |
| calculateRewards() | 2,456 |

See [TESTING.md](./TESTING.md) for detailed test documentation.

---

## 🔒 Security

### Implemented Protections
- ✅ **Reentrancy Guard**: Custom boolean mutex
- ✅ **CEI Pattern**: Strict Checks-Effects-Interactions
- ✅ **Input Validation**: All public functions validated
- ✅ **Integer Overflow**: Solidity 0.8.19 built-in protection
- ✅ **Emergency Pause**: Owner-controlled pause mechanism
- ✅ **Access Control**: Owner-only administrative functions

### Security Audit
```bash
# Run Slither static analysis
pip3 install slither-analyzer
slither contracts/StakingPlatform.sol

# Results: 0 High, 0 Medium issues
```

See [SECURITY.md](./SECURITY.md) for complete audit report.

---

## 🌐 Deployment

### Sepolia Testnet (Live)
```
Contract: 0x341314fd5bcA243edC9d859eaD01C36db222d0D9
Network: Sepolia Testnet (Chain ID: 11155111)
Etherscan: https://sepolia.etherscan.io/address/0x341314fd5bcA243edC9d859eaD01C36db222d0D9
```

### Frontend (Vercel)
```
Live Demo: https://staking-dapp-cn6035-6l2h.vercel.app/
Deployment: Automatic via GitHub integration
```

### Contract Verification
```bash
# Verify on Etherscan
npx hardhat run scripts/verify.js --network sepolia

# Manual verification
https://sepolia.etherscan.io/verifyContract
```

---

## 📁 Project Structure

```
staking-dapp-cn6035/
├── contracts/
│   └── StakingPlatform.sol          # Smart contract
├── scripts/
│   ├── deploy.js                    # Deployment script
│   └── verify.js                    # Etherscan verification
├── test/
│   └── StakingPlatform.test.js      # 11 comprehensive tests
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js            # Navigation with mobile support
│       │   ├── StakeForm.js         # Staking input form
│       │   ├── StakesTable.js       # User stakes display
│       │   ├── PriceChart.js        # SVG ETH price chart
│       │   ├── Sidebar.js           # Info panel
│       │   ├── Footer.js            # Footer
│       │   ├── LoadingSpinner.js    # Loading states
│       │   ├── NetworkWarning.js    # Network validation
│       │   └── NotificationBanner.js # Risk warnings
│       ├── pages/
│       │   ├── AuthPage.js          # Login/signup
│       │   ├── ConnectWalletPage.js # MetaMask connection
│       │   ├── Dashboard.js         # Main interface
│       │   ├── LearnPage.js         # Educational content
│       │   └── CalculatorPage.js    # Reward calculator
│       ├── services/
│       │   ├── blockchain.js        # ethers.js integration
│       │   ├── api.js               # CoinGecko API
│       │   └── networkValidation.js # Network checks
│       ├── utils/
│       │   └── helpers.js           # Utility functions
│       ├── App.js                   # Main component
│       ├── index.js                 # Entry point
│       └── contractConfig.js        # Auto-generated config
├── hardhat.config.js                # Hardhat configuration
├── package.json                     # Backend dependencies
├── TESTING.md                       # Test documentation
├── SECURITY.md                      # Security audit
└── README.md                        # This file
```

---

## 🎓 Educational Purpose

### Learning Outcomes Demonstrated

**Week 7-8: Blockchain & Smart Contracts**
- ✅ Solidity smart contract development
- ✅ Security patterns implementation
- ✅ Hardhat testing framework
- ✅ Gas optimization techniques

**Week 9: Web3.0 & DApps**
- ✅ MetaMask wallet integration
- ✅ ethers.js for blockchain interaction
- ✅ Event listening and transaction handling
- ✅ Testnet deployment

**Week 10: Configuration Management**
- ✅ Git version control (23 commits)
- ✅ GitHub repository management
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Deployment automation

### Topics Covered
- Distributed system architecture
- Client-server communication (RPC)
- Asynchronous operations
- State management
- API integration (CoinGecko)
- Responsive web design
- Security best practices

---

## 📈 Performance Metrics

### Smart Contract
```
Gas Optimization: High
- Custom reentrancy guard: -2000 gas
- Optimized storage: minimal writes
- View functions: zero gas cost
```

### Frontend
```
Lighthouse Score (Vercel):
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
```

### Test Coverage
```
Statements:  100%
Branches:    95.83%
Functions:   100%
Lines:       100%
```

---

## 🔧 Configuration

### Smart Contract Constants
```solidity
ANNUAL_RATE = 10        // 10% APR
LOCK_PERIOD = 1 hours   // 3600 seconds
MIN_STAKE = 0.001 ether // Minimum stake amount
```

### Network Configuration
```javascript
// Sepolia Testnet
chainId: 11155111
rpcUrl: https://sepolia.infura.io/v3/YOUR_KEY

// Hardhat Local
chainId: 31337
rpcUrl: http://127.0.0.1:8545
```

---

## 🐛 Troubleshooting

### MetaMask Issues
```
Problem: "MetaMask not found"
Solution: Install MetaMask extension and refresh page

Problem: "Wrong Network" warning
Solution: Click "Switch to Sepolia" button in banner

Problem: Transaction failed
Solution: Ensure sufficient ETH and correct network
```

### Contract Issues
```
Problem: "Lock period not ended"
Solution: Wait 1 hour from stake time (view countdown)

Problem: "Insufficient balance"
Solution: Contract needs ETH for rewards (check balance)
```

### Frontend Issues
```
Problem: Loading forever
Solution: Check MetaMask is unlocked and connected

Problem: Prices not loading
Solution: Check internet connection (CoinGecko API)
```

---

## 🎯 Future Enhancements

### Smart Contract
- [ ] Multi-token support (ERC20)
- [ ] Flexible lock periods (user-defined)
- [ ] Compound staking (auto-restake rewards)
- [ ] Referral system
- [ ] Governance token integration

### Frontend
- [ ] Dark mode toggle
- [ ] Multiple language support
- [ ] Advanced analytics dashboard
- [ ] Transaction history export
- [ ] Email notifications
- [ ] Mobile app (React Native)

### Infrastructure
- [ ] Mainnet deployment
- [ ] ENS domain integration
- [ ] IPFS frontend hosting
- [ ] Subgraph for event indexing
- [ ] Discord bot integration

---

## 📝 License

This project is for educational purposes as part of CN6035 coursework.

---

## 🙏 Acknowledgments

- **University of East London** - CN6035 Module
- **Hardhat** - Development framework
- **ethers.js** - Web3 library
- **CoinGecko** - Price API
- **Vercel** - Frontend hosting
- **OpenZeppelin** - Security reference patterns

---

## 📞 Contact

**Student:** Sachin  
**Module:** CN6035 - Mobile & Distributed Systems  
**Institution:** University of East London  
**GitHub:** https://github.com/Sachin2076/staking-dapp-cn6035

---

**Built with ❤️ for learning blockchain development**