import React from "react";
import styled from "styled-components";

/* 色票 */
const C = {
  accent : "#8A6748",
  text   : "#4C3A28",
  sub    : "#7C6B55",
};

/* 透明容器（取消背景 / 邊框 / 圓角） */
const Wrap = styled.div`
  width: 100%;
  padding-inline: 16px;           /* 與版面齊 */
  display: flex;
  position: relative;
  height: 48px;
`;

/* Indicator 保留 */
const Indicator = styled.div<{left:number}>`
  position: absolute;
  bottom: 0;
  left: ${p=>p.left}%;
  width: 50%;
  height: 3px;
  background: ${C.accent};
  transition: left .35s cubic-bezier(.33,1,.68,1);
`;

const Btn = styled.button<{active:boolean}>`
  flex: 1;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: ${p=>p.active?C.text:C.sub};
  &:hover { color: ${C.text}; }
`;

export default function TabSelector({
  activeTab,
  onChange,
}: {
  activeTab: "lifecycle" | "history";
  onChange: (t: "lifecycle" | "history") => void;
}) {
  const left = activeTab === "lifecycle" ? 0 : 50;
  return (
    <Wrap>
      <Indicator left={left} />
      <Btn active={activeTab === "lifecycle"} onClick={() => onChange("lifecycle")}>
        生命週期
      </Btn>
      <Btn active={activeTab === "history"} onClick={() => onChange("history")}>
        歷史紀錄
      </Btn>
    </Wrap>
  );
}
