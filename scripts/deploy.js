
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment of SupplyChainVerification contract...");

  // Get the contract factory
  const SupplyChainVerification = await ethers.getContractFactory("SupplyChainVerification");
  
  // Deploy the contract
  const supplyChain = await SupplyChainVerification.deploy();
  
  // Wait for deployment to complete
  await supplyChain.deploymentTransaction().wait();
  
  // Get the deployed contract address
  console.log(`SupplyChainVerification deployed to: ${await supplyChain.getAddress()}`);

  console.log("Deployment complete!");
  
  // Optional: Verify contract on block explorer if ETHERSCAN_API_KEY is set
  // Uncomment the following section if you want to verify the contract
  /*
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    
    // Wait for 6 block confirmations
    await supplyChain.deploymentTransaction().wait(6);
    
    // Verify the contract
    await hre.run("verify:verify", {
      address: await supplyChain.getAddress(),
      constructorArguments: [],
    });
    console.log("Contract verified!");
  }
  */
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

