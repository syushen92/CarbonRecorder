pragma solidity ^0.8.0;

contract CarbonRecorder {
    struct Record {
        address sender;
        string desc;
        uint256 amount;
        uint256 timestamp;
    }

    Record[] public records;

    event RecordAdded(address indexed sender, uint256 index);

    function addRecord(string memory desc, uint256 amount) public {
        require(amount > 0, "amount must be greater than zero");
        require(bytes(desc).length > 0, "description cannot be empty");

        records.push(Record(msg.sender, desc, amount, block.timestamp));
        emit RecordAdded(msg.sender, records.length - 1);
    }

    function getRecordCount() public view returns (uint256) {
        return records.length;
    }

    function getRecord(uint256 index) public view returns (
        address sender, string memory desc, uint256 amount, uint256 timestamp
    ) {
        Record memory r = records[index];
        return (r.sender, r.desc, r.amount, r.timestamp);
    }
}
