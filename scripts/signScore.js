// scripts/signScore.js - Fixed version
const { ethers } = require("hardhat");

async function signScore(player, levelId, animalId, score, nonce, signerWallet) {
  // Create message hash EXACTLY as in the contract using abi.encodePacked
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256", "uint256", "uint256"],
    [player, levelId, animalId, score, nonce]
  );
  
  console.log("Message hash (raw):", messageHash);
  
  // Sign the message - ethers v6 automatically adds Ethereum prefix
  const signature = await signerWallet.signMessage(ethers.getBytes(messageHash));
  
  // Verify locally
  const recoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), signature);
  console.log("Recovered address:", recoveredAddress);
  console.log("Expected signer:", signerWallet.address);
  console.log("Signature valid:", recoveredAddress === signerWallet.address);
  
  return signature;
}

// Alternative method if the above doesn't work
async function signScoreAlternative(player, levelId, animalId, score, nonce, signerWallet) {
  // Create typed data for EIP-712 signing (more robust)
  const domain = {
    name: "AnimalGame",
    version: "1",
    chainId: 31337, // Hardhat chainId
    verifyingContract: "0x0000000000000000000000000000000000000000" // Replace with actual address
  };
  
  const types = {
    Score: [
      { name: "player", type: "address" },
      { name: "levelId", type: "uint256" },
      { name: "animalId", type: "uint256" },
      { name: "score", type: "uint256" },
      { name: "nonce", type: "uint256" }
    ]
  };
  
  const value = {
    player,
    levelId,
    animalId,
    score,
    nonce
  };
  
  const signature = await signerWallet.signTypedData(domain, types, value);
  return signature;
}

module.exports = { signScore, signScoreAlternative };