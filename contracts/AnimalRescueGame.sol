// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./AnimalNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AnimalRescueGame is Ownable, ReentrancyGuard {
    AnimalNFT public animalNFT;
    
    struct RescueMission {
        uint256 id;
        string animalName;
        string animalSpecies;
        string location;
        uint256 rescueFee;
        string imageURI;
        bool isCompleted;
        address rescuer;
        uint256 deadline;
    }

    mapping(uint256 => RescueMission) public rescueMissions;
    uint256 private _missionIdCounter;
    uint256 public totalRewards;
    
    event MissionCreated(uint256 missionId, string animalName, string species, uint256 rescueFee);
    event AnimalRescuedFromMission(uint256 missionId, address rescuer, uint256 tokenId);
    event RewardClaimed(address rescuer, uint256 amount);

    constructor(address _animalNFT) Ownable(msg.sender) {
        animalNFT = AnimalNFT(_animalNFT);
    }

    function createRescueMission(
        string memory animalName,
        string memory animalSpecies,
        string memory location,
        uint256 rescueFee,
        string memory imageURI,
        uint256 duration
    ) public onlyOwner {
        uint256 missionId = _missionIdCounter;
        _missionIdCounter++;

        rescueMissions[missionId] = RescueMission({
            id: missionId,
            animalName: animalName,
            animalSpecies: animalSpecies,
            location: location,
            rescueFee: rescueFee,
            imageURI: imageURI,
            isCompleted: false,
            rescuer: address(0),
            deadline: block.timestamp + duration
        });

        emit MissionCreated(missionId, animalName, animalSpecies, rescueFee);
    }

    function rescueAnimalFromMission(uint256 missionId) public payable nonReentrant {
        RescueMission storage mission = rescueMissions[missionId];
        
        require(!mission.isCompleted, "Mission already completed");
        require(block.timestamp <= mission.deadline, "Mission deadline passed");
        require(msg.value >= mission.rescueFee, "Insufficient rescue fee");

        mission.isCompleted = true;
        mission.rescuer = msg.sender;

        // Mint the rescued animal as NFT
        uint256 tokenId = animalNFT.rescueAnimal(
            msg.sender,
            mission.animalName,
            mission.animalSpecies,
            mission.imageURI
        );

        // Add to total rewards for the game
        totalRewards += msg.value;

        emit AnimalRescuedFromMission(missionId, msg.sender, tokenId);

        // Refund excess payment
        if (msg.value > mission.rescueFee) {
            payable(msg.sender).transfer(msg.value - mission.rescueFee);
        }
    }

    function getActiveMissions() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active missions
        for (uint256 i = 0; i < _missionIdCounter; i++) {
            if (!rescueMissions[i].isCompleted && block.timestamp <= rescueMissions[i].deadline) {
                activeCount++;
            }
        }
        
        // Create array of active mission IDs
        uint256[] memory activeMissions = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _missionIdCounter; i++) {
            if (!rescueMissions[i].isCompleted && block.timestamp <= rescueMissions[i].deadline) {
                activeMissions[index] = i;
                index++;
            }
        }
        
        return activeMissions;
    }

    function getMission(uint256 missionId) public view returns (RescueMission memory) {
        require(missionId < _missionIdCounter, "Mission does not exist");
        return rescueMissions[missionId];
    }

    function getTotalMissions() public view returns (uint256) {
        return _missionIdCounter;
    }

    function getUserRescuedAnimals(address user) public view returns (uint256[] memory) {
        return animalNFT.getAnimalsByOwner(user);
    }

    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
        totalRewards = 0;
    }

    function emergencyRescue(
        address to,
        string memory animalName,
        string memory animalSpecies,
        string memory imageURI
    ) public onlyOwner {
        animalNFT.rescueAnimal(to, animalName, animalSpecies, imageURI);
    }

    receive() external payable {
        totalRewards += msg.value;
    }
}