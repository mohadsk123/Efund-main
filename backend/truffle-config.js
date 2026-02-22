//for Ganache local blockchain
// module.exports = {
//   networks: {
//     development: {
//       host: "127.0.0.1",
//       port: 7545, // Default Ganache port
//       network_id: "5777", // Match any network id
//     },
//     sepolia: {
//       // You would configure Sepolia here using HDWalletProvider
//       // provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL),
//       // network_id: 11155111,
//       // gas: 5500000,
//       // confirmations: 2,
//       // timeoutBlocks: 200,
//       // skipDryRun: true
//     }
//   },
//   compilers: {
//     solc: {
//       version: "0.8.20", // Match your contract's pragma
//     }
//   }
// };

// const HDWalletProvider = require('@truffle/hdwallet-provider');
// require('dotenv').config();

// module.exports = {
//   networks: {
//     sepolia: {
//       provider: () =>
//         new HDWalletProvider(
//           process.env.PRIVATE_KEY,
//           process.env.RPC_URL
//         ),
//       network_id: 11155111,
//       confirmations: 2,
//       timeoutBlocks: 200,
//       skipDryRun: true
//     }
//   },
//   compilers: {
//     solc: {
//       version: "0.8.20", // Match your contract's pragma
//     }
//   }
// };


// const HDWalletProvider = require("@truffle/hdwallet-provider");
// require("dotenv").config({ path: "./.env" });

// module.exports = {
//   networks: {
//     sepolia: {
//       provider: () =>
//         new HDWalletProvider({
//           privateKeys: [process.env.PRIVATE_KEY],
//           providerOrUrl: process.env.RPC_URL,
//         }),
//       network_id: 11155111,
//       confirmations: 2,
//       timeoutBlocks: 200,
//       skipDryRun: true,
//     },
//   },

//   compilers: {
//     solc: {
//       version: "0.8.20",
//     },
//   },
// };

const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config({ path: "./.env" });

module.exports = {
  networks: {
    sepolia: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/A0lwY4JVuHJJWvQD9sEyF"
        ),
      network_id: 11155111,
      gas: 8000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: { enabled: true, runs: 200 }
      }
    },
  },
};
