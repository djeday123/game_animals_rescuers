import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Animal Rescue Game contracts...");

  // Get the deployment account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  // Deploy AnimalNFT contract
  console.log("\n1. Deploying AnimalNFT contract...");
  const AnimalNFTFactory = await ethers.getContractFactory("AnimalNFT");
  const animalNFT = await AnimalNFTFactory.deploy();
  await animalNFT.waitForDeployment();
  const animalNFTAddress = await animalNFT.getAddress();
  console.log("AnimalNFT deployed to:", animalNFTAddress);

  // Deploy AnimalRescueGame contract
  console.log("\n2. Deploying AnimalRescueGame contract...");
  const AnimalRescueGameFactory = await ethers.getContractFactory("AnimalRescueGame");
  const animalRescueGame = await AnimalRescueGameFactory.deploy(animalNFTAddress);
  await animalRescueGame.waitForDeployment();
  const animalRescueGameAddress = await animalRescueGame.getAddress();
  console.log("AnimalRescueGame deployed to:", animalRescueGameAddress);

  // Transfer ownership of AnimalNFT to the game contract
  console.log("\n3. Setting up permissions...");
  await animalNFT.transferOwnership(animalRescueGameAddress);
  console.log("AnimalNFT ownership transferred to AnimalRescueGame");

  // Create some initial rescue missions
  console.log("\n4. Creating initial rescue missions...");
  
  const missions = [
    {
      name: "Buddy the Golden Retriever",
      species: "Golden Retriever",
      location: "Central Park",
      fee: ethers.parseEther("0.1"),
      imageURI: "https://example.com/animals/golden-retriever.jpg",
      duration: 7 * 24 * 60 * 60 // 7 days
    },
    {
      name: "Mittens the Persian Cat",
      species: "Persian Cat", 
      location: "Downtown Animal Shelter",
      fee: ethers.parseEther("0.05"),
      imageURI: "https://example.com/animals/persian-cat.jpg",
      duration: 5 * 24 * 60 * 60 // 5 days
    },
    {
      name: "Charlie the Injured Bird",
      species: "Robin",
      location: "City Park",
      fee: ethers.parseEther("0.02"),
      imageURI: "https://example.com/animals/robin.jpg",
      duration: 3 * 24 * 60 * 60 // 3 days
    }
  ];

  for (let i = 0; i < missions.length; i++) {
    const mission = missions[i];
    await animalRescueGame.createRescueMission(
      mission.name,
      mission.species,
      mission.location,
      mission.fee,
      mission.imageURI,
      mission.duration
    );
    console.log(`Created mission ${i}: ${mission.name}`);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("==================");
  console.log("AnimalNFT:", animalNFTAddress);
  console.log("AnimalRescueGame:", animalRescueGameAddress);
  
  console.log("\nTo interact with the contracts:");
  console.log("===============================");
  console.log("1. Visit the game interface (to be created)");
  console.log("2. Connect your wallet");
  console.log("3. Browse available rescue missions");
  console.log("4. Rescue animals and collect NFTs!");

  console.log("\nInitial Missions Created:");
  console.log("========================");
  missions.forEach((mission, index) => {
    console.log(`${index}: ${mission.name} - ${ethers.formatEther(mission.fee)} ETH`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });