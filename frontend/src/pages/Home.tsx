import React, { useState } from "react";
import * as XLSX from "xlsx";
import { ethers } from "ethers";                  // ← 只有做型別轉換用
import StageBlock from "../components/StageBlock";
import HistoryList from "../components/HistoryList";
import TabSelector from "../components/TabSelector";
import "./index.css";

interface HomeProps {
  productName: string;
  records: any[];                                  // 前端暫存的紀錄（畫面會顯示）
  productId: string;
  contract: ethers.Contract | null;               // ⭐ 已在 App 頂層用 useAuth 取得
  onStepClick: (stageName: string, stepName: string) => void;
  stages: any[];
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  saveAndReturn: () => void;
}

export default function Home({
  productId,
  records,
  contract,
  onStepClick,
  stages,
  openSections,
  setOpenSections,
  saveAndReturn,
}: HomeProps) {
  const [activeTab, setActiveTab] = useState<"lifecycle" | "history">("lifecycle");
  const [loading, setLoading]   = useState(false);

  /* ===== 下載報表（先鏈上抓，補齊缺的欄位再輸出） ===== */
  const downloadReport = async () => {
    if (!contract) {
      alert("⚠️ 目前尚未連到智慧合約，請先連結錢包或稍後再試");
      return;
    }

    setLoading(true);
    try {
      /* 1) 撈鏈上資料 -------------------------------------------------- */
      // 這裡假設 getRecords(productId) 直接回傳 Record[]
      // Record: [stage, step, material, amount, unit, emission, timestamp]
      const chainRaw: any[] = await contract.getRecords(productId);

      // BigNumber ➜ number / string
      const chainRecords = chainRaw.map(r => ({
        stage:      r.stage,
        step:       r.step,
        material:   r.material,
        amount:     Number(ethers.BigNumber.from(r.amount)),   // 若合約用 18 decimals 再 /1e18
        unit:       r.unit,
        emission:   Number(ethers.BigNumber.from(r.emission)), // 同上
        timestamp:  Number(r.timestamp) * 1000,                // 假設秒 → ms
      }));

      /* 2) 合併「前端暫存」＋「鏈上」避免遺漏 ---------------------------- */
      // 這裡用 timestamp 判斷唯一，你也可以用 hash / index
      const merged: any[] = [
        ...records,
        ...chainRecords.filter(
          c => !records.some(l => l.timestamp === c.timestamp && l.material === c.material)
        )
      ];

      if (merged.length === 0) {
        alert("此產品尚無紀錄");
        return;
      }

      /* 3) 轉成符合「工作表二」的 AOA ---------------------------------- */
      const header = [
        "生命週期階段", "群組", "名稱", "總活動量", "單位",
        "每單位數量", "單位", "名稱",
        "數值(kgCO2e/單位)", "單位", "數據來源"
      ];

      const sheetData = [
        header,
        ...merged.map(r => [
          r.stage ?? "",
          r.step ?? "",
          r.material ?? "",
          r.amount ?? "",
          r.unit ?? "",
          "", "", "",                           // 每單位區先空著
          r.emission ?? "",
          "kg CO2e",
          new Date(r.timestamp).toLocaleString() // 這裡直接用時間當來源
        ])
      ];

      /* 4) 建立活頁簿＋下載 --------------------------------------------- */
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "2.平台匯入表");

      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const url = URL.createObjectURL(new Blob([out]));
      const a   = document.createElement("a");
      a.href = url;
      a.download = `盤查表_product${productId}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("downloadReport error =>", e);
      alert("匯出失敗，請檢查合約方法名稱或 console log");
    } finally {
      setLoading(false);
    }
  };

  /* ===== 畫面 ===== */
  return (
    <div>
      <TabSelector activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "lifecycle" ? (
        <>
          {stages.map(stage => (
            <StageBlock
              key={stage.name}
              stage={stage}
              open={!!openSections[stage.name]}
              onToggle={() =>
                setOpenSections(prev => ({
                  ...prev,
                  [stage.name]: !prev[stage.name],
                }))
              }
              onStepClick={step => onStepClick(stage.name, step)}
            />
          ))}
        </>
      ) : (
        <div className="CenteredContent">
          <HistoryList records={records} />

          <div className="ButtonRow">
            <button className="SaveButton" onClick={saveAndReturn}>
              儲存並回到商品列表
            </button>

            <button className="Button" onClick={downloadReport} disabled={loading}>
              {loading ? "匯出中…" : "⬇︎ 下載報表"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
