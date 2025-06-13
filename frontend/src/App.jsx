import { useState, useEffect } from "react";
import { assert, ethers } from "ethers";
import CarbonRecorderABI from "/src/CarbonRecorderABI.json";
import contractInfo from "/src/contractAddress.json"

const CONTRACT_ADDRESS = contractInfo.address;
function App() {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [records, setRecords] = useState([]);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  // 載入智能合約，初始化合約與歷史紀錄
  async function loadContract() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const code = await provider.getCode(CONTRACT_ADDRESS);
      console.log("code:",code);  // 如果是"0x"表示該地址上沒有合約
      const network = await provider.getNetwork();
      console.log("Connected to network:", network);

      const signer = await provider.getSigner();
      const carbonContract = new ethers.Contract(CONTRACT_ADDRESS, CarbonRecorderABI, signer);
      setContract(carbonContract);
      loadRecords(carbonContract);
    } else {
      console.error("window.ethereum not found.");
    }
  }

  // 頁面載入時自動載入合約
  useEffect(() => {
    loadContract();
  }, []);

  // 連接user的錢包(MetaMask)，並取得帳號
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        console.log("Connected account:", accounts[0]);

        await loadContract();
      } catch (err) {
        console.error("User rejected wallet connection:", err);
      }
    } else {
      alert("請安裝MetaMask");
    }
  }

  // 從合約讀取所有紀錄
  async function loadRecords(carbonContract) {
    const countBN = await carbonContract.getRecordCount();
    const count = Number(countBN);
    const items = [];
    for (let i = 0; i < count; i++) {
      const record = await carbonContract.getRecord(i);
      items.push(record);
    }
    setRecords(items);
  }

  // 新增一筆碳紀錄到合約
  async function addRecord() {
    // 檢查contract, description, amount是否非null
    console.log("contract:", contract);
    console.log("desc:", desc);
    console.log("amount:", amount);
    if (contract && desc && amount) {
      try {
        const tx = await contract.addRecord(desc, parseInt(amount));
        await tx.wait();
        // 延遲
        await new Promise(resolve => setTimeout(resolve, 1000));
        loadRecords(contract);
        setDesc(""); 
        setAmount("");
      } catch(e) {
        console.error("Add record error:",e);
      }
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🌱 Carbon Recorder</h1>
      <div>
        <h2>🔗 錢包連線</h2>
        {account ? (
          <p>✅ 已連接帳號：{account}</p>
        ) : (
          <button onClick={connectWallet}>連接錢包</button>
        )}
      </div>
      <input 
        value={desc} 
        onChange={e => setDesc(e.target.value)}
        placeholder="Description" 
      />
      <input 
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount (tons)"
        type="number"
      />
      <button onClick={addRecord}>Submit</button>
      <h2>History</h2>
      <ul>
        {records.map((r, i) => (
          <li key={i}>{r[1]} - {r[2]} tons - {new Date(Number(r[3])*1000).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
