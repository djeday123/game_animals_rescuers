// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Animal Rescuers
 * @dev A blockchain game where players rescue animals and earn NFTs and rewards
 */
contract AnimalRescuers is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Game configuration
    uint256 public rescuePrice = 0.001 ether;
    uint256 public maxRescuesPerDay = 5;
    
    // Animal types
    enum AnimalType { Cat, Dog, Bird, Rabbit, Horse }
    
    // Animal rarity levels
    enum RarityLevel { Common, Uncommon, Rare, Epic, Legendary }
    
    // Animal struct
    struct Animal {
        uint256 id;
        AnimalType animalType;
        RarityLevel rarity;
        string name;
        uint256 rescueTimestamp;
        uint256 experience;
        bool isActive;
    }
    
    // Player struct
    struct Player {
        uint256 totalRescues;
        uint256 lastRescueDate;
        uint256 dailyRescueCount;
        uint256 totalExperience;
        uint256[] ownedAnimals;
    }
    
    // Mappings
    mapping(uint256 => Animal) public animals;
    mapping(address => Player) public players;
    mapping(address => uint256) public playerBalances;
    
    // Events
    event AnimalRescued(
        address indexed player, 
        uint256 indexed tokenId, 
        AnimalType animalType, 
        RarityLevel rarity,
        string name
    );
    event ExperienceGained(address indexed player, uint256 amount);
    event RewardWithdrawn(address indexed player, uint256 amount);
    
    constructor() ERC721("Animal Rescuers", "RESCUE") {}
    
    /**
     * @dev Rescue an animal and mint NFT
     */
    function rescueAnimal(string memory animalName) external payable nonReentrant {
        require(msg.value >= rescuePrice, "Insufficient payment for rescue");
        require(bytes(animalName).length > 0, "Animal name cannot be empty");
        
        Player storage player = players[msg.sender];
        
        // Check daily rescue limit
        if (isToday(player.lastRescueDate)) {
            require(player.dailyRescueCount < maxRescuesPerDay, "Daily rescue limit reached");
            player.dailyRescueCount++;
        } else {
            player.dailyRescueCount = 1;
            player.lastRescueDate = block.timestamp;
        }
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Generate random animal properties
        (AnimalType animalType, RarityLevel rarity) = _generateAnimalProperties(tokenId, msg.sender);
        
        // Create animal
        Animal memory newAnimal = Animal({
            id: tokenId,
            animalType: animalType,
            rarity: rarity,
            name: animalName,
            rescueTimestamp: block.timestamp,
            experience: 0,
            isActive: true
        });
        
        animals[tokenId] = newAnimal;
        player.ownedAnimals.push(tokenId);
        player.totalRescues++;
        
        // Mint NFT
        _safeMint(msg.sender, tokenId);
        
        // Award experience based on rarity
        uint256 experienceGained = _calculateExperienceReward(rarity);
        player.totalExperience += experienceGained;
        
        emit AnimalRescued(msg.sender, tokenId, animalType, rarity, animalName);
        emit ExperienceGained(msg.sender, experienceGained);
    }
    
    /**
     * @dev Care for an animal to gain experience
     */
    function careForAnimal(uint256 tokenId) external {
        require(_exists(tokenId), "Animal does not exist");
        require(ownerOf(tokenId) == msg.sender, "You don't own this animal");
        require(animals[tokenId].isActive, "Animal is not active");
        
        Animal storage animal = animals[tokenId];
        Player storage player = players[msg.sender];
        
        // Award experience for caring
        uint256 careExperience = 10;
        animal.experience += careExperience;
        player.totalExperience += careExperience;
        
        // Award small ETH reward for caring
        uint256 careReward = rescuePrice / 20; // 5% of rescue price
        playerBalances[msg.sender] += careReward;
        
        emit ExperienceGained(msg.sender, careExperience);
    }
    
    /**
     * @dev Withdraw accumulated rewards
     */
    function withdrawRewards() external nonReentrant {
        uint256 balance = playerBalances[msg.sender];
        require(balance > 0, "No rewards to withdraw");
        require(address(this).balance >= balance, "Insufficient contract balance");
        
        playerBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        
        emit RewardWithdrawn(msg.sender, balance);
    }
    
    /**
     * @dev Get player information
     */
    function getPlayerInfo(address playerAddress) external view returns (
        uint256 totalRescues,
        uint256 totalExperience,
        uint256 dailyRescueCount,
        uint256 rewardBalance,
        uint256[] memory ownedAnimals
    ) {
        Player memory player = players[playerAddress];
        return (
            player.totalRescues,
            player.totalExperience,
            player.dailyRescueCount,
            playerBalances[playerAddress],
            player.ownedAnimals
        );
    }
    
    /**
     * @dev Get animal information
     */
    function getAnimalInfo(uint256 tokenId) external view returns (Animal memory) {
        require(_exists(tokenId), "Animal does not exist");
        return animals[tokenId];
    }
    
    /**
     * @dev Generate random animal properties
     */
    function _generateAnimalProperties(uint256 tokenId, address player) private view returns (AnimalType, RarityLevel) {
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            tokenId,
            player
        )));
        
        // Generate animal type (0-4)
        AnimalType animalType = AnimalType(randomness % 5);
        
        // Generate rarity with weighted probabilities
        uint256 rarityRoll = (randomness / 5) % 100;
        RarityLevel rarity;
        
        if (rarityRoll < 50) {
            rarity = RarityLevel.Common; // 50%
        } else if (rarityRoll < 75) {
            rarity = RarityLevel.Uncommon; // 25%
        } else if (rarityRoll < 90) {
            rarity = RarityLevel.Rare; // 15%
        } else if (rarityRoll < 98) {
            rarity = RarityLevel.Epic; // 8%
        } else {
            rarity = RarityLevel.Legendary; // 2%
        }
        
        return (animalType, rarity);
    }
    
    /**
     * @dev Calculate experience reward based on rarity
     */
    function _calculateExperienceReward(RarityLevel rarity) private pure returns (uint256) {
        if (rarity == RarityLevel.Common) return 10;
        if (rarity == RarityLevel.Uncommon) return 25;
        if (rarity == RarityLevel.Rare) return 50;
        if (rarity == RarityLevel.Epic) return 100;
        if (rarity == RarityLevel.Legendary) return 250;
        return 10;
    }
    
    /**
     * @dev Check if timestamp is today
     */
    function isToday(uint256 timestamp) private view returns (bool) {
        return (block.timestamp / 1 days) == (timestamp / 1 days);
    }
    
    // Owner functions
    function setRescuePrice(uint256 newPrice) external onlyOwner {
        rescuePrice = newPrice;
    }
    
    function setMaxRescuesPerDay(uint256 newLimit) external onlyOwner {
        maxRescuesPerDay = newLimit;
    }
    
    function withdrawContractBalance() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // Receive function to accept ETH
    receive() external payable {}
}