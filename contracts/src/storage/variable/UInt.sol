pragma solidity ^0.5.0;

contract UInt {
	mapping(bytes32 => uint256) private _uInt;
	function get(bytes32 _key) public view returns (uint256) {
		return _uInt[_key];
	}
	// TODO only execute by our sysytem
	function add(bytes32 _key, uint256 _value) public {
		_uInt[_key] += _value;
	}
	// TODO only execute by our sysytem
	function increment(bytes32 _key) public {
		_uInt[_key]++;
	}
}
