pragma solidity ^0.4.24;
import "./crypto/Curve.sol";
pragma experimental ABIEncoderV2;


contract SchnorrOptimized {
  using Curve for *;

  function h(uint256 a, uint256 b, uint256 c, uint256 d, bytes32 m) public view returns (uint256) {
    return uint256(sha3(a, b, c, d, m));
  }

  function verify(uint256[5] _musig, bytes32 _message) public view returns (bool) {
    uint256 H = h(_musig[1], _musig[2], _musig[3], _musig[4], _message) % Curve.N();
    Curve.G1Point memory sG = Curve.g1mul(Curve.G(), _musig[0]);
    Curve.G1Point memory sV = Curve.g1add(
      Curve.G1Point(_musig[3], _musig[4]), 
      Curve.g1mul(
        Curve.G1Point(_musig[1], _musig[2]), H
      )
    );
    return sG.X == sV.X && sG.Y == sV.Y;
  }
}