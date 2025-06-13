const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();

    const CarbonRecorder = await ethers.getContractFactory("CarbonRecorder");
    const contract = await CarbonRecorder.deploy();

    await contract.waitForDeployment();
    //await contract.deployed(); *Ethers v6 中已不再使用*
    const address = await contract.getAddress();
    console.log("Contract deployed to:", address);

    // 設定檔案路徑前綴
    const frontendDir = path.join(__dirname, "..","..", "frontend", "src");

    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }

    // 自動填入contract address
    fs.writeFileSync(
        path.join(frontendDir, "contractAddress.json"),
        JSON.stringify({ address }, null, 2)
    );

    // 自動填入abi
    const artifact = await hre.artifacts.readArtifact("CarbonRecorder");
    fs.writeFileSync(
        path.join(frontendDir, "CarbonRecorderABI.json"),
        JSON.stringify(artifact.abi, null, 2)
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
