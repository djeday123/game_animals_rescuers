// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AnimalNFT.sol";
import "./GameToken.sol";

contract AnimalGame is Ownable {
    AnimalNFT public animalNFT;
    GameToken public gameToken;
    
    struct Level {
        uint256 id;
        string name;
        uint256 difficulty;
        uint256 rewardTokens;
        uint256 experienceReward;
        bool isActive;
    }
    
    struct PlayerStats {
        uint256 levelsCompleted;
        uint256 totalScore;
        uint256 highScore;
        uint256 tokensEarned;
    }
    
    mapping(uint256 => Level) public levels;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => mapping(uint256 => bool)) public levelCompletion;
    mapping(address => mapping(uint256 => uint256)) public levelScores;
    
    uint256 public levelCount;
    uint256 public entryFee = 10 * 10**18; // 10 tokens to play
    
    event LevelCompleted(address player, uint256 levelId, uint256 score, uint256 reward);
    event AnimalUsed(address player, uint256 animalId, uint256 levelId);
    
    // Добавляем msg.sender в конструктор Ownable
    constructor(address _animalNFT, address _gameToken) Ownable(msg.sender) {
        animalNFT = AnimalNFT(_animalNFT);
        gameToken = GameToken(_gameToken);
    }
    
    function createLevel(
        string memory _name,
        uint256 _difficulty,
        uint256 _rewardTokens,
        uint256 _experienceReward
    ) public onlyOwner {
        levelCount++;
        levels[levelCount] = Level({
            id: levelCount,
            name: _name,
            difficulty: _difficulty,
            rewardTokens: _rewardTokens,
            experienceReward: _experienceReward,
            isActive: true
        });
    }
    
    function playLevel(uint256 _levelId, uint256 _animalId) public {
        require(levels[_levelId].isActive, "Level not active");
        require(animalNFT.ownerOf(_animalId) == msg.sender, "Not your animal");
        require(gameToken.balanceOf(msg.sender) >= entryFee, "Insufficient tokens");
        
        // Burn entry fee
        gameToken.burnTokens(msg.sender, entryFee);
        
        emit AnimalUsed(msg.sender, _animalId, _levelId);
    }
    
    function submitScore(
        uint256 _levelId, 
        uint256 _animalId, 
        uint256 _score,
        bytes32 _scoreHash
    ) public {
        require(animalNFT.ownerOf(_animalId) == msg.sender, "Not your animal");
        require(validateScore(_score, _scoreHash), "Invalid score");
        
        Level memory level = levels[_levelId];
        AnimalNFT.Animal memory animal = animalNFT.getAnimal(_animalId);
        
        // Calculate final score based on animal stats
        uint256 finalScore = _score + (animal.power * 10) + (animal.speed * 5);
        
        // Update scores
        if (finalScore > levelScores[msg.sender][_levelId]) {
            levelScores[msg.sender][_levelId] = finalScore;
        }
        
        // Check if level completed (score threshold based on difficulty)
        uint256 requiredScore = level.difficulty * 1000;
        if (finalScore >= requiredScore && !levelCompletion[msg.sender][_levelId]) {
            levelCompletion[msg.sender][_levelId] = true;
            playerStats[msg.sender].levelsCompleted++;
            
            // Reward tokens
            gameToken.mintReward(msg.sender, level.rewardTokens);
            playerStats[msg.sender].tokensEarned += level.rewardTokens;
            
            // Add experience to animal
            animalNFT.addExperience(_animalId, level.experienceReward);
            
            emit LevelCompleted(msg.sender, _levelId, finalScore, level.rewardTokens);
        }
        
        // Update player stats
        playerStats[msg.sender].totalScore += finalScore;
        if (finalScore > playerStats[msg.sender].highScore) {
            playerStats[msg.sender].highScore = finalScore;
        }
    }
    
    function validateScore(uint256 _score, bytes32 _scoreHash) internal pure returns (bool) {
        // В реальной игре здесь будет проверка подписи с сервера
        // Для тестирования просто проверяем хеш
        return keccak256(abi.encodePacked(_score)) == _scoreHash;
    }
    
    function getPlayerStats(address _player) public view returns (PlayerStats memory) {
        return playerStats[_player];
    }
    
    function getLevelScore(address _player, uint256 _levelId) public view returns (uint256) {
        return levelScores[_player][_levelId];
    }
}