require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.23",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        mantleSepolia: {
            url: process.env.MANTLE_RPC_URL || "https://rpc.sepolia.mantle.xyz",
            chainId: 5003,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
        mantle: {
            url: process.env.MANTLE_MAINNET_RPC_URL || "https://rpc.mantle.xyz",
            chainId: 5000,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
    etherscan: {
        apiKey: {
            mantleSepolia: process.env.MANTLE_API_KEY || "no-api-key-needed",
            mantle: process.env.MANTLE_API_KEY || "no-api-key-needed",
        },
        customChains: [
            {
                network: "mantleSepolia",
                chainId: 5003,
                urls: {
                    apiURL: "https://api-sepolia.mantlescan.xyz/api",
                    browserURL: "https://sepolia.mantlescan.xyz",
                },
            },
            {
                network: "mantle",
                chainId: 5000,
                urls: {
                    apiURL: "https://api.mantlescan.xyz/api",
                    browserURL: "https://mantlescan.xyz",
                },
            },
        ],
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};
