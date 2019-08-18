var CredentialStore = artifacts.require("./CredentialStore.sol");
var UserloginInfo = artifacts.require("./UserloginInfo.sol");

module.exports = function(deployer) {
  deployer.deploy(CredentialStore);
  deployer.deploy(UserloginInfo);
};