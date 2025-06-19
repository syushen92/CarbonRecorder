import React from "react";
import styled, { keyframes } from "styled-components";

/* ─── 木質色票 ─── */
const C = {
  cardTop: "#EFE8DF",
  cardBot: "#E2D3C1",
  border:  "#D8C4AA",
};

/* ─── 動畫 ─── */
const fadeIn = keyframes`
  from { opacity: 0; } to { opacity: 1; }
`;
const slideUp = keyframes`
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

/* ─── 樣式 ─── */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1300;
  animation: ${fadeIn} .25s ease-out;
`;

const Card = styled.div`
  width: 92vw;
  max-width: 440px;
  background: linear-gradient(180deg, ${C.cardTop} 0%, ${C.cardBot} 100%);
  border: 1px solid ${C.border};
  border-radius: 18px;
  padding: 28px 24px;
  box-shadow: 0 10px 24px rgba(0,0,0,.25);
  animation: ${slideUp} .35s ease-out;
  overflow-y: auto;
  max-height: 80vh;
`;

/* ─── Props ─── */
interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/* ─── Component ─── */
export default function Modal({ visible, onClose, children }: Props) {
  if (!visible) return null;

  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        {children}
      </Card>
    </Backdrop>
  );
}
