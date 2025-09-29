import { expect } from "chai";
import { ethers } from "hardhat";
import { AnimalNFT, AnimalRescueGame } from "../typechain-types";

describe("Animal Rescue Game", function () {
  let animalNFT: AnimalNFT;
  let animalRescueGame: AnimalRescueGame;
  let owner: any;
  let player1: any;
  let player2: any;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy AnimalNFT contract
    const AnimalNFTFactory = await ethers.getContractFactory("AnimalNFT");
    animalNFT = await AnimalNFTFactory.deploy();
    await animalNFT.waitForDeployment();

    // Deploy AnimalRescueGame contract
    const AnimalRescueGameFactory = await ethers.getContractFactory("AnimalRescueGame");
    animalRescueGame = await AnimalRescueGameFactory.deploy(await animalNFT.getAddress());
    await animalRescueGame.waitForDeployment();

    // Transfer ownership of AnimalNFT to the game contract
    await animalNFT.transferOwnership(await animalRescueGame.getAddress());
  });

  describe("Animal NFT", function () {
    it("should mint an animal NFT when rescued", async function () {
      const tokenId = await animalNFT.rescueAnimal(
        player1.address,
        "Buddy",
        "Dog",
        "https://example.com/buddy.jpg"
      );

      expect(await animalNFT.ownerOf(0)).to.equal(player1.address);
      
      const animal = await animalNFT.getAnimal(0);
      expect(animal.name).to.equal("Buddy");
      expect(animal.species).to.equal("Dog");
      expect(animal.rescuer).to.equal(player1.address);
      expect(animal.isRescued).to.be.true;
    });

    it("should return animals owned by a player", async function () {
      await animalNFT.rescueAnimal(player1.address, "Buddy", "Dog", "https://example.com/buddy.jpg");
      await animalNFT.rescueAnimal(player1.address, "Mittens", "Cat", "https://example.com/mittens.jpg");

      const ownedAnimals = await animalNFT.getAnimalsByOwner(player1.address);
      expect(ownedAnimals.length).to.equal(2);
      expect(ownedAnimals[0]).to.equal(0n);
      expect(ownedAnimals[1]).to.equal(1n);
    });
  });

  describe("Rescue Game", function () {
    it("should create a rescue mission", async function () {
      await animalRescueGame.createRescueMission(
        "Lost Puppy",
        "Golden Retriever",
        "Central Park",
        ethers.parseEther("0.1"),
        "https://example.com/puppy.jpg",
        3600 // 1 hour duration
      );

      const mission = await animalRescueGame.getMission(0);
      expect(mission.animalName).to.equal("Lost Puppy");
      expect(mission.animalSpecies).to.equal("Golden Retriever");
      expect(mission.location).to.equal("Central Park");
      expect(mission.rescueFee).to.equal(ethers.parseEther("0.1"));
      expect(mission.isCompleted).to.be.false;
    });

    it("should allow players to rescue animals from missions", async function () {
      // Create a mission
      await animalRescueGame.createRescueMission(
        "Lost Puppy",
        "Golden Retriever", 
        "Central Park",
        ethers.parseEther("0.1"),
        "https://example.com/puppy.jpg",
        3600
      );

      // Player rescues the animal
      await animalRescueGame.connect(player1).rescueAnimalFromMission(0, {
        value: ethers.parseEther("0.1")
      });

      // Check mission is completed
      const mission = await animalRescueGame.getMission(0);
      expect(mission.isCompleted).to.be.true;
      expect(mission.rescuer).to.equal(player1.address);

      // Check player received the NFT
      const ownedAnimals = await animalRescueGame.getUserRescuedAnimals(player1.address);
      expect(ownedAnimals.length).to.equal(1);

      // Check animal details
      const animal = await animalNFT.getAnimal(ownedAnimals[0]);
      expect(animal.name).to.equal("Lost Puppy");
      expect(animal.species).to.equal("Golden Retriever");
    });

    it("should get active missions", async function () {
      // Create two missions
      await animalRescueGame.createRescueMission(
        "Lost Cat",
        "Persian",
        "Downtown",
        ethers.parseEther("0.05"),
        "https://example.com/cat.jpg",
        3600
      );
      
      await animalRescueGame.createRescueMission(
        "Injured Bird",
        "Robin",
        "Park",
        ethers.parseEther("0.02"),
        "https://example.com/bird.jpg",
        7200
      );

      const activeMissions = await animalRescueGame.getActiveMissions();
      expect(activeMissions.length).to.equal(2);
    });

    it("should not allow rescue of completed missions", async function () {
      await animalRescueGame.createRescueMission(
        "Lost Puppy",
        "Golden Retriever",
        "Central Park", 
        ethers.parseEther("0.1"),
        "https://example.com/puppy.jpg",
        3600
      );

      // First player rescues
      await animalRescueGame.connect(player1).rescueAnimalFromMission(0, {
        value: ethers.parseEther("0.1")
      });

      // Second player tries to rescue the same mission
      await expect(
        animalRescueGame.connect(player2).rescueAnimalFromMission(0, {
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Mission already completed");
    });

    it("should require sufficient rescue fee", async function () {
      await animalRescueGame.createRescueMission(
        "Lost Puppy",
        "Golden Retriever",
        "Central Park",
        ethers.parseEther("0.1"),
        "https://example.com/puppy.jpg",
        3600
      );

      await expect(
        animalRescueGame.connect(player1).rescueAnimalFromMission(0, {
          value: ethers.parseEther("0.05") // Insufficient fee
        })
      ).to.be.revertedWith("Insufficient rescue fee");
    });
  });
});