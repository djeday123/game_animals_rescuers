// test/SignatureTest.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Signature Verification", function () {
  let animalGame;
  let gameToken;
  let animalNFT;
  let owner;
  let player1;
  let gameServer;

  beforeEach(async function () {
    [owner, player1, gameServer] = await ethers.getSigners();

    // Deploy contracts
    const AnimalNFT = await ethers.getContractFactory("AnimalNFT");
    animalNFT = await AnimalNFT.deploy();

    const GameToken = await ethers.getContractFactory("GameToken");
    gameToken = await GameToken.deploy();

    const AnimalGame = await ethers.getContractFactory("AnimalGame");
    animalGame = await AnimalGame.deploy(
      await animalNFT.getAddress(),
      await gameToken.getAddress()
    );

    // Set game server
    await animalGame.setGameServer(gameServer.address);

    await animalNFT.transferOwnership(await animalGame.getAddress());
  });

  describe("Signature Creation and Verification", function () {
    it("Should create and verify signature correctly", async function () {
      // Test data
      const levelId = 1;
      const animalId = 123;
      const score = 1500;
      const nonce = 1;

      // Create message hash exactly as in the contract
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256", "uint256", "uint256"],
          [player1.address, levelId, animalId, score, nonce]
        )
      );

      // Sign the message with game server
      const signature = await gameServer.signMessage(ethers.getBytes(messageHash));

      // Verify signature works
      console.log("Message Hash:", messageHash);
      console.log("Signature:", signature);
      console.log("Signer:", gameServer.address);

      // Test the signature in a separate verification function
      const recovered = ethers.verifyMessage(ethers.getBytes(messageHash), signature);
      expect(recovered).to.equal(gameServer.address);
    });

    it("Should reject signature from wrong signer", async function () {
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256", "uint256", "uint256"],
          [player1.address, 1, 123, 1500, 1]
        )
      );

      // Sign with player instead of game server
      const wrongSignature = await player1.signMessage(ethers.getBytes(messageHash));

      // Should not match game server
      const recovered = ethers.verifyMessage(ethers.getBytes(messageHash), wrongSignature);
      expect(recovered).to.not.equal(gameServer.address);
    });
  });

  describe("Full Game Flow with Signatures", function () {
    it("Should complete full game flow with proper signatures", async function () {
      // Setup: Mint animal and give tokens
      const mintPrice = await animalNFT.mintPrice();
      await animalNFT.connect(player1).mintAnimal("TestDog", 0, { value: mintPrice });
      
      const animalIds = await animalNFT.getOwnerAnimals(player1.address);
      const animalId = animalIds[0];

      await gameToken.transfer(player1.address, ethers.parseEther("100"));
      await gameToken.setGameMaster(await animalGame.getAddress(), true);

      // Create level
      await animalGame.createLevel("Test Level", 1, ethers.parseEther("10"), 50);

      // Play level
      const entryFee = await animalGame.entryFee();
      await gameToken.connect(player1).approve(await animalGame.getAddress(), entryFee);
      await animalGame.connect(player1).playLevel(1, animalId);

      // Get nonce
      const nonce = await animalGame.playerNonce(player1.address);

      // Submit score with proper signature
      const score = 1500;
      const levelId = 1;

      // Create signature as game server
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256", "uint256", "uint256"],
        [player1.address, levelId, animalId, score, nonce]
    );

      const signature = await gameServer.signMessage(ethers.getBytes(messageHash));

      // Submit score
      await expect(
        animalGame.connect(player1).submitScore(
          levelId,
          animalId,
          score,
          nonce,
          signature
        )
      ).to.emit(animalGame, "LevelCompleted");

      // Check stats
      const stats = await animalGame.getPlayerStats(player1.address);
      expect(stats.levelsCompleted).to.equal(1);
    });

    it("Should reject score submission with invalid signature", async function () {
      // Setup similar to above...
      const mintPrice = await animalNFT.mintPrice();
      await animalNFT.connect(player1).mintAnimal("TestDog", 0, { value: mintPrice });
      
      const animalIds = await animalNFT.getOwnerAnimals(player1.address);
      const animalId = animalIds[0];

      await gameToken.transfer(player1.address, ethers.parseEther("100"));
      await gameToken.setGameMaster(await animalGame.getAddress(), true);
      await animalGame.createLevel("Test Level", 1, ethers.parseEther("10"), 50);

      const entryFee = await animalGame.entryFee();
      await gameToken.connect(player1).approve(await animalGame.getAddress(), entryFee);
      await animalGame.connect(player1).playLevel(1, animalId);

      const nonce = await animalGame.playerNonce(player1.address);

      // Try to submit with wrong signature (signed by player instead of server)
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256", "uint256", "uint256"],
          [player1.address, 1, animalId, 1500, nonce]
        )
      );

      const wrongSignature = await player1.signMessage(ethers.getBytes(messageHash));

      await expect(
        animalGame.connect(player1).submitScore(1, animalId, 1500, nonce, wrongSignature)
      ).to.be.revertedWith("Invalid signature");
    });
  });
});

// Helper function to test signature verification
async function testSignatureVerification() {
  const [signer] = await ethers.getSigners();
  
  // Test message
  const message = "Hello, Blockchain!";
  const messageHash = ethers.hashMessage(message);
  
  // Sign
  const signature = await signer.signMessage(message);
  
  // Verify
  const recovered = ethers.verifyMessage(message, signature);
  
  console.log("Original signer:", signer.address);
  console.log("Recovered address:", recovered);
  console.log("Match:", signer.address === recovered);
}