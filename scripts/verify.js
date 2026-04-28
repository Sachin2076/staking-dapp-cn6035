/**
 * verify.js
 *
 * Verifies the deployed StakingPlatform contract on Sepolia Etherscan
 * 
 * Prerequisites:
 * 1. Set ETHERSCAN_API_KEY in .env
 * 2. Contract must be deployed to Sepolia
 * 
 * Usage:
 *   npx hardhat run scripts/verify.js --network sepolia
 */

const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2D4E08Bf40B963801b34d5eD4c16F3A71dc49916";

  console.log("=".repeat(60));
  console.log("Verifying StakingPlatform on Sepolia Etherscan");
  console.log("=".repeat(60));
  console.log(`Contract Address: ${contractAddress}`);
  console.log("-".repeat(60));

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log("=".repeat(60));
    console.log("✅ Contract verified successfully!");
    console.log(`View at: https://sepolia.etherscan.io/address/${contractAddress}#code`);
    console.log("=".repeat(60));
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
      console.log(`View at: https://sepolia.etherscan.io/address/${contractAddress}#code`);
    } else {
      console.error("❌ Verification failed:");
      console.error(error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});