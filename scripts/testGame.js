const hre = require("hardhat");
const { signScore } = require("./signScore");

async function main() {
  const addresses = require("../game-addresses.json");
  const [owner, player1, player2] = await hre.ethers.getSigners();
  
  console.log("Testing game contracts with signatures...\n");
  console.log("Owner address:", owner.address);
  console.log("Player1 address:", player1.address);
  
  const animalNFT = await hre.ethers.getContractAt("AnimalNFT", addresses.animalNFT);
  const gameToken = await hre.ethers.getContractAt("GameToken", addresses.gameToken);
  const animalGame = await hre.ethers.getContractAt("AnimalGame", addresses.animalGame);
  
  // Проверяем адрес игрового сервера
  const gameServerAddress = await animalGame.gameServer();
  console.log("Game server address:", gameServerAddress);
  
  // 1. Минтим животных
  console.log("\n1. Minting animals...");
  const mintPrice = await animalNFT.mintPrice();
  
  await animalNFT.connect(player1).mintAnimal("Buddy", 0, { value: mintPrice });
  await animalNFT.connect(player1).mintAnimal("Whiskers", 1, { value: mintPrice });
  
  console.log("Animals minted!");
  
  // 2. Проверяем животных
  const player1Animals = await animalNFT.getOwnerAnimals(player1.address);
  console.log(`\nPlayer 1 has ${player1Animals.length} animals`);
  
  const firstAnimal = await animalNFT.getAnimal(player1Animals[0]);
  console.log("First animal:", {
    name: firstAnimal.name,
    power: firstAnimal.power.toString(),
    speed: firstAnimal.speed.toString()
  });
  
  // 3. Даем игрокам токены
  console.log("\n3. Giving tokens to players...");
  await gameToken.transfer(player1.address, hre.ethers.parseEther("1000"));
  
  // 4. Играем уровень
  console.log("\n4. Playing level...");
  const entryFee = await animalGame.entryFee();
  
  await gameToken.connect(player1).approve(addresses.animalGame, entryFee);
  await animalGame.connect(player1).playLevel(1, player1Animals[0]);
  console.log("Level started!");
  
  // 5. Получаем nonce игрока
  const playerNonce = await animalGame.playerNonce(player1.address);
  console.log(`Player nonce: ${playerNonce}`);
  
  // 6. Создаем подписанный счет
  const score = 1500;
  const levelId = 1;
  const animalId = player1Animals[0];
  
  // Создаем сообщение для подписи точно так же, как в контракте
  const messageHash = hre.ethers.keccak256(
    hre.ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [player1.address, levelId, animalId, score, playerNonce]
    )
  );
  
  console.log("\nMessage hash:", messageHash);
  
  // Подписываем
  const messageArray = hre.ethers.getBytes(messageHash);
  const signature = await owner.signMessage(messageArray);
  
  console.log("Signature:", signature);
  console.log("Signer (should be game server):", owner.address);
  
  console.log("\n5. Submitting signed score...");
  await animalGame.connect(player1).submitScore(
    levelId,
    animalId,
    score,
    playerNonce,
    signature
  );
  console.log("Score submitted!");
  
  // 7. Проверяем статистику
  const stats = await animalGame.getPlayerStats(player1.address);
  console.log("\nPlayer 1 stats:", {
    levelsCompleted: stats.levelsCompleted.toString(),
    totalScore: stats.totalScore.toString(),
    highScore: stats.highScore.toString(),
    tokensEarned: hre.ethers.formatEther(stats.tokensEarned)
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});