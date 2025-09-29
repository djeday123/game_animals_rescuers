const { ethers } = require("hardhat");

async function main() {
  console.log("🐾 Animal Rescuers Game Demo 🐾\n");

  const [owner, player1, player2] = await ethers.getSigners();
  
  // Deploy the contract
  console.log("Deploying contract...");
  const AnimalRescuers = await ethers.getContractFactory("AnimalRescuers");
  const animalRescuers = await AnimalRescuers.deploy();
  await animalRescuers.waitForDeployment();
  
  const contractAddress = await animalRescuers.getAddress();
  console.log("Contract deployed to:", contractAddress);
  
  const rescuePrice = await animalRescuers.rescuePrice();
  console.log("Rescue price:", ethers.formatEther(rescuePrice), "ETH\n");

  // Player 1 rescues animals
  console.log("🎮 Player 1 Game Session:");
  console.log("Player 1 address:", player1.address);
  
  const animalNames = ["Fluffy", "Rex", "Tweety"];
  
  for (let i = 0; i < animalNames.length; i++) {
    console.log(`\nRescuing ${animalNames[i]}...`);
    
    const tx = await animalRescuers.connect(player1).rescueAnimal(animalNames[i], { 
      value: rescuePrice 
    });
    const receipt = await tx.wait();
    
    // Find the AnimalRescued event
    const rescueEvent = receipt.logs.find(log => {
      try {
        const parsedLog = animalRescuers.interface.parseLog(log);
        return parsedLog.name === 'AnimalRescued';
      } catch (e) {
        return false;
      }
    });
    
    if (rescueEvent) {
      const parsedEvent = animalRescuers.interface.parseLog(rescueEvent);
      const [player, tokenId, animalType, rarity, name] = parsedEvent.args;
      
      console.log(`✅ Rescued ${name}!`);
      console.log(`   Type: ${getAnimalTypeName(animalType)}`);
      console.log(`   Rarity: ${getRarityName(rarity)}`);
      console.log(`   Token ID: ${tokenId}`);
    }
    
    // Care for the animal
    console.log(`   Caring for ${animalNames[i]}...`);
    await animalRescuers.connect(player1).careForAnimal(i);
    console.log(`   ❤️  Cared for ${animalNames[i]}!`);
  }
  
  // Show player stats
  console.log("\n📊 Player 1 Final Stats:");
  const playerInfo = await animalRescuers.getPlayerInfo(player1.address);
  console.log(`   Total Rescues: ${playerInfo.totalRescues}`);
  console.log(`   Total Experience: ${playerInfo.totalExperience}`);
  console.log(`   Reward Balance: ${ethers.formatEther(playerInfo.rewardBalance)} ETH`);
  console.log(`   Owned Animals: ${playerInfo.ownedAnimals.length}`);
  
  // Show animals details
  console.log("\n🐾 Rescued Animals:");
  for (let i = 0; i < playerInfo.ownedAnimals.length; i++) {
    const tokenId = playerInfo.ownedAnimals[i];
    const animal = await animalRescuers.getAnimalInfo(tokenId);
    
    console.log(`   ${animal.name}:`);
    console.log(`     Type: ${getAnimalTypeName(animal.animalType)}`);
    console.log(`     Rarity: ${getRarityName(animal.rarity)}`);
    console.log(`     Experience: ${animal.experience}`);
    console.log(`     Rescue Date: ${new Date(Number(animal.rescueTimestamp) * 1000).toLocaleDateString()}`);
  }
  
  console.log("\n🎉 Game demo completed successfully!");
}

function getAnimalTypeName(typeId) {
  const types = ["Cat", "Dog", "Bird", "Rabbit", "Horse"];
  return types[typeId] || "Unknown";
}

function getRarityName(rarityId) {
  const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
  return rarities[rarityId] || "Unknown";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });