import React from "react";

interface HistoryListProps {
  records: any[];
}

export default function HistoryList({ records }: HistoryListProps) {
  return (
    <div style={{ color: "#666", padding: "0px" }}>
      <h3>📜 歷史紀錄</h3>
      <ul>
        {records.map((r, i) => (
          <li key={i}>
            {r[1]} - {r[2]} 噸 - {new Date(Number(r[3]) * 1000).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}