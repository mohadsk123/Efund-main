// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FundDistribution is Ownable, ReentrancyGuard {
    
    enum Gender { All, Male, Female, Other }

    struct Scheme {
        uint256 id;
        string name;
        uint256 budget;
        uint256 amountPerBeneficiary;
        uint256 maxIncomeThreshold;
        uint256 minAge;
        uint256 maxAge;
        Gender genderRequirement;
        bool isActive;
    }

    struct Beneficiary {
        string name;
        uint256 age;
        Gender gender;
        uint256 income;
        bool isRegistered;
        uint256 totalReceived;
    }

    uint256 public schemeCount;
    mapping(uint256 => Scheme) public schemes;
    mapping(address => Beneficiary) public beneficiaries;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event SchemeCreated(uint256 indexed id, string name, uint256 budget);
    event BeneficiaryRegistered(address indexed beneficiary, string name);
    event FundsDistributed(uint256 indexed schemeId, address indexed beneficiary, uint256 amount);
    event FundsDeposited(address indexed sender, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Admin: Create a new welfare scheme
    function createScheme(
        string memory _name,
        uint256 _amountPerBeneficiary,
        uint256 _maxIncome,
        uint256 _minAge,
        uint256 _maxAge,
        Gender _genderReq
    ) external onlyOwner {
        schemeCount++;
        schemes[schemeCount] = Scheme({
            id: schemeCount,
            name: _name,
            budget: 0,
            amountPerBeneficiary: _amountPerBeneficiary,
            maxIncomeThreshold: _maxIncome,
            minAge: _minAge,
            maxAge: _maxAge,
            genderRequirement: _genderReq,
            isActive: true
        });
        emit SchemeCreated(schemeCount, _name, 0);
    }

    // Admin: Deposit funds into a specific scheme
    function depositToScheme(uint256 _schemeId) external payable onlyOwner {
        require(schemes[_schemeId].isActive, "Scheme not active");
        schemes[_schemeId].budget += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    // Beneficiary: Register profile
    function registerProfile(
        string memory _name,
        uint256 _age,
        Gender _gender,
        uint256 _income
    ) external {
        beneficiaries[msg.sender] = Beneficiary({
            name: _name,
            age: _age,
            gender: _gender,
            income: _income,
            isRegistered: true,
            totalReceived: beneficiaries[msg.sender].totalReceived
        });
        emit BeneficiaryRegistered(msg.sender, _name);
    }

    // Beneficiary: Apply and auto-claim funds if eligible
    function applyForScheme(uint256 _schemeId) external nonReentrant {
        Scheme storage scheme = schemes[_schemeId];
        Beneficiary storage beneficiary = beneficiaries[msg.sender];

        require(scheme.isActive, "Scheme not active");
        require(beneficiary.isRegistered, "Not registered");
        require(!hasClaimed[_schemeId][msg.sender], "Already claimed");
        require(scheme.budget >= scheme.amountPerBeneficiary, "Insufficient scheme budget");

        // Eligibility Checks
        require(beneficiary.income <= scheme.maxIncomeThreshold, "Income exceeds threshold");
        require(beneficiary.age >= scheme.minAge && beneficiary.age <= scheme.maxAge, "Age criteria not met");
        if (scheme.genderRequirement != Gender.All) {
            require(beneficiary.gender == scheme.genderRequirement, "Gender criteria not met");
        }

        // Process Distribution
        scheme.budget -= scheme.amountPerBeneficiary;
        hasClaimed[_schemeId][msg.sender] = true;
        beneficiary.totalReceived += scheme.amountPerBeneficiary;

        (bool success, ) = payable(msg.sender).call{value: scheme.amountPerBeneficiary}("");
        require(success, "Transfer failed");

        emit FundsDistributed(_schemeId, msg.sender, scheme.amountPerBeneficiary);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}