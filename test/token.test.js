const AlexToken = artifacts.require("./AlexToken.sol");

contract("Token test", function([owner]) {
  before(async function() {
    this.token = await AlexToken.new();
  });

  it("should have mint initial balance", async function() {
    const balance = await this.token.balanceOf(owner);
    expect(balance.div(1e18).toNumber()).equal(500e6);
  });
});
