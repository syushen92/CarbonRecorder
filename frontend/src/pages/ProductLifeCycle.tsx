import React, { useEffect, useState } from "react";
import Home from "./Home";
import Header from "../components/Header";
import Modal from "../components/Modal";
import "./index.css";
import { useNavigate, useParams } from "react-router-dom";
import { ethers } from "ethers";
import CarbonRecorderABI from "../CarbonRecorderABI.json";
import contractInfo from "../contractAddress.json";
import emissionFactors from "../assets/emissionFactors_with_defaults.json";
import { useAuth } from "../context/AuthContext";
import { Autocomplete, TextField } from "@mui/material";
import { useReport } from "../context/ReportContext";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = contractInfo.address;

/* ─── 木質漸層色票 ─── */
const WOOD = {
  primary: "linear-gradient(135deg,#D8C4AA 0%,#B49779 100%)",
  success: "linear-gradient(135deg,#B5D8AC 0%,#8CAC6A 100%)",
  info:    "linear-gradient(135deg,#E2D3C1 0%,#C6AF93 100%)",
  danger:  "linear-gradient(135deg,#E4B0A1 0%,#C28767 100%)",
};

export default function ProductLifecyclePage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [modalStep, setModalStep] = useState<string | null>(null);
  const [modalStage, setModalStage] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState("");
  const { role } = useAuth();
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [productName, setProductName] = useState<string>("");
  const { pushRow } = useReport();

  /* 連鏈 */
  async function loadContract() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const carbonContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CarbonRecorderABI,
        signer
      );
      setContract(carbonContract);

      if (productId) {
        const p = await carbonContract.getProduct(Number(productId));
        setProductName(p[1]);
      }
      loadRecords(carbonContract);
    }
  }
  useEffect(() => { loadContract(); }, [productId]);

  async function connectWallet() {
    if (!window.ethereum) return alert("請安裝 MetaMask");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    loadContract();
  }

  async function loadRecords(c: any) {
    if (!productId) return;
    const count = Number(await c.getRecordCount(Number(productId)));
    const arr: any[] = [];
    for (let i = 0; i < count; i++) {
      const r = await c.getRecord(Number(productId), i);
      arr.push({
        sender: r[0],
        step: r[1],
        material: r[2],
        emission: Number(r[3]) / 1000,
        timestamp: Number(r[4]),
      });
    }
    setRecords(arr);
  }

  /* 計算排放 */
  const raw = selectedMaterial?.coefficient ?? selectedMaterial?.coe ?? "";
  const emission =
    selectedMaterial && !isNaN(+raw) && !isNaN(inputAmount)
      ? +raw * inputAmount
      : 0;

  /* 提交紀錄 */
  async function submitRecord() {
    if (role !== "Farmer") return alert("只有茶行可寫入紀錄");
    if (!contract || !account) return alert("合約或錢包未就緒");
    if (!modalStep || !selectedMaterial || inputAmount <= 0) return alert("資料不完整");
    const tx = await contract.addRecord(
      Number(productId),
      modalStep,
      selectedMaterial.name,
      inputAmount,
      selectedMaterial.unit,
      Math.round(emission) * 1000
    );
    await tx.wait();

    pushRow({
      productId: Number(productId),
      productName,
      stage: modalStage!,
      step: modalStep!,
      material: selectedMaterial.name,
      amount: inputAmount,
      unit: selectedMaterial.unit,
      emission: +emission.toFixed(3),
      timestamp: Math.floor(Date.now() / 1000),
    });

    loadRecords(contract);
    setModalStep(null);
    setSelectedMaterial(null);
    setInputAmount(0);
  }

  /* 靜態資料 */
  const stages = [
    { name: "原料取得", steps: ["種子/種苗","農藥","肥料","其他生產資材","整地","定植","栽培管理","採收"], extras: ["包裝資材","廢棄物","能源資源","運輸"] },
    { name: "製造", steps: ["冷藏暫存","一次加工","半成品暫存","二次加工","包裝","出貨"], extras: ["運輸","廢棄物","能源資源"] },
    { name: "配送銷售", steps: ["銷售點"], extras: ["運輸"] },
    { name: "使用", steps: ["消費者使用"], extras: ["能源資源"] },
    { name: "廢棄處理", steps: ["回收","焚化","掩埋"], extras: ["能源資源"] },
  ];
  const matchedOptions = emissionFactors.filter((f) =>
    f.applicableSteps?.includes(modalStep || "")
  );

  /* UI */
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(145deg,#F3F0EB 0%, #E6DED2 40%, #DDD0BF 100%)",
        display: "flex",
        flexDirection: "column",
        animation: "fade-bg .6s ease",
      }}
    >
      <Header title={productName || "loading..."} />

      {/* 錢包狀態列：Header 下固定 */}
      <div
        style={{
          position: "fixed",
          top: 104,             /* Header 44 + Tab 48 + 12px 緩衝 */
         left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
         zIndex: 1000,
        }}
      >
     {account ? (

       <span
         style={{
           background: "linear-gradient(135deg,#E2D3C1 0%,#C6AF93 100%)",
           padding: "4px 12px",
           borderRadius: 16,
           fontSize: 12,
           color: "#4C3A28",
           boxShadow: "0 2px 6px rgba(0,0,0,.12)",
         }}
       >
         ✅ 已連接：{account}
       </span>
     ) : (
       <button
         className="Button"
         onClick={connectWallet}
         style={{
           background: WOOD.info,
           borderRadius: 16,
           padding: "6px 14px",
           boxShadow: "0 2px 6px rgba(0,0,0,.12)",
         }}
       >
         連接錢包
       </button>
     )}
   </div>

      {/* 主要內容 */}
      <Home
        productName={productName}
        productId={productId!}
        records={records}
        contract={contract}
        onStepClick={(stage, step) => { setModalStage(stage); setModalStep(step); }}
        stages={stages}
        openSections={openSections}
        setOpenSections={setOpenSections}
        saveAndReturn={() => { alert("儲存成功!"); navigate("/"); }}
      />

      {/* 新增紀錄 Modal */}
      <Modal visible={!!modalStep} onClose={() => setModalStep(null)}>
        <h3 style={{ color: "#4C3A28", marginTop: 0 }}>新增碳排放紀錄</h3>
        <h5 style={{ margin: "2px 0", color: "#8A6748" }}>階段：{modalStage}</h5>
        <h5 style={{ margin: 0, color: "#8A6748" }}>類別：{modalStep}</h5>

        <Autocomplete
          options={matchedOptions}
          getOptionLabel={(o) => o.name}
          onChange={(_, v) => setSelectedMaterial(v)}
          renderInput={(p) => (
            <TextField
              {...p}
              label="選擇係數"
              variant="outlined"
              sx={{
                "& .MuiInputBase-root": { color: "#4C3A28" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#B49779" },
                "& .MuiInputLabel-root": { color: "#8A8A8A" },
              }}
            />
          )}
        />

        <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:12 }}>
          <input
            className="InputAmount"
            type="number"
            min="0"
            value={inputAmount}
            onChange={(e) => setInputAmount(+e.target.value)}
            placeholder="輸入用量"
            style={{
              flex: 1,
              background: "#F4F1ED",
              border: "1px solid #D8C4AA",
              borderRadius: 6,
              padding: "10px 12px",
              color: "#4C3A28",
            }}
          />
          <span style={{ fontSize: 14, color: "#5B4A37" }}>
            {selectedMaterial?.unit ?? ""}
          </span>
        </div>

        <p style={{ fontSize: 14, color: "#5B4A37" }}>
          預估碳排量：{emission.toFixed(2)} kg CO₂e
        </p>

        {role === "Farmer" && (
          <div style={{ display:"flex",gap:10,marginTop:14,justifyContent:"center" }}>
            <button className="SubmitButton" onClick={submitRecord} style={{ background: WOOD.success, color: "#fff" }}>確認提交</button>
            <button className="CancelButton" onClick={() => setModalStep(null)} style={{ background: WOOD.danger, color: "#fff" }}>取消</button>
          </div>
        )}
      </Modal>

      <style>{`
        @keyframes fade-bg{from{opacity:0} to{opacity:1}}
      `}</style>
    </div>
  );
}
