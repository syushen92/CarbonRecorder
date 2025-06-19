// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract CarbonRecorder {

    /* ─────────── 角色管理 ─────────── */
    enum Role { None, Consumer, Farmer }

    mapping(address => Role) public roles;
    event UserRegistered(address indexed user, Role role);

    modifier onlyFarmer() {
        require(roles[msg.sender] == Role.Farmer, "Only Farmer permitted");
        _;
    }

    /* ─────────── 產品 / 碳紀錄 ─────────── */
    struct Product {
        uint id;
        string name;
        address owner;
    }

    struct Record {
        address sender;
        uint256 timestamp;
        string step;
        string material;
        uint256 amount;
        string unit;
        uint256 emission;
    }

    uint public productCount;
    mapping(uint => Product) public products;
    mapping(uint => Record[]) public records;

    event ProductAdded(uint indexed id, string name, address owner);
    event RecordAdded(address indexed sender, uint indexed productId, uint recordIndex);

    /* ─────────── 註冊 ─────────── */
    function registerUser(Role role) external {
        require(role == Role.Consumer || role == Role.Farmer, "Invalid role");
        require(roles[msg.sender] == Role.None, "Already registered");
        roles[msg.sender] = role;
        emit UserRegistered(msg.sender, role);
    }

    function getUserRole(address user) external view returns (Role) {
        return roles[user];
    }

    /* ─────────── 產品 ─────────── */
    function addProduct(string calldata name) external onlyFarmer {
        require(bytes(name).length > 0, "Name required");
        productCount++;
        products[productCount] = Product(productCount, name, msg.sender);
        emit ProductAdded(productCount, name, msg.sender);
    }

    function getProduct(uint id) external view returns (uint, string memory, address) {
        Product memory p = products[id];
        return (p.id, p.name, p.owner);
    }

    /* ─────────── 碳排紀錄 ─────────── */
    function addRecord(
        uint productId,
        string calldata step,
        string calldata material,
        uint amount,
        string calldata unit,
        uint emission
    ) external onlyFarmer {
        require(amount > 0, "amount > 0");
        require(bytes(material).length > 0, "material empty");

        records[productId].push(
            Record({
                sender: msg.sender,
                timestamp: block.timestamp,
                step: step,
                material: material,
                amount: amount,
                unit: unit,
                emission: emission
            })
        );
        emit RecordAdded(msg.sender, productId, records[productId].length - 1);
    }

    function getRecordCount(uint productId) external view returns (uint) {
        return records[productId].length;
    }

    function getRecord(uint productId, uint index) external view returns (
        address, string memory, string memory, uint, uint
    ) {
        Record memory r = records[productId][index];
        return (r.sender, r.step, r.material, r.emission, r.timestamp);
    }
}
