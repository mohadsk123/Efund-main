// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FundDistribution {
    address public owner;

    // --- Scheme & Application Models ---
    struct Scheme {
        uint256 id;
        string name;
        uint256 budget;
        uint256 amountPerBeneficiary;
        uint256 maxIncomeThreshold;
        uint256 minAge;
        uint256 maxAge;
        uint8 genderRequirement;
        uint256 deadline;
        bool isActive;
    }
    struct Application {
        address applicant;
        uint256 schemeId;
        string ipfsHash;
        uint256 timestamp;
    }

    struct Beneficiary {
        string name;
        uint256 age;
        uint8 gender;
        uint256 income;
        bool isRegistered;
        uint256 totalReceived;
    }

    mapping(address => Beneficiary) public beneficiaries;
    mapping(address => bool) public approved;
    address[] public beneficiaryAddresses;

    // Schemes storage
    mapping(uint256 => Scheme) public schemes;
    uint256 public schemeCount;
    // Applications per scheme
    mapping(uint256 => Application[]) public applicationsByScheme;

    event BeneficiaryAdded(address indexed beneficiaryAddress, string name, string scheme);
    event BeneficiaryApproved(address indexed beneficiaryAddress);
    event FundsDisbursed(address indexed beneficiaryAddress, uint256 amount, string scheme);
    event FundsDeposited(address indexed depositor, uint256 amount);
    event SchemeAdded(uint256 indexed id, string name, uint256 budget, uint256 deadline);
    event SchemeCreated(uint256 indexed id, string name, uint256 budget);
    event ApplicationForScheme(uint256 indexed schemeId, address indexed applicant);
    event ApplicationCreated(uint256 indexed schemeId, address indexed applicant, string ipfsHash);

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

    // Add a new scheme (admin only)
    function addScheme(string memory _name, uint256 _budget, uint256 _deadline) public onlyOwner {
        require(bytes(_name).length > 0, "Name required");
        require(_budget > 0, "Budget must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        uint256 newId = schemeCount + 1;
        schemes[newId] = Scheme({
            id: newId,
            name: _name,
            budget: _budget,
            amountPerBeneficiary: 0,
            maxIncomeThreshold: 0,
            minAge: 0,
            maxAge: 0,
            genderRequirement: 0,
            deadline: _deadline,
            isActive: true
        });
        schemeCount = newId;
        emit SchemeAdded(newId, _name, _budget, _deadline);
    }

    function createScheme(string memory _name, uint256 _budget, uint256 _amountPerBeneficiary, uint256 _maxIncomeThreshold, uint256 _minAge, uint256 _maxAge, uint8 _genderRequirement) public onlyOwner {
        require(bytes(_name).length > 0, "Name required");
        require(_budget > 0, "Budget must be > 0");
        require(_amountPerBeneficiary > 0, "Amount must be > 0");
        require(_maxAge >= _minAge, "Age range invalid");
        uint256 newId = schemeCount + 1;
        schemes[newId] = Scheme({
            id: newId,
            name: _name,
            budget: _budget,
            amountPerBeneficiary: _amountPerBeneficiary,
            maxIncomeThreshold: _maxIncomeThreshold,
            minAge: _minAge,
            maxAge: _maxAge,
            genderRequirement: _genderRequirement,
            deadline: type(uint256).max,
            isActive: true
        });
        schemeCount = newId;
        emit SchemeCreated(newId, _name, _budget);
    }

    // Beneficiary applies to a scheme with IPFS hash
    function applyToScheme(uint256 _schemeId, string memory _ipfsHash) public {
        Scheme storage s = schemes[_schemeId];
        require(s.id == _schemeId && s.isActive, "Scheme not found or inactive");
        require(block.timestamp <= s.deadline, "Application closed");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        applicationsByScheme[_schemeId].push(Application({
            applicant: msg.sender,
            schemeId: _schemeId,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp
        }));
        emit ApplicationCreated(_schemeId, msg.sender, _ipfsHash);
    }

    function registerProfile(string memory _name, uint256 _age, uint8 _gender, uint256 _income) public {
        require(bytes(_name).length > 0, "Name required");
        require(_age > 0, "Age required");
        Beneficiary storage b = beneficiaries[msg.sender];
        b.name = _name;
        b.age = _age;
        b.gender = _gender;
        b.income = _income;
        b.isRegistered = true;
    }

    function applyForScheme(uint256 _schemeId) public {
        Scheme storage s = schemes[_schemeId];
        require(s.id == _schemeId && s.isActive, "Scheme not found or inactive");
        Beneficiary storage b = beneficiaries[msg.sender];
        require(b.isRegistered, "Profile not registered");
        if (s.amountPerBeneficiary > 0) {
            require(s.budget >= s.amountPerBeneficiary, "Insufficient scheme budget");
        }
        if (s.maxIncomeThreshold > 0) {
            require(b.income <= s.maxIncomeThreshold, "Income exceeds threshold");
        }
        if (s.minAge > 0 || s.maxAge > 0) {
            require(b.age >= s.minAge && b.age <= s.maxAge, "Age not eligible");
        }
        if (s.genderRequirement != 0) {
            require(b.gender == s.genderRequirement, "Gender not eligible");
        }
        emit ApplicationForScheme(_schemeId, msg.sender);
    }

    function depositToScheme(uint256 _schemeId) public payable onlyOwner {
        require(msg.value > 0, "Must send ETH.");
        Scheme storage s = schemes[_schemeId];
        require(s.id == _schemeId, "Scheme not found");
        s.budget += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    function addBeneficiary(address _beneficiaryAddress, string memory _name, string memory _scheme) public onlyOwner {
        require(_beneficiaryAddress != address(0), "Invalid address.");
        require(beneficiaries[_beneficiaryAddress].totalReceived == 0, "Beneficiary already exists.");
        beneficiaries[_beneficiaryAddress] = Beneficiary(_name, 0, 0, 0, false, 0);
        beneficiaryAddresses.push(_beneficiaryAddress);
        emit BeneficiaryAdded(_beneficiaryAddress, _name, _scheme);
    }

    function approveBeneficiary(address _beneficiaryAddress) public onlyOwner {
        require(!approved[_beneficiaryAddress], "Beneficiary already approved.");
        approved[_beneficiaryAddress] = true;
        emit BeneficiaryApproved(_beneficiaryAddress);
    }

    function disburseFunds(address _beneficiaryAddress, uint256 amount) public onlyOwner {
        require(approved[_beneficiaryAddress], "Beneficiary not approved.");
        require(address(this).balance >= amount, "Insufficient contract balance.");

        (bool success, ) = _beneficiaryAddress.call{value: amount}("");
        require(success, "ETH transfer failed.");

        beneficiaries[_beneficiaryAddress].totalReceived += amount;
        emit FundsDisbursed(_beneficiaryAddress, amount, "");
    }

    // --- Read Functions ---

    function getBeneficiaryDetails(address _beneficiaryAddress) public view returns (string memory name, string memory scheme, bool isApproved, uint256 totalReceived) {
        Beneficiary storage b = beneficiaries[_beneficiaryAddress];
        bool approvedFlag = approved[_beneficiaryAddress];
        return (b.name, "", approvedFlag, b.totalReceived);
    }

    function getScheme(uint256 _schemeId) public view returns (uint256 id, string memory name, uint256 budget, uint256 deadline, bool isActive) {
        Scheme storage s = schemes[_schemeId];
        require(s.id == _schemeId, "Scheme not found");
        return (s.id, s.name, s.budget, s.deadline, s.isActive);
    }

    function getApplicationsCount(uint256 _schemeId) public view returns (uint256) {
        return applicationsByScheme[_schemeId].length;
    }

    function getApplication(uint256 _schemeId, uint256 _index) public view returns (address applicant, string memory ipfsHash, uint256 timestamp) {
        require(_index < applicationsByScheme[_schemeId].length, "Invalid index");
        Application storage a = applicationsByScheme[_schemeId][_index];
        return (a.applicant, a.ipfsHash, a.timestamp);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTotalBeneficiaries() public view returns (uint256) {
        return beneficiaryAddresses.length;
    }
}
