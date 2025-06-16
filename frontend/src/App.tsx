import React, { useEffect, useState } from "react";
import HistoryList from "./components/HistoryList";
import Modal from "./components/Modal"; 
import StageBlock from "./components/StageBlock";
import './index.css'
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import CarbonRecorderABI from "./CarbonRecorderABI.json";
import contractInfo from "./contractAddress.json";
import emissionFactors from "./assets/emissionFactors_with_defaults.json";

import { Autocomplete, TextField } from "@mui/material";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = contractInfo.address;

export default function ProductLifecyclePage() {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [modalStep, setModalStep] = useState<string | null>(null);
  const [modalStage, setModalStage] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [inputAmount, setInputAmount] = useState<number>(0);

  const emission = selectedMaterial ? selectedMaterial.coefficient * inputAmount : 0;

  // 載入智能合約，初始化合約與歷史紀錄
  async function loadContract() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const code = await provider.getCode(CONTRACT_ADDRESS);
      console.log("code:",code);  // 如果是"0x"表示該地址上沒有合約
      const network = await provider.getNetwork();
      console.log("Connected to network:", network.chainId);

      const signer = await provider.getSigner();
      const carbonContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CarbonRecorderABI,
        signer
      );
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
        console.log("Connect account:", accounts[0]);

        // await loadContract();
      } catch (err) {
        console.error("User rejected wallet connection:", err);
      }
    } else {
      alert("請安裝MetaMask");
    }
  }

  // 從合約讀取所有紀錄
  async function loadRecords(carbonContract: any) {
    const countBN = await carbonContract.getRecordCount();
    const count = Number(countBN);
    const items: any[] = []; // 需設定為any，因typescript會推斷items是never[]，因為沒有指定型別且初始為空陣列。
    for (let i = 0; i < count; i++) {
      const record = await carbonContract.getRecord(i);
      items.push(record);
    }
    setRecords(items);
  }

  async function submitRecord() {
    // 檢查contract, description, emission是否非null
    const finalEmission = Math.round(emission);
    if (!contract) {
      alert("合約尚未載入")
      return;
    }
    if (!modalStep || modalStep.trim() === "") {
      alert("請選擇一個階段");
      return;
    }
    if (!selectedMaterial || isNaN(inputAmount) || inputAmount <= 0) {
      alert("請選擇耗材並輸入用量");
      return;
    }
    try {
      const tx = await contract.addRecord(modalStep, finalEmission);
      await tx.wait();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      loadRecords(contract);
      setModalStep(null);
      setInputAmount(0);
      setSelectedMaterial(null);
    } catch (e) {
      console.error("Add record error:", e);
    }
  }

  const handleStepClick = (stageName: string, stepName: string) => {
    setModalStage(stageName);
    setModalStep(stepName);
  };

  const stages = [
    { name: "原料取得", steps: ["種子/種苗", "農藥", "肥料", "其他生產資材", "整地", "定植", "栽培管理", "採收"], extras: ["包裝資材", "廢棄物", "能源資源", "運輸"] },
    { name: "製造", steps: ["冷藏暫存", "一次加工", "半成品暫存", "二次加工", "包裝", "出貨"], extras: ["運輸", "廢棄物", "能源資源"] },
    { name: "配送銷售", steps: ["銷售點"], extras: ["運輸"] },
    { name: "使用", steps: ["消費者使用"], extras: ["能源資源"] },
    { name: "廢棄處理", steps: ["回收", "焚化", "掩埋"], extras: ["能源資源"] },
  ];

  const matchedOptions = emissionFactors.filter(f => f.category === modalStep);

  return (
    <div className="PageWrapper">
      <header className="Header" />
      <div className="CenteredContent">
        {account ? (
          <p style={{ color: "#666", fontSize: "12px" }}>✅ 已連接帳號：{account}</p>
        ) : (
          <button className="Button" onClick={connectWallet}>連接錢包</button>
        )}
      </div>
      {stages.map(stage =>(
        <StageBlock
          key={stage.name}
          stage={stage}
          open={!!openSections[stage.name]}
          onToggle={() =>
          setOpenSections(prev => ({ ...prev, [stage.name]: !prev[stage.name] }))
          }
          onStepClick={(stepName) => handleStepClick(stage.name,stepName)}
        />
      ))}
      
      <div className="CenteredContent">
        <HistoryList records={records}/>
      </div>
      <Modal visible={!!modalStep} onClose={() => setModalStep(null)}>
        <h3>新增碳排放紀錄</h3>
        <h5 style={{ marginBottom: "2px", marginTop: 0}}>階段：{modalStage}</h5>
        <h5 style={{ marginTop: 0 }}>類別：{modalStep}</h5>

        <Autocomplete
          options={matchedOptions}
          getOptionLabel={(option) => option.name}
          onChange={(e, val) => setSelectedMaterial(val)}
          renderInput={(params) => <TextField {...params} label="選擇耗材" />}
        />

        <input className="InputAmount"
          type="number"
          value={inputAmount}
          onChange={e => setInputAmount(Number(e.target.value))}
          placeholder="輸入用量"
        />

        <p style={{ fontSize: '14px', color: '#444' }}>
          預估碳排量：{emission.toFixed(2)} kg CO₂e
        </p>

        <div className="ButtonRow">
          <button className="SubmitButton" onClick={submitRecord}>確認提交</button>
          <button className="CancelButton" onClick={() => setModalStep(null)}>取消</button>
        </div>
      </Modal>
    </div>
  );
}