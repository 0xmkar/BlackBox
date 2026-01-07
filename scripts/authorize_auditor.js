const { ethers } = require('hardhat');

async function main() {
    const VERIFIER_ADDRESS = '0x42b639B95aEc440ea19A88BC9dcBb85e3510A747';
    const BACKEND_WALLET = '0xEF8b133D82dF774Ccc0Ed4337Ac5d91Ff5755340'; // Correct backend wallet address

    console.log('🔓 Authorizing backend wallet as auditor...');

    const AuditVerifier = await ethers.getContractFactory('AuditVerifier');
    const verifier = AuditVerifier.attach(VERIFIER_ADDRESS);

    const tx = await verifier.setAuditorAuthorization(BACKEND_WALLET, true);
    await tx.wait();

    console.log(`✅ Backend wallet ${BACKEND_WALLET} authorized!`);
    console.log(`Transaction: ${tx.hash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
