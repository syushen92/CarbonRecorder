import React from "react";
import styled from "styled-components";

/* ─── 木質色票 ─── */
const C = {
  cardTop: "#EFE8DF",
  cardBot: "#E2D3C1",
  border : "#D8C4AA",
  text   : "#4C3A28",
  sub    : "#7C6B55",
  accent : "#8A6748",
};

/* ─── 樣式 ─── */
const Wrap = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fade-in .45s ease;
`;

const Item = styled.div`
  background: linear-gradient(180deg, ${C.cardTop} 0%, ${C.cardBot} 100%);
  border: 1px solid ${C.border};
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 4px 10px rgba(0,0,0,.12);

  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 14px;
  font-size: 14px;
  line-height: 1.45;
  color: ${C.text};
`;

const Title = styled.div`
  font-weight: 700;
  color: ${C.accent};
`;

const Sub = styled.div`
  color: ${C.sub};
  font-size: 13px;
`;

/* ─── 型別 ─── */
interface RecordItem {
  step: string;
  material: string;
  emission: number;
  timestamp: number;
}
interface Props {
  records: RecordItem[];
}

/* ─── Component ─── */
export default function HistoryList({ records }: Props) {
  if (records.length === 0) {
    return (
      <p style={{ color: C.sub, textAlign: "center", fontSize: 14 }}>
        尚無歷史紀錄
      </p>
    );
  }

  return (
    <Wrap>
      {records.map((r, i) => (
        <Item key={i}>
          {/* 左側：步驟 & 材料 */}
          <div>
            <Title>{r.step}</Title>
            <Sub>{r.material}</Sub>
          </div>

          {/* 右側：排放 & 時間 */}
          <div style={{ textAlign: "right" }}>
            <div>
              {r.emission.toFixed(2)}{" "}
              <span style={{ fontSize: 12, color: C.sub }}>kg CO₂e</span>
            </div>
            <Sub>
              {new Date(r.timestamp * 1000).toLocaleString()}
            </Sub>
          </div>
        </Item>
      ))}

      {/* 關鍵影格 */}
      <style>{`
        @keyframes fade-in{
          from{opacity:0; transform:translateY(12px)}
          to{opacity:1;   transform:translateY(0)}
        }
      `}</style>
    </Wrap>
  );
}
