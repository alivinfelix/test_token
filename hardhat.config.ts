import { config } from 'dotenv';
config({
  path: '.env',
});

import { HardhatUserConfig } from 'hardhat/types';

// import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';
import 'solidity-coverage';
import 'hardhat-gas-reporter';
import '@nomiclabs/hardhat-web3';

const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || '';
const ETHEREUM_RINKEBY_KEY = process.env.ETHEREUM_RINKEBY_KEY || '';
const ETHEREUM_MAINNET_KEY = process.env.ETHEREUM_MAINNET_KEY || '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || '';
const POLYGON_API_KEY = process.env.POLYGON_API_KEY || '';

const hardhatConfig: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [
      {
        version: '0.8.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {},
    mainnet: {
      url: ``,
      gasPrice: 11000000000,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },

    ethernity: {
      url: `https://devnet1.ethernitychain.io/rpc`,
      //gasPrice: 11000000000,
      accounts: [``], 
    }, 


  },
  etherscan: {

    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      ethernity: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: 'sepolia',
        chainId: 31337,
        urls: {
          apiURL: 'https://api-sepolia.etherscan.io/api',
          browserURL: 'https://sepolia.etherscan.io',
        },
      },
      {
        network: 'ethernity',
        chainId: 42069,
        urls: {
          apiURL: 'https://dev.ernscan.io/api',
          browserURL: 'https://dev.ernscan.io',
        },
      },

    ],
  },
  gasReporter: {
    currency: 'USDT',
    coinmarketcap: '',
  },
};

export default hardhatConfig;
