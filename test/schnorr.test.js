const BN = require("bn.js");
const { soliditySHA3 } = require("ethereumjs-abi");
const keccak = require("keccak");
const Schnorr = artifacts.require("./Schnorr.sol");

const bn = (s, base) => web3._extend.utils.toBigNumber(s, base);

contract("Schorr test", function([owner]) {
  before(async function() {
    this.schnorr = await Schnorr.new();
  });

  it("same hash string", async function() {
    const base = keccak("keccak256")
      .update(Buffer.from("Hello world", "utf8"))
      .digest();
    const ethereum = await this.schnorr.h2("0x" + base.toString("hex"));
    const backend = soliditySHA3(["bytes32"], [base]);
    assert.equal(ethereum.toString("hex"), "0x" + backend.toString("hex"));
  });

  it("same hash uint", async function() {
    const base = 100;
    const ethereum = await this.schnorr.huint(base);
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

    const ethereum = await this.schnorr.hpack(...args, { from: owner });
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

    const ethereumCast = await this.schnorr.b32uint(
      "0x" + base.toString("hex")
    );
    const backendCast = new BN(base);

    assert.equal(ethereumCast.toString(10), backendCast.toString(10));
  });

  it("Should verify", async function() {
    // console.log(new BN(100).toString("hex").padStart(64, "0"));
    const prepare = (s, b = 10) =>
      "0x" +
      new BN(s, b)
        .toBuffer("be")
        .toString("hex")
        .padStart(64, "0");

    const args = [
      prepare(
        "78979764221832073909817522700850834060635990401972146799911533383626801704681",
        10
      ),
      // group key x,
      prepare(
        "24736935343165825080282400575923847395594648488345738077476097451003541905756",
        10
      ),
      // group key y,
      prepare(
        "40074007749932387633659148814363199224814536891319900959009249769662255181086",
        10
      ),
      // random point x,
      prepare(
        "95348343281288161215188211927140077048917307991899458005404158061001536066017",
        10
      ),
      // random point y
      prepare(
        "84050603013619111471897158401371302344388631458561673492169270465812410656747",
        10
      ),
      prepare(
        "ed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd",
        16
      )
    ];
    const result = await this.schnorr.verify(args);
    assert.isTrue(result);
  });
});
