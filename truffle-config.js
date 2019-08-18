const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize the Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      //Select the blockchain to deploy based on different ports.
      port: 8545,
      // port:7545,
      network_id: "*" // Match any network id
    }
  }
};