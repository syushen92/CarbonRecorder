import React from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";

/* ─── 木質色票 ─── */
const C = {
  bgTop:  "#E6DED2",
  bgBot:  "#CCBBAA",
  border:"#BDA894",
  text:   "#4C3A28",
  hover:  "#D8C4AA",
};

/* ─── 樣式 ─── */
const FloatWrap = styled.header`
  position: fixed;
  bottom: 0px;
  right: 24px;
  z-index: 1500;

  background: linear-gradient(180deg, ${C.bgTop} 0%, ${C.bgBot} 100%);
  border: 1px solid ${C.border};
  border-radius: 14px;
  padding: 10px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,.18);

  display: flex;
  align-items: center;
  gap: 10px;

  animation: slide-in .5s ease;
`;

const Addr = styled.span`
  font-size: 13px;
  color: ${C.text};
  font-weight: 600;
`;

const Btn = styled.button`
  all: unset;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
  color: ${C.text};
  background: ${C.hover};
  border-radius: 8px;
  cursor: pointer;
  transition: background .18s, transform .15s;

  &:hover { transform: translateY(-2px); }
`;

/* ─── Component ─── */
const Logout: React.FC = () => {
  const { account, logout } = useAuth();

  if (!account) return null;

  const display =
    account.slice(0, 6) + "…" + account.slice(-4);

  return (
    <FloatWrap>
      <Addr>{display}</Addr>
      <Btn onClick={logout}>登出</Btn>

      {/* 關鍵影格 */}
      <style>
        {`@keyframes slide-in{
            from{transform:translateY(12px); opacity:0}
            to  {transform:translateY(0);    opacity:1}
          }`}
      </style>
    </FloatWrap>
  );
};

export default Logout;
