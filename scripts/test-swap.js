const hre = require("hardhat");

/**
 * Test script for FusionX swap integration
 * Tests the complete flow: create vault → deposit → swap
 */
async function main() {
    console.log("🧪 Testing FusionX Swap Integration\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing with account:", deployer.address);
    console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "MNT\n");

    // Contract addresses (update after deployment)
    const VAULT_ADDRESS = process.env.CONTRACT_ADDRESS_CURATOR_VAULT;
    const METH_ADDRESS = process.env.CONTRACT_ADDRESS_MOCK_METH;
    const USDT_ADDRESS = process.env.CONTRACT_ADDRESS_MOCK_USDT;
    const REGISTRY_ADDRESS = process.env.CONTRACT_ADDRESS_REGISTRY;

    if (!VAULT_ADDRESS || !METH_ADDRESS) {
        console.error("❌ Missing contract addresses in .env");
        console.log("Run: npm run deploy:sepolia first");
        return;
    }

    console.log("📋 Configuration:");
    console.log("  Vault:", VAULT_ADDRESS);
    console.log("  mETH:", METH_ADDRESS);
    console.log("  USDT:", USDT_ADDRESS);
    console.log("");

    // Get contract instances
    const MockMETH = await hre.ethers.getContractFactory("MockMETH");
    const meth = MockMETH.attach(METH_ADDRESS);

    const Vault = await hre.ethers.getContractFactory("CuratorVault");
    const vault = Vault.attach(VAULT_ADDRESS);

    // Step 1: Check if vault is created
    console.log("1️⃣ Checking vault status...");
    try {
        const vaultInfo = await vault.getVaultInfo();
        if (!vaultInfo.active) {
            console.log("⚠️  Vault not active. Creating vault...");
            const tx = await vault.createVault(METH_ADDRESS, deployer.address);
            await tx.wait();
            console.log("✅ Vault created!");
        } else {
            console.log("✅ Vault already active");
            console.log("  Curator:", vaultInfo.curator);
            console.log("  AUM:", hre.ethers.formatEther(vaultInfo.totalAUM), "mETH");
        }
    } catch (error) {
        console.error("❌ Error checking vault:", error.message);
        return;
    }

    // Step 2: Mint test tokens
    console.log("\n2️⃣ Minting test tokens...");
    try {
        const mintAmount = hre.ethers.parseEther("1000");
        const tx = await meth.mint(deployer.address, mintAmount);
        await tx.wait();

        const balance = await meth.balanceOf(deployer.address);
        console.log("✅ Minted 1000 mETH");
        console.log("  Balance:", hre.ethers.formatEther(balance), "mETH");
    } catch (error) {
        console.error("❌ Error minting:", error.message);
        return;
    }

    // Step 3: Deposit to vault
    console.log("\n3️⃣ Depositing to vault...");
    try {
        const depositAmount = hre.ethers.parseEther("100");

        // Approve first
        console.log("  Approving vault...");
        const approveTx = await meth.approve(VAULT_ADDRESS, depositAmount);
        await approveTx.wait();

        // Deposit
        console.log("  Depositing 100 mETH...");
        const depositTx = await vault.depositToken(METH_ADDRESS, depositAmount);
        await depositTx.wait();

        const vaultBalance = await vault.getTokenBalance(METH_ADDRESS);
        console.log("✅ Deposited to vault");
        console.log("  Vault mETH balance:", hre.ethers.formatEther(vaultBalance), "mETH");
    } catch (error) {
        console.error("❌ Error depositing:", error.message);
        return;
    }

    // Step 4: Execute swap (if USDT exists)
    if (USDT_ADDRESS && USDT_ADDRESS !== "") {
        console.log("\n4️⃣ Testing swap execution...");
        try {
            const swapAmount = hre.ethers.parseEther("10");

            // Generate PAC
            const pacData = hre.ethers.solidityPacked(
                ['address', 'address', 'uint256', 'uint256'],
                [METH_ADDRESS, USDT_ADDRESS, swapAmount, Date.now()]
            );
            const pac = hre.ethers.keccak256(pacData);

            console.log("  Executing swap: 10 mETH → USDT");
            console.log("  PAC:", pac);

            const swapTx = await vault.executePrivateSwap(
                METH_ADDRESS,
                USDT_ADDRESS,
                swapAmount,
                3000, // 0.3% fee
                pac
            );

            console.log("  Transaction sent:", swapTx.hash);
            const receipt = await swapTx.wait();

            console.log("✅ Swap executed!");
            console.log("  Block:", receipt.blockNumber);
            console.log("  Gas used:", receipt.gasUsed.toString());
            console.log("  Explorer:", `https://sepolia.mantlescan.xyz/tx/${swapTx.hash}`);

            // Check new balances
            const vaultInfo = await vault.getVaultInfo();
            console.log("  New AUM:", hre.ethers.formatEther(vaultInfo.totalAUM));
            console.log("  Latest PAC:", vaultInfo.latestPAC);
        } catch (error) {
            console.error("❌ Error executing swap:", error.message);
            console.log("\n⚠️  This is expected if:");
            console.log("  - FusionX pool doesn't have liquidity for mETH/USDT");
            console.log("  - USDT isn't deployed");
            console.log("\nFor demo, you can:");
            console.log("  1. Deploy MockUSDT");
            console.log("  2. Create a FusionX pool (or use different tokens)");
            console.log("  3. Test with tokens that have existing pools");
        }
    } else {
        console.log("\n4️⃣ Skipping swap test (USDT not deployed)");
        console.log("  Deploy USDT first: npm run deploy:sepolia");
    }

    console.log("\n✨ Test complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
