# 🐾 Animal Rescuers - Blockchain Game

A decentralized blockchain game where players rescue virtual animals and collect them as NFTs. Built on Ethereum with Solidity smart contracts and a web-based frontend.

## 🎮 Game Overview

Animal Rescuers is a blockchain-based game that combines the joy of animal rescue with NFT collecting. Players can:

- **Rescue Animals**: Participate in rescue missions by paying a small fee
- **Collect NFTs**: Each rescued animal becomes a unique NFT in your wallet
- **Build Collection**: Accumulate different animal species and breeds
- **Support Causes**: Rescue fees can be used to support real animal welfare organizations

## 🏗️ Project Structure

```
├── contracts/                 # Smart contracts
│   ├── AnimalNFT.sol         # ERC-721 NFT contract for rescued animals
│   ├── AnimalRescueGame.sol  # Main game logic contract
│   └── Counter.sol           # Example contract (can be removed)
├── frontend/                 # Web interface
│   └── index.html           # Game frontend
├── scripts/                  # Deployment scripts
│   └── deploy.ts            # Deployment script
├── test/                     # Contract tests
│   └── AnimalRescueGame.test.ts
└── hardhat.config.ts        # Hardhat configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/djeday123/game_animals_rescuers.git
   cd game_animals_rescuers
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile contracts:**
   ```bash
   npm run compile
   ```

4. **Run tests:**
   ```bash
   npm run test
   ```

5. **Start local blockchain:**
   ```bash
   npm run node
   ```

6. **Deploy contracts (in another terminal):**
   ```bash
   npm run deploy:local
   ```

7. **Open the game:**
   - Open `frontend/index.html` in your browser
   - Connect your MetaMask wallet
   - Add the local Hardhat network to MetaMask:
     - Network Name: Hardhat Local
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency Symbol: ETH

## 🎯 How to Play

1. **Connect Wallet**: Connect your MetaMask wallet to the game
2. **Browse Missions**: View available animal rescue missions
3. **Rescue Animals**: Pay the rescue fee to save an animal
4. **Collect NFTs**: Rescued animals become NFTs in your wallet
5. **Build Collection**: Rescue different species to build your collection

## 📋 Smart Contracts

### AnimalNFT.sol
- **Purpose**: ERC-721 NFT contract for rescued animals
- **Features**:
  - Mint animal NFTs when rescued
  - Store animal metadata (name, species, rescue date, rescuer)
  - View animals owned by a player
  - Custom token URI for each animal

### AnimalRescueGame.sol
- **Purpose**: Main game logic and mission management
- **Features**:
  - Create rescue missions with different animals
  - Handle rescue payments and NFT minting
  - Track active and completed missions
  - Emergency rescue functionality for admins

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm run test
```

Tests cover:
- NFT minting and ownership
- Mission creation and completion
- Payment handling and validation
- Access control and security

## 🚀 Deployment

### Local Development
```bash
npm run deploy:local
```

### Testnet Deployment
1. Configure network in `hardhat.config.ts`
2. Set environment variables:
   ```bash
   export PRIVATE_KEY="your-private-key"
   export ALCHEMY_API_KEY="your-alchemy-key"
   ```
3. Deploy:
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

## 🎨 Frontend Features

The web interface includes:
- **Wallet Connection**: MetaMask integration
- **Mission Browser**: View available rescue missions
- **Animal Gallery**: Display rescued animals collection
- **Interactive UI**: Modern, responsive design
- **Real-time Updates**: Live mission and collection updates

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownership Controls**: Admin-only functions protected
- **Input Validation**: All user inputs validated
- **Access Control**: Role-based permissions
- **Payment Safety**: Excess payments refunded

## 📊 Game Economics

- **Rescue Fees**: Small ETH amounts (0.02 - 0.1 ETH)
- **NFT Value**: Each rescued animal is a unique NFT
- **Rarity System**: Different animals, different rescue fees
- **Sustainability**: Fees support game maintenance and real animal welfare

## 🌐 Network Support

Currently supports:
- **Hardhat Local**: Development and testing
- **Ethereum Sepolia**: Testnet deployment
- **Ethereum Mainnet**: Production ready

Easy to extend to other EVM-compatible networks.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Check the code comments and tests
- **Community**: Join discussions in GitHub Discussions

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core smart contracts
- ✅ Basic frontend interface
- ✅ Testing suite
- ✅ Local deployment

### Phase 2 (Planned)
- [ ] Enhanced frontend with React
- [ ] Real animal images and metadata
- [ ] Rarity and trait system
- [ ] Marketplace integration

### Phase 3 (Future)
- [ ] Mobile app
- [ ] Real animal welfare partnerships
- [ ] Cross-chain support
- [ ] Governance token

## 📈 Stats

- **Contracts**: 2 main contracts
- **Test Coverage**: Comprehensive test suite
- **Frontend**: Modern HTML5/CSS3/JavaScript
- **Blockchain**: Ethereum-compatible

---

**Made with ❤️ for animal lovers and blockchain enthusiasts**

Start rescuing animals today! 🐾
