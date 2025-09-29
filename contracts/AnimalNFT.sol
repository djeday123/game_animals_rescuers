// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AnimalNFT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    
    enum AnimalType { DOG, CAT, RABBIT, HAMSTER, PARROT }
    
    struct Animal {
        string name;
        AnimalType animalType;
        uint256 power;
        uint256 speed;
        uint256 specialAbility;
        uint256 level;
        uint256 experience;
    }
    
    mapping(uint256 => Animal) public animals;
    mapping(address => uint256[]) public ownerAnimals;
    
    uint256 public mintPrice = 0.01 ether;
    
    event AnimalMinted(address owner, uint256 tokenId, AnimalType animalType);
    event AnimalLevelUp(uint256 tokenId, uint256 newLevel);
    
    // Передаем msg.sender в конструктор Ownable
    constructor() ERC721("Crypto Animals", "ANIMALS") Ownable(msg.sender) {}
    
    function mintAnimal(string memory _name, AnimalType _type) public payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 tokenId = _nextTokenId++;
        
        uint256 basePower = 50;
        uint256 baseSpeed = 50;
        uint256 ability = 0;
        
        if (_type == AnimalType.DOG) {
            basePower = 70;
            baseSpeed = 60;
            ability = 1;
        } else if (_type == AnimalType.CAT) {
            basePower = 60;
            baseSpeed = 80;
            ability = 2;
        } else if (_type == AnimalType.RABBIT) {
            basePower = 50;
            baseSpeed = 90;
            ability = 3;
        }
        
        animals[tokenId] = Animal({
            name: _name,
            animalType: _type,
            power: basePower + (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 20),
            speed: baseSpeed + (uint256(keccak256(abi.encodePacked(block.prevrandao, msg.sender))) % 20),
            specialAbility: ability,
            level: 1,
            experience: 0
        });
        
        _safeMint(msg.sender, tokenId);
        ownerAnimals[msg.sender].push(tokenId);
        
        emit AnimalMinted(msg.sender, tokenId, _type);
    }
    
    function getAnimal(uint256 tokenId) public view returns (Animal memory) {
        _requireOwned(tokenId);
        return animals[tokenId];
    }
    
    function getOwnerAnimals(address owner) public view returns (uint256[] memory) {
        return ownerAnimals[owner];
    }
    
    function addExperience(uint256 tokenId, uint256 exp) external onlyOwner {
        _requireOwned(tokenId);
        
        animals[tokenId].experience += exp;
        
        uint256 requiredExp = animals[tokenId].level * 100;
        if (animals[tokenId].experience >= requiredExp) {
            animals[tokenId].level++;
            animals[tokenId].power += 10;
            animals[tokenId].speed += 5;
            animals[tokenId].experience = 0;
            
            emit AnimalLevelUp(tokenId, animals[tokenId].level);
        }
    }
    
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}