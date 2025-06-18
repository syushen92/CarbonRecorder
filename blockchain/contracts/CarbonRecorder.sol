pragma solidity ^0.8.0;

contract CarbonRecorder {
    struct Product {
        uint id;
        string name;
        address owner;
    }
    struct Record {
        address sender;
        uint256 timestamp;
        string step; // 生產階段
        string material; // 耗材名稱
        uint256 amount; // 用量(數值)
        string unit; // 單位
        uint256 emission; // 預估碳排量
    }

    uint public productCount;
    mapping(uint => Product) public products;
    mapping(uint256 => Record[]) public records;

    // event: Record logs
    event RecordAdded(address indexed sender, uint256 index);
    event ProductAdded(uint indexed id, string name, address owner);

    function addProduct(
        string memory name
    ) public {
        productCount++;
        products[productCount] = Product(productCount, name, msg.sender);
        emit ProductAdded(productCount, name, msg.sender);
    }

    function getProduct(uint256 id) public view returns (
        uint, string memory, address
    ) {
        Product memory p = products[id];
        return (p.id, p.name, p.owner);
    }

    function addRecord(
        uint256 productId,
        string memory step,
        string memory material,
        uint256 amount,
        string memory unit,
        uint256 emission
    ) public {
        require(amount > 0, "amount must be greater than zero");
        require(bytes(material).length > 0, "description cannot be empty");

        Record memory newRecord = Record({
            sender: msg.sender,
            timestamp: block.timestamp,
            step: step,
            material: material,
            amount: amount,
            unit: unit,
            emission: emission  
        });
        records[productId].push(newRecord);
        emit RecordAdded(msg.sender, records[productId].length - 1);
    }

    function getRecordCount(uint256 productId) public view returns (uint256) {
        return records[productId].length;
    }

    function getRecord(uint productId, uint256 index) public view returns (
        address sender,
        string memory step,
        string memory material,
        uint256 emission,
        uint256 timestamp
    ) {
        Record memory r = records[productId][index];
        return (r.sender, r.step, r.material, r.emission, r.timestamp);
    }
}
