require("dotenv").config();

const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
console.log(process.env.PRIVATE_KEY);
const providerWithPrivateKey = (key, rpcEndpoint) =>
  new HDWalletProvider(key, rpcEndpoint);

const infuraProvider = network =>
  providerWithPrivateKey(
    process.env.PRIVATE_KEY,
    `https://${network}.infura.io/${process.env.INFURA_API_KEY}`
  );

const rinkebyProvider = process.env.SOLIDITY_COVERAGE
  ? undefined
  : infuraProvider("rinkeby");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*" // eslint-disable-line camelcase
    },
    rinkeby: {
      provider: rinkebyProvider,
      network_id: 3 // eslint-disable-line camelcase
    },
    coverage: {
      host: "localhost",
      network_id: "*", // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01
    },
    ganache: {
      host: "localhost",
      port: 8545,
      network_id: "*" // eslint-disable-line camelcase
    }
  }
};
