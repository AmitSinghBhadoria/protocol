pragma solidity ^0.5.0;

import {IGroup} from "contracts/src/common/interface/IGroup.sol";

contract IPolicyGroup is IGroup {
	function deleteGroup(address _addr) external;
}
