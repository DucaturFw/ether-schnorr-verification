pragma solidity ^0.4.24;


contract HashMock {
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
}