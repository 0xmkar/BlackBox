const hre = require("hardhat");

/**
 * Initialize the Curator Vault
 * This only needs to be run ONCE after deployment
 */
async function main() {
    console.log("🏦 Initializing Curator Vault...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Contract addresses from latest deployment
    const VAULT_ADDRESS = process.env.CONTRACT_ADDRESS_CURATOR_VAULT || "0x8e552DC456E7C1BA7E85761a335463136E45238E";
    const METH_ADDRESS = process.env.CONTRACT_ADDRESS_MOCK_METH || "0xaA0a9cEa004b9bB9Fb60c882d267956DEC9c6e03";

    // Curator will be the deployer for demo purposes
    const CURATOR_ADDRESS = deployer.address;

    console.log("📋 Configuration:");
    console.log("  Vault Contract:", VAULT_ADDRESS);
    console.log("  mETH Token:", METH_ADDRESS);
    console.log("  Curator:", CURATOR_ADDRESS);
    console.log("");

    // Get vault contract
    const CuratorVault = await hre.ethers.getContractFactory("CuratorVault");
    const vault = CuratorVault.attach(VAULT_ADDRESS);

    // Check if vault is already created
    try {
        const vaultInfo = await vault.getVaultInfo();
        if (vaultInfo.active) {
            console.log("✅ Vault is already initialized!");
            console.log("\nVault Details:");
            console.log("  Curator:", vaultInfo.curator);
            console.log("  Asset:", vaultInfo.asset);
            console.log("  Total AUM:", vaultInfo.totalAUM.toString());
            console.log("  Active:", vaultInfo.active);
            return;
        }
    } catch (error) {
        console.log("Vault not initialized yet, proceeding with creation...\n");
    }

    // Create vault
    console.log("Creating vault...");
    const tx = await vault.createVault(METH_ADDRESS, CURATOR_ADDRESS);
    console.log("Transaction sent:", tx.hash);

    console.log("Waiting for confirmation...");
    await tx.wait();

    console.log("\n✅ Vault created successfully!");

    // Verify creation
    const vaultInfo = await vault.getVaultInfo();
    console.log("\n📊 Vault Details:");
    console.log("  Curator:", vaultInfo.curator);
    console.log("  Asset (mETH):", vaultInfo.asset);
    console.log("  Total AUM:", vaultInfo.totalAUM.toString());
    console.log("  Active:", vaultInfo.active);
    console.log("  Created At:", new Date(Number(vaultInfo.createdAt) * 1000).toISOString());

    console.log("\n🎉 Vault is ready to use!");
    console.log("\nNext steps:");
    console.log("1. Get test mETH: npm run faucet");
    console.log("2. View vault: http://localhost:3001/vault");
    console.log("3. Deposit mETH and record PACs!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
