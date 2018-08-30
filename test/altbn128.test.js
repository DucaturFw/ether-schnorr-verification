const BN = require("bn.js");
const CurveTestContract = artifacts.require("./CurveTestContract.sol");
const SchnorrOptimized = artifacts.require("./SchnorrOptimized.sol");
const musig = require("./lib/musig");

const bn = (s, base = 10) => web3._extend.utils.toBigNumber(s, base);

contract("CurveTestContract", function([owner]) {
  before(async function() {
    this.Curve = await CurveTestContract.new();
    this.Schnorr = await SchnorrOptimized.new();
  });
  it("should generate proper public key", async function() {
    const [pubX, pubY] = await this.Curve.toPublic(
      bn(
        "14925487677082928230951938368377743086888280203575008403149805537056185503599"
      )
    );

    assert.equal(
      pubX.toString(16),
      "16e6984ff565aa53b12827e91495e02d1bdfdff9ac44d9a279b89d99a291b2a1"
    );
    assert.equal(
      pubY.toString(16),
      "264841388e465bfcad7529541bf7a7c61d997099e7bc6d809d7ba5f3786e270d"
    );
  });

  it("generator multiplication", async function() {
    const [Px, Py] = await this.Curve.gmul(
      bn(
        "5757024612911325775202983320339872721909360638620580138219830937014904505552"
      )
    );

    assert.equal(
      Px.toString(16),
      "aea82b47f013cdfb51ebfe361ca173207dd1c95611cc184e4eaea9a80ff1e8"
    );
    assert.equal(
      Py.toString(16),
      "13d1ab9cef2d8bff5f85946f2c15997d21216e66c5aff4d19f79b551d8d3c131"
    );
  });

  it("point scalar multiplication", async function() {
    const [Px, Py] = await this.Curve.mul(
      new BN(
        "2b1f133f1dcf403a775a3624d5469c356c4df772585a92050f9e311ab8731b4e",
        16
      ).toString(10),
      new BN(
        "1385092f5a5bfaa6dee68550fb1ac55e13c4fd99b41c162bbbbffb908b4bdee3",
        16
      ).toString(10),
      bn(
        "79885255202296549744890907630598700984732035842759115779465785668476403504204"
      )
    );

    assert.equal(
      Px.toString(16),
      "2369346eadce21c6bf69828e8a49b377b5c97bcb99945aeb94da0239d6a4c79f"
    );
    assert.equal(
      Py.toString(16),
      "12485d660242d48da7edd158aa550b9100601f8b98c8449579f1b5d7e24ba99e"
    );
  });

  it("points addition", async function() {
    const [x, y] = await this.Curve.add(
      new BN(
        "2369346eadce21c6bf69828e8a49b377b5c97bcb99945aeb94da0239d6a4c79f",
        16
      ).toString(10),
      new BN(
        "12485d660242d48da7edd158aa550b9100601f8b98c8449579f1b5d7e24ba99e",
        16
      ).toString(10),
      new BN(
        "016b0da44b410943d044114f7f6356972db71c2d99fcaa315d3a4c3f90fe9623",
        16
      ).toString(10),
      new BN(
        "2af2e01b05221606fc4107fc5cdfa0f1758335678ef25480eb4346241bb53dbb",
        16
      ).toString(10)
    );

    assert.equal(
      x.toString(16),
      "aea82b47f013cdfb51ebfe361ca173207dd1c95611cc184e4eaea9a80ff1e8"
    );
    assert.equal(
      y.toString(16),
      "13d1ab9cef2d8bff5f85946f2c15997d21216e66c5aff4d19f79b551d8d3c131"
    );
  });

  it("verification", async function() {
    const keys = [
      "5163d545d17016acac014f8ffee3f0a11ace3a3b77be09b2bc4e88bbfa6dcf70",
      "5163d545d17016acac014f8ffee3f0a11ace3a3b77be09b2bc4e88bbfa6dcf71",
      "5163d545d17016acac014f8ffee3f0a11ace3a3b77be09b2bc4e88bbfa6dcf72"
    ].map(raw => musig.ecurve.keyFromPrivate(raw, "hex"));

    const rnd = [
      "5163d545d17016acac014f8ffee3f0a11ace3a3b77be09b2bc4e88bbfa6dcf73",
      "5163d545d17016acac014f8ffee3f0a11ace3a3b77be09b2bc4e88bbfa6dcf74",
      "5163d545d17016acac014f8ffee3f0a11ace3a3b77be09b2bc4e88bbfa6dcf75"
    ].map(raw => musig.ecurve.keyFromPrivate(raw, "hex"));

    const pubs = keys.map(k => k.getPublic());
    const nonce = musig.signerGroupNonce(pubs);
    const groupPublicKey = musig.getAggregatePublicKey(nonce, pubs);
    const groupRandomPoint = musig.aggregatedPoint(rnd.map(r => r.getPublic()));
    const message = musig.hash(Buffer.from("Hello world", "utf8"));

    const si = keys.map((priv, index) =>
      musig.getSignature(
        rnd[index].getPrivate(),
        groupPublicKey,
        groupRandomPoint,
        message,
        nonce,
        priv.getPrivate(),
        pubs[index]
      )
    );

    const s = musig.combineSignatures(si, groupRandomPoint);

    assert.isTrue(
      musig.verifySignature(message, s, groupPublicKey, groupRandomPoint)
    );

    const lPointBackend = musig.ecurve.curve.g.mul(s.s);

    const rHashBackend = musig.hashGroupKeyWithPointAndMessage(
      groupRandomPoint,
      groupPublicKey,
      message
    );

    const rPointFirstBackend = groupPublicKey.mul(rHashBackend);
    const rPointBackend = groupRandomPoint.add(rPointFirstBackend);

    const lPointEthereum = await this.Curve.gmul(s.s.toString(10));
    const rHashEthereum = await this.Schnorr.h(
      groupRandomPoint.x.fromRed().toString(10),
      groupRandomPoint.y.fromRed().toString(10),
      groupPublicKey.x.fromRed().toString(10),
      groupPublicKey.y.fromRed().toString(10),
      "0x" + message.toString("hex")
    );
    const rPointFirstEthereum = await this.Curve.mul(
      groupPublicKey.x.fromRed().toString(10),
      groupPublicKey.y.fromRed().toString(10),
      rHashEthereum.toString(10)
    );
    const rPointEthereum = await this.Curve.add(
      groupRandomPoint.x.fromRed().toString(10),
      groupRandomPoint.y.fromRed().toString(10),
      rPointFirstEthereum[0].toString(10),
      rPointFirstEthereum[1].toString(10)
    );

    assert.equal(
      lPointBackend.x.fromRed().toString(10),
      lPointEthereum[0].toString(10)
    );
    assert.equal(
      lPointBackend.y.fromRed().toString(10),
      lPointEthereum[1].toString(10)
    );

    assert.equal(rHashBackend.toString(10), rHashEthereum.toString(10));

    assert.equal(
      rPointFirstBackend.x.fromRed().toString(10),
      rPointFirstEthereum[0].toString(10)
    );
    assert.equal(
      rPointFirstBackend.y.fromRed().toString(10),
      rPointFirstEthereum[1].toString(10)
    );

    assert.equal(
      rPointBackend.x.fromRed().toString(10),
      rPointEthereum[0].toString(10)
    );
    assert.equal(
      rPointBackend.y.fromRed().toString(10),
      rPointEthereum[1].toString(10)
    );

    // console.log(lPointBackend.inspect(), rPointBackend.inspect());
    assert.isTrue(lPointBackend.eq(rPointBackend));
    // uint256 H = h(_musig[1], _musig[2], _musig[3], _musig[4], _message) % Curve.N();
    // Curve.G1Point memory sG = Curve.g1mul(Curve.G(), _musig[0]);
    // Curve.G1Point memory sV = Curve.g1add(
    //   Curve.G1Point(_musig[3], _musig[4]),
    //   Curve.g1mul(
    //     Curve.G1Point(_musig[1], _musig[2]), H
    //   )
    // );
    // return sG.X == sV.X && sG.Y == sV.Y;
  });

  it("test predefined", async function() {
    const bn = s => new BN(s, 16).toString(10);
    const args = [
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
    ];

    const lPoint = await this.Curve.gmul(args[0]);

    const rHashEthereum = await this.Schnorr.h(
      args[1],
      args[2],
      args[3],
      args[4],
      "0xed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd"
    );

    const rPointFirstEthereum = await this.Curve.mul(
      args[3],
      args[4],
      rHashEthereum.toString(10)
    );
    const rPointEthereum = await this.Curve.add(
      args[1],
      args[2],
      rPointFirstEthereum[0].toString(10),
      rPointFirstEthereum[1].toString(10)
    );

    assert.equal(
      "81613583553659248345858623011602593719626225442792210061022345551725039900000",
      rHashEthereum.toString(10)
    );

    assert.equal(
      "2f010c9378b5deaf443cd06f8ddac546f881ea7ddb3cca8ae97f1f7713974064",
      rPointFirstEthereum[0].toString(16)
    );
    assert.equal(
      "23404f7440f811ea259f4ed1613bd2e3531a223f532c2f57cefe1a920d6f48e7",
      rPointFirstEthereum[1].toString(16)
    );

    assert.equal(
      "0f2df662edab38088b8a47f64da43a2c64679930e9deb65dfdafc3ac934a2e74",
      rPointEthereum[0].toString(16).padStart(64, "0")
    );
    assert.equal(
      "2805e8c73fdf09ba270de8b92c2edb4c3be0e470c9b3862d2cc19c11e34c8405",
      rPointEthereum[1].toString(16).padStart(64, "0")
    );

    assert.equal(
      "0f2df662edab38088b8a47f64da43a2c64679930e9deb65dfdafc3ac934a2e74",
      lPoint[0].toString(16).padStart(64, "0")
    );
    assert.equal(
      "2805e8c73fdf09ba270de8b92c2edb4c3be0e470c9b3862d2cc19c11e34c8405",
      lPoint[1].toString(16).padStart(64, "0")
    );
  });
});
