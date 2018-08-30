const BN = require("bn.js");
const { soliditySHA3 } = require("ethereumjs-abi");
const keccak = require("keccak");
const HashMock = artifacts.require("./HashMock.sol");

contract("Hash test", function([owner]) {
  before(async function() {
    this.HashMock = await HashMock.new();
  });

  it("same hash string", async function() {
    const base = keccak("keccak256")
      .update(Buffer.from("Hello world", "utf8"))
      .digest();
    const ethereum = await this.HashMock.h2("0x" + base.toString("hex"));
    const backend = soliditySHA3(["bytes32"], [base]);
    assert.equal(ethereum.toString("hex"), "0x" + backend.toString("hex"));
  });

  it("same hash uint", async function() {
    const base = 100;
    const ethereum = await this.HashMock.huint(base);
    const backend = soliditySHA3(["uint256"], [new BN(base)]);
    assert.equal(ethereum.toString("hex"), "0x" + backend.toString("hex"));
  });

  it("pack same", async function() {
    const num = 100;
    const msg = keccak("keccak256")
      .update(Buffer.from("Hello world", "utf8"))
      .digest()
      .toString("hex");

    const args = [num, num, num, num, msg];

    const ethereum = await this.HashMock.hpack(...args, { from: owner });
    const backend = soliditySHA3(
      ["uint256", "uint256", "uint256", "uint256", "bytes32"],
      args
    );
    assert.equal(ethereum.toString("hex"), "0x" + backend.toString("hex"));
  });

  it("same convert", async function() {
    const base = keccak("keccak256")
      .update(Buffer.from("Hello world", "utf8"))
      .digest();

    const ethereumCast = await this.HashMock.b32uint(
      "0x" + base.toString("hex")
    );
    const backendCast = new BN(base);

    assert.equal(ethereumCast.toString(10), backendCast.toString(10));
  });
});
