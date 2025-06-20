import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

/* ─── 色票 ─── */
const C = {
  bgTop:  "#EFE8DF",
  bgBot:  "#E2D3C1",
  border:"#D8C4AA",
  text:  "#4C3A28",
};

export const HEADER_HEIGHT = 44;

/* ─── 樣式 ─── */
const HeaderWrap = styled.header`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  height: ${HEADER_HEIGHT}px;
  z-index: 1200;

  background: linear-gradient(180deg, ${C.bgTop} 0%, ${C.bgBot} 100%);
  border-bottom: 1px solid ${C.border};
  box-shadow: 0 3px 8px rgba(0, 0, 0, .08);

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;

  animation: slide-down .6s ease-out;
`;

const Slot = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const CenterTitle = styled.h2`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: ${C.text};
`;

const IconBtn = styled.button`
  all: unset;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: ${C.text};
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .18s, transform .15s;

  &:hover {
    background: rgba(0,0,0,.06);
    transform: translateY(-1px);
  }
`;

type Props = { showBackButton?: boolean; title?: string };

export default function Header({ showBackButton = true, title }: Props) {
  const nav = useNavigate();

  return (
    <HeaderWrap>
      {/* 左側：返回鍵或占位 */}
      <Slot style={{ justifyContent: "flex-start" }}>
        {showBackButton ? (
          <IconBtn onClick={() => nav(-1)}>⟵</IconBtn>
        ) : (
          <IconBtn style={{ visibility: "hidden" }}>⟵</IconBtn>
        )}
      </Slot>

      {/* 中央標題 */}
      <CenterTitle>{title ?? "載入中…"}</CenterTitle>

      {/* 右側：可放頭像或功能；先留空位 */}
      <Slot style={{ justifyContent: "flex-end" }} />
    </HeaderWrap>
  );
}

/* ─── 關鍵影格 ─── */
const style = document.createElement("style");
style.innerHTML = `
@keyframes slide-down {
  from { transform: translate(-50%, -12px); opacity: 0; }
  to   { transform: translate(-50%, 0);    opacity: 1; }
}`;
document.head.appendChild(style);
