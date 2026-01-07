const hre = require("hardhat");

/**
 * Get test mETH tokens from faucet
 * Usage: node scripts/get-meth.js [amount] [address]
 */
async function main() {
    const args = process.argv.slice(2);
    const amount = args[0] || "1000"; // Default 1000 mETH
    const targetAddress = args[1]; // Optional, uses signer if not provided

    console.log("💧 mETH Faucet\n");

    const [signer] = await hre.ethers.getSigners();
    const recipient = targetAddress || signer.address;

    const METH_ADDRESS = process.env.CONTRACT_ADDRESS_MOCK_METH || "0xaA0a9cEa004b9bB9Fb60c882d267956DEC9c6e03";

    console.log("📋 Configuration:");
    console.log("  MockMETH:", METH_ADDRESS);
    console.log("  Recipient:", recipient);
    console.log("  Amount:", amount, "mETH\n");

    // Get MockMETH contract
    const MockMETH = await hre.ethers.getContractFactory("MockMETH");
    const meth = MockMETH.attach(METH_ADDRESS);

    // Check current balance
    const balanceBefore = await meth.balanceOf(recipient);
    console.log("Balance before:", hre.ethers.formatEther(balanceBefore), "mETH");

    // Mint tokens
    const amountWei = hre.ethers.parseEther(amount);
    console.log("\nMinting", amount, "mETH...");

    const tx = await meth.mint(recipient, amountWei);
    console.log("Transaction:", tx.hash);

    console.log("Waiting for confirmation...");
    await tx.wait();

    // Check new balance
    const balanceAfter = await meth.balanceOf(recipient);
    console.log("\n✅ Tokens minted successfully!");
    console.log("Balance after:", hre.ethers.formatEther(balanceAfter), "mETH");
    console.log("Increase:", hre.ethers.formatEther(balanceAfter - balanceBefore), "mETH");

    console.log("\n🎉 You can now deposit mETH into the vault!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
