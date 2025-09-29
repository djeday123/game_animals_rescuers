// scripts/testGameProduction.js
const hre = require("hardhat");

async function signScore(player, levelId, animalId, score, nonce, signerWallet) {
  // Use solidityPackedKeccak256 to match abi.encodePacked in contract
  const messageHash = hre.ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256", "uint256", "uint256"],
    [player, levelId, animalId, score, nonce]
  );
  
  // Sign the message
  const signature = await signerWallet.signMessage(hre.ethers.getBytes(messageHash));
  
  return signature;
}

async function main() {
  const addresses = require("../game-addresses.json");
  const [owner, player1, player2] = await hre.ethers.getSigners();
  
  console.log("Testing game with production signatures...\n");
  console.log("Owner/Game Server:", owner.address);
  console.log("Player 1:", player1.address);
  
  const animalNFT = await hre.ethers.getContractAt("AnimalNFT", addresses.animalNFT);
  const gameToken = await hre.ethers.getContractAt("GameToken", addresses.gameToken);
  const animalGame = await hre.ethers.getContractAt("AnimalGame", addresses.animalGame);
  
  // Verify game server is set correctly
  const gameServerAddress = await animalGame.gameServer();
  console.log("Contract Game Server:", gameServerAddress);
  console.log("Servers match:", gameServerAddress === owner.address);
  
  // 1. Mint animals
  console.log("\n1. Minting animals...");
  const mintPrice = await animalNFT.mintPrice();
  
  await animalNFT.connect(player1).mintAnimal("Buddy", 0, { value: mintPrice });
  await animalNFT.connect(player1).mintAnimal("Whiskers", 1, { value: mintPrice });
  
  const player1Animals = await animalNFT.getOwnerAnimals(player1.address);
  console.log(`Player 1 has ${player1Animals.length} animals`);
  
  const firstAnimal = await animalNFT.getAnimal(player1Animals[0]);
  console.log("First animal:", {
    name: firstAnimal.name,
    power: firstAnimal.power.toString(),
    speed: firstAnimal.speed.toString()
  });
  
  // 2. Give tokens
  console.log("\n2. Distributing tokens...");
  await gameToken.transfer(player1.address, hre.ethers.parseEther("1000"));
  
  const balance = await gameToken.balanceOf(player1.address);
  console.log(`Player 1 balance: ${hre.ethers.formatEther(balance)} AGT`);
  
  // 3. Play level
  console.log("\n3. Playing level...");
  const entryFee = await animalGame.entryFee();
  
  await gameToken.connect(player1).approve(addresses.animalGame, entryFee);
  await animalGame.connect(player1).playLevel(1, player1Animals[0]);
  console.log("Level started!");
  
  // 4. Get nonce for score submission
  const playerNonce = await animalGame.playerNonce(player1.address);
  console.log(`Player nonce: ${playerNonce}`);
  
  // 5. Create and submit signed score
  const score = 1500;
  const levelId = 1;
  const animalId = player1Animals[0];
  
  console.log("\n4. Creating signed score...");
  console.log("Score data:", {
    player: player1.address,
    levelId: levelId.toString(),
    animalId: animalId.toString(),
    score: score,
    nonce: playerNonce.toString()
  });
  
  // Sign the score as game server
  const signature = await signScore(
    player1.address,
    levelId,
    animalId,
    score,
    playerNonce,
    owner // Game server signer
  );
  
  console.log("Signature created:", signature);
  
  // Verify signature locally before submitting
  const messageHash = hre.ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256", "uint256", "uint256"],
    [player1.address, levelId, animalId, score, playerNonce]
  );
  
  const recoveredAddress = hre.ethers.verifyMessage(
    hre.ethers.getBytes(messageHash),
    signature
  );
  console.log("Recovered address:", recoveredAddress);
  console.log("Signature valid:", recoveredAddress === owner.address);
  
  // 6. Submit score
  console.log("\n5. Submitting signed score...");
  try {
    const tx = await animalGame.connect(player1).submitScore(
      levelId,
      animalId,
      score,
      playerNonce,
      signature
    );
    
    const receipt = await tx.wait();
    console.log("Score submitted successfully!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // 7. Check results
    const stats = await animalGame.getPlayerStats(player1.address);
    console.log("\nPlayer 1 stats:", {
      levelsCompleted: stats.levelsCompleted.toString(),
      totalScore: stats.totalScore.toString(),
      highScore: stats.highScore.toString(),
      tokensEarned: hre.ethers.formatEther(stats.tokensEarned)
    });
    
    // Check animal experience
    const updatedAnimal = await animalNFT.getAnimal(player1Animals[0]);
    console.log("\nAnimal after playing:", {
      level: updatedAnimal.level.toString(),
      experience: updatedAnimal.experience.toString(),
      power: updatedAnimal.power.toString()
    });
    
    // Check new token balance
    const newBalance = await gameToken.balanceOf(player1.address);
    console.log(`\nNew token balance: ${hre.ethers.formatEther(newBalance)} AGT`);
    
  } catch (error) {
    console.error("Error submitting score:", error.message);
    
    // Additional debugging
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });