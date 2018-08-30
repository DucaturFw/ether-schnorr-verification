var Migrations = artifacts.require("./Migrations.sol");
var Curve = artifacts.require("./Curve.sol");
var SchnorrOptimized = artifacts.require("./SchnorrOptimized.sol");
module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Curve);
  deployer.link(Curve, SchnorrOptimized);
  deployer.deploy(SchnorrOptimized);
};
