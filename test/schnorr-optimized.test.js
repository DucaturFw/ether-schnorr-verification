const BN = require("bn.js");
const { soliditySHA3 } = require("ethereumjs-abi");
const keccak = require("keccak");
const SchnorrOptimized = artifacts.require("./SchnorrOptimized.sol");

const bn = (s, base = 16) => new BN(s, base).toString(10);
const prepare = (s, b = 10) =>
  "0x" +
  new BN(s, b)
    .toBuffer("be")
    .toString("hex")
    .padStart(64, "0");

contract("Schorr test", function([owner]) {
  before(async function() {
    this.SchnorrOptimized = await SchnorrOptimized.new();
  });

  it("Should verify", async function() {
    const args = [
      [
        // signature
        "27359431646879731609419392231034412574333995937362137743402222942305284468519",
        // random point x,
        bn("016b0da44b410943d044114f7f6356972db71c2d99fcaa315d3a4c3f90fe9623"),
        // random point y
        bn("2af2e01b05221606fc4107fc5cdfa0f1758335678ef25480eb4346241bb53dbb"),
        // group key x,
        bn("2b1f133f1dcf403a775a3624d5469c356c4df772585a92050f9e311ab8731b4e"),
        // group key y,
        bn("1385092f5a5bfaa6dee68550fb1ac55e13c4fd99b41c162bbbbffb908b4bdee3")
      ],
      prepare(
        "ed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd",
        16
      )
    ];
    const result = await this.SchnorrOptimized.verify(...args);
    assert.isTrue(result, "verified");
    // console.log(result.map(b => b.toString(10)));
    // assert.fail();
  });
});
