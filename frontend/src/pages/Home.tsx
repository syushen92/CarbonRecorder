// src/pages/Home.tsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { ethers } from "ethers";
import StageBlock from "../components/StageBlock";
import HistoryList from "../components/HistoryList";
import TabSelector from "../components/TabSelector";
import "./index.css";

/* ────────── 型別 ────────── */
interface HomeProps {
  productName: string;
  records: any[];               // 前端暫存
  productId: string;
  contract: ethers.Contract | null;
  onStepClick: (stage: string, step: string) => void;
  stages: any[];
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  saveAndReturn: () => void;
}

/* ────────── utils ────────── */
const toNum = (v: any) =>
  v == null
    ? ""
    : typeof v === "bigint"
    ? Number(v)
    : typeof v === "object" && typeof v.toString === "function"
    ? Number(v.toString())
    : Number(v);

const toMs = (x: number) => (x < 10_000_000_000 ? x * 1000 : x);

const splitStep = (s: string): [string, string] => {
  if (!s) return ["", ""];
  const viaDash = s.split(" - ");
  if (viaDash.length > 1) return [viaDash[0], viaDash.slice(1).join(" - ")];
  const viaColon = s.split("：");
  if (viaColon.length > 1) return [viaColon[0], viaColon.slice(1).join("：")];
  return ["", s];
};

/* ────────── Component ────────── */
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
  const [loading, setLoading] = useState(false);

  /* ───── 撈鏈上資料（舊 API：getRecordCount / getRecord） ───── */
  const fetchChain = async () => {
    if (!contract) throw new Error("contract not ready");
    const pid = Number(productId);
    if (
      typeof (contract as any).getRecordCount !== "function" ||
      typeof (contract as any).getRecord !== "function"
    ) {
      throw new Error("合約缺少 getRecordCount / getRecord");
    }

    const total = toNum(await (contract as any).getRecordCount(pid));
    const out: any[] = [];
    for (let i = 0; i < total; i++) {
      // getRecord 回傳 (address, step, material, emission, timestamp)
      const [, stepStr, material, emissionBN, ts] = await (contract as any).getRecord(pid, i);
      const [stage, group] = splitStep(stepStr);
      out.push({
        stage,
        group,
        material,
        amount: "",          // 鏈上無 amount/unit → 之後靠前端暫存補
        unit: "",
        perAmount: "",
        perUnit: "",
        perName: "",
        emission: toNum(emissionBN) / 1000,
        timestamp: toMs(toNum(ts)),
      });
    }
    return out;
  };

  /* ───── 合併鏈上 & 前端暫存：用 stage|group|material 當 key 互補欄位 ───── */
  const mergeRows = (chainRows: any[]) => {
    const map = new Map<string, any>();
    const key = (r: any) => `${r.stage}|${r.group}|${r.material}`;

    // 1) 先塞鏈上
    chainRows.forEach((r) => map.set(key(r), { ...r }));

    // 2) 用暫存補 amount / unit
    records.forEach((l) => {
      const [stage, group] = splitStep(l.step || "");
      const k = `${stage}|${group}|${l.material}`;
      const row = map.get(k) ?? {
        stage,
        group,
        material: l.material,
        amount: "",
        unit: "",
        perAmount: "",
        perUnit: "",
        perName: "",
        emission: "",
        timestamp: toMs(l.timestamp || Date.now()),
      };
      if (row.amount === "" && l.amount != null) row.amount = l.amount;
      if (row.unit === "" && l.unit) row.unit = l.unit;
      if (row.emission === "" && l.emission != null) row.emission = l.emission;
      map.set(k, row);
    });

    return [...map.values()].sort((a, b) => a.timestamp - b.timestamp);
  };

  /* ───── 下載報表 ───── */
  const downloadReport = async () => {
    if (!contract) return alert("⚠️ 尚未連錢包");
    setLoading(true);
    try {
      const chainRows = await fetchChain();
      const rows = mergeRows(chainRows);
      if (!rows.length) return alert("此產品尚無紀錄");

      const header = [
        "生命週期階段", "群組", "名稱",
        "總活動量", "單位",
        "每單位數量", "單位", "名稱",
        "數值(kgCO2e/單位)", "單位",
        "數據來源",
      ];

      const aoa = [
        header,
        ...rows.map((r) => [
          r.stage, r.group, r.material,
          r.amount, r.unit,
          r.perAmount, r.perUnit, r.perName,
          r.emission, "kg CO2e",
          new Date(r.timestamp).toLocaleString(),
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "2.平台匯入表");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const url = URL.createObjectURL(new Blob([buf]));
      const a   = document.createElement("a");
      a.href = url;
      a.download = `盤查表_product${productId}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("downloadReport error →", e);
      alert(`匯出失敗：${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  /* ───── UI ───── */
  return (
    <div>
      <TabSelector activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "lifecycle" ? (
        <>
          {stages.map((stage) => (
            <StageBlock
              key={stage.name}
              stage={stage}
              open={!!openSections[stage.name]}
              onToggle={() =>
                setOpenSections((p) => ({ ...p, [stage.name]: !p[stage.name] }))
              }
              onStepClick={(step) => onStepClick(stage.name, step)}
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

             <button className="SaveButton" onClick={downloadReport} disabled={loading}>
              {loading ? "匯出中…" : "⬇ 下載報表"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
