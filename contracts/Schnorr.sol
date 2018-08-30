pragma solidity ^0.4.24;
import "./crypto/secp256k1.sol";
pragma experimental ABIEncoderV2;


contract Schnorr {
  secp256k1 public curve;

  struct Point {
    uint256 x; uint256 y;
  }

  struct Verification {
    Point groupKey;
    Point randomPoint;
    uint256 signature;
    bytes32 message;

    uint256 _hash;
    Point _left;
    Point _right;
  }

  constructor() {
    curve = new secp256k1();
  }

  function h(uint256 a, uint256 b, uint256 c, uint256 d, bytes32 m) public view returns (uint256) {
    return uint256(sha3(a, b, c, d, m));
  }

  function cmul(Point p, uint256 scalar) public view returns (uint256, uint256) {
    return curve.ecmul(p.x, p.y, scalar);
  }

  function sg(uint256 sig_s) public view returns (uint256, uint256) {
    return curve.ecmul(curve.gx(), curve.gy(), sig_s);
  }

  function cadd(Point a, Point b) public view returns (uint256, uint256) {
    return curve.ecadd(a.x, a.y, b.x, b.y);
  }

  function verify(bytes32[6] _data)
    public view returns (bool) {

    Verification memory state;
    state.signature = uint256(_data[0]);
    state.groupKey.x = uint256(_data[1]);
    state.groupKey.y = uint256(_data[2]);
    state.randomPoint.x = uint256(_data[3]);
    state.randomPoint.y = uint256(_data[4]);
    state.message = bytes32(_data[5]);

    state._hash = h(state.groupKey.x, state.groupKey.y, state.randomPoint.x, state.randomPoint.y, state.message);
    (state._left.x, state._left.y) = sg(state.signature);
    Point memory rightPart;
    (rightPart.x, rightPart.y) = cmul(state.groupKey, state._hash);
    (state._right.x, state._right.y) = cadd(state.randomPoint, rightPart);

    return state._left.x == state._right.x && state._left.y == state._right.y;
  }
}