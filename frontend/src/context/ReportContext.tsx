import React, { createContext, useContext, useState } from "react";
import * as XLSX from "xlsx";

/* ───────── 型別定義 ───────── */
export interface Row {
  productId: number;
  productName: string;
  stage: string;
  step: string;
  material: string;
  amount: number;
  unit: string;
  emission: number;   // kg-CO₂e
  timestamp: number;  // Unix
}

interface Ctx {
  rows: Row[];
  pushRow: (r: Row) => void;
  exportByProduct: (pid: number) => void;
}

/* ───────── Context ───────── */
const ReportContext = createContext<Ctx | null>(null);
export const useReport = () => {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport 必須在 <ReportProvider> 中使用");
  return ctx;
};

/* ───────── Provider ───────── */
export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rows, setRows] = useState<Row[]>([]);

  /* 新增一列 */
  const pushRow = (r: Row) => setRows(prev => [...prev, r]);

  /* 匯出符合「2.平台匯入表」格式的 .xlsx */
  const exportByProduct = (pid: number) => {
    const data = rows.filter(r => r.productId === pid);
    if (data.length === 0) { alert("此產品尚無紀錄"); return; }

    // 1) 表頭（中文欄位名稱，固定順序）
    const header = [
      "生命週期階段", "群組", "名稱", "總活動量", "單位",
      "每單位數量", "單位", "名稱",
      "數值(kgCO2e/單位)", "單位", "數據來源"
    ];

    // 2) 轉成 AOA (Array-of-Array)；暫時留空欄位用 "" 佔位
    const sheetData = [
      header,
      ...data.map(r => [
        r.stage,          // 生命週期階段
        r.step,           // 群組
        r.material,       // 名稱
        r.amount,         // 總活動量
        r.unit,           // 單位
        "", "", "",       // 每單位／單位／名稱（日後再填）
        "", "",           // 數值／單位／來源
      ])
    ];

    // 3) 產生工作表與活頁簿
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "2.平台匯入表");

    // 4) 下載
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const url = URL.createObjectURL(new Blob([out]));
    const a   = document.createElement("a");
    a.href = url;
    a.download = `盤查表_product${pid}_${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ReportContext.Provider value={{ rows, pushRow, exportByProduct }}>
      {children}
    </ReportContext.Provider>
  );
};
