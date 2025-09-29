const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnimalRescuers", function () {
  let animalRescuers;
  let owner;
  let player1;
  let player2;
  
  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const AnimalRescuers = await ethers.getContractFactory("AnimalRescuers");
    animalRescuers = await AnimalRescuers.deploy();
    await animalRescuers.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await animalRescuers.owner()).to.equal(owner.address);
    });

    it("Should have correct initial values", async function () {
      expect(await animalRescuers.rescuePrice()).to.equal(ethers.parseEther("0.001"));
      expect(await animalRescuers.maxRescuesPerDay()).to.equal(5);
    });
  });

  describe("Animal Rescue", function () {
    it("Should rescue an animal successfully", async function () {
      const rescuePrice = await animalRescuers.rescuePrice();
      
      await expect(
        animalRescuers.connect(player1).rescueAnimal("Fluffy", { value: rescuePrice })
      ).to.emit(animalRescuers, "AnimalRescued");
      
      // Check that player owns the NFT
      expect(await animalRescuers.ownerOf(0)).to.equal(player1.address);
      
      // Check player info
      const playerInfo = await animalRescuers.getPlayerInfo(player1.address);
      expect(playerInfo.totalRescues).to.equal(1);
      expect(playerInfo.totalExperience).to.be.gt(0);
    });

    it("Should fail with insufficient payment", async function () {
      await expect(
        animalRescuers.connect(player1).rescueAnimal("Fluffy", { value: ethers.parseEther("0.0005") })
      ).to.be.revertedWith("Insufficient payment for rescue");
    });

    it("Should fail with empty animal name", async function () {
      const rescuePrice = await animalRescuers.rescuePrice();
      
      await expect(
        animalRescuers.connect(player1).rescueAnimal("", { value: rescuePrice })
      ).to.be.revertedWith("Animal name cannot be empty");
    });
  });

  describe("Animal Care", function () {
    beforeEach(async function () {
      const rescuePrice = await animalRescuers.rescuePrice();
      await animalRescuers.connect(player1).rescueAnimal("Fluffy", { value: rescuePrice });
    });

    it("Should allow caring for owned animal", async function () {
      await expect(
        animalRescuers.connect(player1).careForAnimal(0)
      ).to.emit(animalRescuers, "ExperienceGained");
      
      const animalInfo = await animalRescuers.getAnimalInfo(0);
      expect(animalInfo.experience).to.equal(10);
    });

    it("Should fail when caring for non-owned animal", async function () {
      await expect(
        animalRescuers.connect(player2).careForAnimal(0)
      ).to.be.revertedWith("You don't own this animal");
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      const rescuePrice = await animalRescuers.rescuePrice();
      await animalRescuers.connect(player1).rescueAnimal("Fluffy", { value: rescuePrice });
      await animalRescuers.connect(player1).careForAnimal(0);
    });

    it("Should allow withdrawing rewards", async function () {
      const playerInfo = await animalRescuers.getPlayerInfo(player1.address);
      const rewardBalance = playerInfo.rewardBalance;
      
      if (rewardBalance > 0) {
        await expect(
          animalRescuers.connect(player1).withdrawRewards()
        ).to.emit(animalRescuers, "RewardWithdrawn");
      }
    });
  });

  describe("Owner functions", function () {
    it("Should allow owner to set rescue price", async function () {
      const newPrice = ethers.parseEther("0.002");
      await animalRescuers.setRescuePrice(newPrice);
      expect(await animalRescuers.rescuePrice()).to.equal(newPrice);
    });

    it("Should not allow non-owner to set rescue price", async function () {
      const newPrice = ethers.parseEther("0.002");
      await expect(
        animalRescuers.connect(player1).setRescuePrice(newPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});