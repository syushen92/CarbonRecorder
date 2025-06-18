import React, { useEffect } from "react"; 

interface RecordItem {
  step: string;
  material: string;
  emission: number;
  timestamp: number;
}

interface HistoryListProps {
  records: RecordItem[];
}

export default function HistoryList({ records }: HistoryListProps) {
  return (
    <div style={{ color: "#666", padding: "0px" }}>
      <ul>
        {records.map((r, i) => (
          <li key={i}>
            {r.step} - {r.material} - {r.emission.toFixed(2)} kg CO₂e - {new Date(Number(r.timestamp) * 1000).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}