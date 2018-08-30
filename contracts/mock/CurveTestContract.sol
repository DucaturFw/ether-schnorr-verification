pragma solidity ^0.4.24;
import "../crypto/Curve.sol";

contract CurveTestContract {
  using Curve for *;

  function add(uint256 ax, uint256 ay, uint256 bx, uint256 by) public view returns (uint256, uint256) {
    Curve.G1Point memory point = Curve.g1add(Curve.G1Point(ax, ay), Curve.G1Point(bx, by));
    return (point.X, point.Y);
  }

  function mul(uint256 x, uint256 y, uint256 s) public view returns (uint256, uint256) {
    Curve.G1Point memory point = Curve.g1mul(Curve.G1Point(x, y), s);
    return (point.X, point.Y);
  }

  function gmul(uint256 s) public view returns (uint256, uint256) {
    Curve.G1Point memory point = Curve.g1mul(Curve.G(), s);
    return (point.X, point.Y);
  }

  function toPublic(uint256 x) public view returns (uint256, uint256) {
    Curve.G1Point memory pubKey = Curve.g1mul(Curve.G(), x);
    return (pubKey.X, pubKey.Y);
  }
}