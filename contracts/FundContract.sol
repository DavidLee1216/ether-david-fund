// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

contract Fund {
    address public Owner;
    string public fundName;
    mapping(address => uint256) public customerBalance;

    constructor() {
        Owner = msg.sender;
    }

    function depositMoney() public payable {
        require(msg.value != 0, "You need to deposit some amount of money!");
        customerBalance[msg.sender] += msg.value;
    }

    function setFundName(string memory _name) external {
        require(
            msg.sender == Owner,
            "You must be the owner to set the name of the bank"
        );
        fundName = _name;
    }

    function withDrawMoney(uint256 _total) public payable {
        require(msg.sender == Owner && _total < address(this).balance);
        payable(Owner).transfer(_total);
    }

    function getCustomerBalance() external view returns (uint256) {
        return customerBalance[msg.sender];
    }

    function getFundBalance() public view returns (uint256) {
        require(
            msg.sender == Owner,
            "You must be the owner of the bank to see all balances."
        );
        return address(this).balance;
    }
}
