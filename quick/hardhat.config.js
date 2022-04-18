/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");

module.exports = {
  defaultNetwork: "hardhat",
  paths: {
    artifacts: './artifacts',
  },
  networks: {
    // $npx hardhat run scripts/deploy.js --network localhost
    // https://hardhat.org/config/
    hardhat: {
      chainId: 1337, // Use this for frontend with metamaks?
      gas: 500000000000000,
      gasLimit: 5000000000000000,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: `http://127.0.0.1:8545`,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
      },
    ]
  }
};
