require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const RPC_URL_SEPOLIA = process.env.RPC_URL_SEPOLIA || "fallback"
const RPC_URL_MAINNET = process.env.RPC_URL_MAINNET || "fallback"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "fallback"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "fallback"
const CMC_API_KEY = process.env.CMC_API_KEY || "fallback"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            { version: "0.8.18" },
            { version: "0.6.6" },
            { version: "0.6.12" },
            { version: "0.4.19" },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: RPC_URL_SEPOLIA,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
        hardhat: {
            chainId: 31337,
            forking: {
                url: RPC_URL_MAINNET,
            },
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        // coinmarketcap: CMC_API_KEY,
        // token: 'MATIC'
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
}
