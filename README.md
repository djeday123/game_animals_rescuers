# 🐾 Animal Rescuers - Blockchain Game

A blockchain-based NFT game where players rescue animals, earn experience, and collect unique animal NFTs on the Ethereum blockchain.

## 🎮 Game Overview

Animal Rescuers is a play-to-earn blockchain game where players:
- **Rescue animals** by paying a small fee and mint unique NFT animals
- **Care for animals** to gain experience and earn rewards
- **Collect rare animals** with different types and rarity levels
- **Earn ETH rewards** through gameplay mechanics
- **Build a collection** of rescued animal NFTs

## 🚀 Features

### Core Game Mechanics
- **Animal Rescue System**: Pay 0.001 ETH to rescue random animals
- **5 Animal Types**: Cat, Dog, Bird, Rabbit, Horse
- **5 Rarity Levels**: Common (50%), Uncommon (25%), Rare (15%), Epic (8%), Legendary (2%)
- **Experience System**: Gain XP from rescues and caring activities
- **Daily Limits**: Maximum 5 rescues per day to prevent spam
- **Reward System**: Earn ETH by caring for your animals

### NFT Features
- **ERC-721 Compatible**: Standard NFT implementation
- **Unique Metadata**: Each animal has type, rarity, name, and experience
- **Ownership Tracking**: Full ownership and transfer capabilities
- **On-chain Storage**: Core game data stored on blockchain

### Economic Model
- **Rescue Fee**: 0.001 ETH per animal rescue
- **Care Rewards**: Earn 5% of rescue fee per care action
- **Experience Points**: Bonus XP based on animal rarity
- **Withdrawable Rewards**: Players can withdraw earned ETH

## 🛠 Technical Stack

- **Solidity ^0.8.19**: Smart contract development
- **Hardhat**: Development framework and testing
- **OpenZeppelin**: Security standards and NFT implementation
- **Ethers.js**: Blockchain interaction library
- **Chai**: Testing framework

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/djeday123/game_animals_rescuers.git
cd game_animals_rescuers
```

2. Install dependencies:
```bash
npm install
```

3. Compile contracts:
```bash
npm run compile
```

4. Run tests:
```bash
npm test
```

## 🎯 Usage

### Deploy the Contract
```bash
npm run deploy
```

### Run Game Demo
```bash
npm run demo
```

### Start Local Blockchain
```bash
npm run node
```

## 🎮 How to Play

### 1. Rescue an Animal
```solidity
// Pay 0.001 ETH to rescue an animal
animalRescuers.rescueAnimal("Fluffy", { value: ethers.parseEther("0.001") });
```

### 2. Care for Your Animals
```solidity
// Care for animal with token ID 0
animalRescuers.careForAnimal(0);
```

### 3. Check Your Stats
```solidity
// Get player information
const playerInfo = await animalRescuers.getPlayerInfo(playerAddress);
```

### 4. Withdraw Rewards
```solidity
// Withdraw accumulated ETH rewards
animalRescuers.withdrawRewards();
```

## 📊 Game Statistics

### Experience Rewards by Rarity
- **Common**: 10 XP
- **Uncommon**: 25 XP  
- **Rare**: 50 XP
- **Epic**: 100 XP
- **Legendary**: 250 XP

### Daily Limits
- **Maximum Rescues**: 5 per day
- **Care Actions**: Unlimited
- **Reward Withdrawals**: Unlimited

## 🔧 Contract Functions

### Player Functions
- `rescueAnimal(string name)`: Rescue a new animal NFT
- `careForAnimal(uint256 tokenId)`: Care for owned animal
- `withdrawRewards()`: Withdraw accumulated ETH rewards
- `getPlayerInfo(address player)`: View player statistics
- `getAnimalInfo(uint256 tokenId)`: View animal details

### Owner Functions
- `setRescuePrice(uint256 newPrice)`: Adjust rescue cost
- `setMaxRescuesPerDay(uint256 newLimit)`: Change daily limits
- `withdrawContractBalance()`: Withdraw contract profits

## 🧪 Testing

Run the comprehensive test suite:
```bash
npm test
```

Tests cover:
- Contract deployment
- Animal rescue mechanics
- Care system functionality
- Reward distribution
- Access controls
- Edge cases and error handling

## 🚀 Deployment Networks

The contract can be deployed on:
- **Ethereum Mainnet**: For production use
- **Sepolia Testnet**: For testing and development
- **Hardhat Network**: For local development
- **Polygon**: For lower gas fees

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎨 Future Enhancements

- **Breeding System**: Allow animals to breed and create offspring
- **Battle System**: Animal battles with skill-based gameplay
- **Marketplace**: Built-in NFT trading functionality
- **Staking**: Stake animals for passive rewards
- **Governance**: Community voting on game parameters
- **Mobile App**: React Native mobile interface
- **Web Frontend**: Full-featured web application

## 📞 Support

For questions and support:
- Open an issue on GitHub
- Join our community discussions
- Check the documentation

---

**Made with ❤️ for the blockchain gaming community**
