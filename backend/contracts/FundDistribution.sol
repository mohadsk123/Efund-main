// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FundDistribution {
    address public owner;

    struct Beneficiary {
        string name;
        string scheme;
        bool isApproved;
        uint256 totalReceived;
    }

    mapping(address => Beneficiary) public beneficiaries;
    address[] public beneficiaryAddresses;

    event BeneficiaryAdded(address indexed beneficiaryAddress, string name, string scheme);
    event BeneficiaryApproved(address indexed beneficiaryAddress);
    event FundsDisbursed(address indexed beneficiaryAddress, uint256 amount, string scheme);
    event FundsDeposited(address indexed depositor, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    // --- Write Functions ---

    function depositFunds() public payable onlyOwner {
        require(msg.value > 0, "Must send ETH.");
        emit FundsDeposited(msg.sender, msg.value);
    }

    function addBeneficiary(address _beneficiaryAddress, string memory _name, string memory _scheme) public onlyOwner {
        require(_beneficiaryAddress != address(0), "Invalid address.");
        require(beneficiaries[_beneficiaryAddress].totalReceived == 0, "Beneficiary already exists.");

        beneficiaries[_beneficiaryAddress] = Beneficiary(_name, _scheme, false, 0);
        beneficiaryAddresses.push(_beneficiaryAddress);
        emit BeneficiaryAdded(_beneficiaryAddress, _name, _scheme);
    }

    function approveBeneficiary(address _beneficiaryAddress) public onlyOwner {
        require(beneficiaries[_beneficiaryAddress].totalReceived > 0 || beneficiaries[_beneficiaryAddress].isApproved == false, "Beneficiary not found or already approved.");
        
        beneficiaries[_beneficiaryAddress].isApproved = true;
        emit BeneficiaryApproved(_beneficiaryAddress);
    }

    function disburseFunds(address _beneficiaryAddress, uint256 amount) public onlyOwner {
        require(beneficiaries[_beneficiaryAddress].isApproved, "Beneficiary not approved.");
        require(address(this).balance >= amount, "Insufficient contract balance.");

        (bool success, ) = _beneficiaryAddress.call{value: amount}("");
        require(success, "ETH transfer failed.");

        beneficiaries[_beneficiaryAddress].totalReceived += amount;
        emit FundsDisbursed(_beneficiaryAddress, amount, beneficiaries[_beneficiaryAddress].scheme);
    }

    // --- Read Functions ---

    function getBeneficiaryDetails(address _beneficiaryAddress) public view returns (string memory name, string memory scheme, bool isApproved, uint256 totalReceived) {
        Beneficiary storage b = beneficiaries[_beneficiaryAddress];
        return (b.name, b.scheme, b.isApproved, b.totalReceived);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTotalBeneficiaries() public view returns (uint256) {
        return beneficiaryAddresses.length;
    }
}