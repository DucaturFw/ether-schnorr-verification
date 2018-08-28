pragma solidity ^0.4.24;
import "./crypto/secp256k1.sol";
pragma experimental ABIEncoderV2;


contract Schnorr {
  secp256k1 public curve;

  struct Point {
    uint256 x; uint256 y;
  }

  struct Verification {
    Point X;
    Point R;
    uint256 S;
    bytes32 M;

    uint256 Hash;
    Point Left;
    Point Right;
  }

  constructor() {
    curve = new secp256k1();
  }

  function b32uint(bytes32 b) public view returns (uint256) {
    return uint256(b);
  }

  function h2(bytes32 m) public view returns (bytes32) {
    return sha3(m);
  }

  function h3(bytes32 m) public view returns (uint256) {
    return uint256(h2(m));
  }
  function huint(uint256 a) public view returns (bytes32) {
    return sha3(a);
  }
  function huint2(uint256 a, uint256 b) public view returns (bytes32) {
    return sha3(a, b);
  }

  function hpack(uint256 a, uint256 b, uint256 c, uint256 d, bytes32 m) public view returns (bytes32) {
    return sha3(a, b, c, d, m);
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

  function verify(bytes32 m, uint256 sig_s, uint256 Xx, uint256 Xy, uint256 Rx, uint256 Ry) public view returns (bool) {
    Verification memory state;

    state.S = sig_s;
    state.X.x = Xx;
    state.X.y = Xy;
    state.R.x = Rx;
    state.R.y = Ry;
    state.M = m;

    state.Hash = h(state.R.x, state.R.y, state.X.x, state.X.y, state.M);
    (state.Left.x, state.Left.y) = sg(sig_s);
    (state.Right.x, state.Right.y) = cmul(state.X, state.Hash);
    (state.Right.x, state.Right.y) = cadd(state.R, state.X);

    return state.Left.x == state.Right.x && state.Left.y == state.Right.y;
  }
}