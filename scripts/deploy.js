const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Animal Rescuers contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const AnimalRescuers = await ethers.getContractFactory("AnimalRescuers");
  const animalRescuers = await AnimalRescuers.deploy();
  await animalRescuers.waitForDeployment();

  console.log("AnimalRescuers deployed to:", await animalRescuers.getAddress());
  
  // Display contract info
  console.log("\nContract Configuration:");
  console.log("Rescue Price:", ethers.formatEther(await animalRescuers.rescuePrice()), "ETH");
  console.log("Max Rescues Per Day:", (await animalRescuers.maxRescuesPerDay()).toString());
  
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });