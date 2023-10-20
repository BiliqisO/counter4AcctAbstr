// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Counter is ERC2771Context{
    uint256 public number;
    address  public msgSender;
    
    constructor(address _trustedForwarder) ERC2771Context(_trustedForwarder){
}
    function setNumber(uint256 newNumber) public {
        number = newNumber;
        msgSender =_msgSender() ;
    }

    function increment() public {
        number++;
        msgSender = _msgSender() ;

    }
    function returnAddr() public view returns(address){
        return msgSender;
    }
}
