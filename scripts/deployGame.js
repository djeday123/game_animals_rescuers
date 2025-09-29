const hre = require("hardhat");

async function main() {
  console.log("Deploying Animal Game contracts...\n");
  
  const [owner] = await hre.ethers.getSigners();
  
  // Deploy AnimalNFT
  const AnimalNFT = await hre.ethers.getContractFactory("AnimalNFT");
  const animalNFT = await AnimalNFT.deploy();
  await animalNFT.waitForDeployment();
  console.log("AnimalNFT deployed to:", await animalNFT.getAddress());
  
  // Deploy GameToken
  const GameToken = await hre.ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy();
  await gameToken.waitForDeployment();
  console.log("GameToken deployed to:", await gameToken.getAddress());
  
  // Deploy AnimalGame
  const AnimalGame = await hre.ethers.getContractFactory("AnimalGame");
  const animalGame = await AnimalGame.deploy(
    await animalNFT.getAddress(),
    await gameToken.getAddress()
  );
  await animalGame.waitForDeployment();
  console.log("AnimalGame deployed to:", await animalGame.getAddress());
  
  // Setup permissions
  await gameToken.setGameMaster(await animalGame.getAddress(), true);
  await animalNFT.transferOwnership(await animalGame.getAddress());
  
  // Create some initial levels
  await animalGame.createLevel("Farmyard Fun", 1, hre.ethers.parseEther("100"), 50);
  await animalGame.createLevel("City Chaos", 2, hre.ethers.parseEther("200"), 100);
  await animalGame.createLevel("Forest Frenzy", 3, hre.ethers.parseEther("500"), 200);
  
  console.log("\nInitial levels created!");
  
  // Save addresses
  const addresses = {
    animalNFT: await animalNFT.getAddress(),
    gameToken: await gameToken.getAddress(),
    animalGame: await animalGame.getAddress()
  };
  
  const fs = require("fs");
  fs.writeFileSync("game-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to game-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});