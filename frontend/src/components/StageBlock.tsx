import React from "react";
import styled from "styled-components";

/* 木質色票 */
const C = {
  cardTop:"#EFE8DF", cardBot:"#E2D3C1", strip:"#CBB499", border:"#D8C4AA",
  text:"#4C3A28", sub:"#7C6B55",
  btnTop:"#D8C4AA", btnBot:"#B49779", btnHov:"#CBB499",
  pillTop:"#CBB499", pillBot:"#A7805F",
};

/* 外框 */
const Wrapper = styled.div`
  width: calc(100% - 32px);          /* 兩側各 16px 內縮 */
  margin: 16px 16px;
  display: grid;
  grid-template-columns: 46px 1fr;
  border-radius: 14px;
  overflow: hidden;

  background: linear-gradient(180deg,${C.cardTop} 0%,${C.cardBot} 100%);
  border: 1px solid ${C.border};
  box-shadow: 0 6px 18px rgba(0,0,0,.12);
`;

const Label = styled.div`
  writing-mode: vertical-rl;
  background: ${C.strip};
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  display: flex; align-items:center; justify-content:center;
`;

const Inner = styled.div`padding: 14px 12px 10px;`;

/* 主要步驟列：改成 wrap，無水平滾動 */
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;          /* 自動換行 */
  gap: 6px;
`;

const Btn = styled.button`
  all: unset;
  width: 32px;              /* 更窄 */
  min-height: 80px;         /* 更矮 */
  padding: 4px 0;
  box-sizing: border-box;
  flex-shrink: 0;

  writing-mode: vertical-rl;
  text-orientation: upright;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  background: linear-gradient(180deg,${C.btnTop} 0%,${C.btnBot} 100%);
  border: 1px solid ${C.border};
  border-radius: 8px;
  color: ${C.text};
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: transform .15s, background .2s, box-shadow .15s;

  &:hover {
    background: ${C.btnHov};
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,.14);
  }
`;

const Toggle = styled.button`
  all: unset;
  display: block;
  margin: 8px 0 0 auto;
  font-size: 13px;
  color: ${C.sub};
  cursor: pointer;
  &:hover { color: ${C.text}; }
`;

const ExtraWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed ${C.border};
`;
const Pill = styled.div`
  background: linear-gradient(135deg,${C.pillTop} 0%,${C.pillBot} 100%);
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
  &:hover { transform: translateY(-2px); box-shadow: 0 3px 5px rgba(0,0,0,.2); }
`;

/* 介面 */
interface Stage { name:string; steps:string[]; extras:string[] }
interface Props {
  stage: Stage; open: boolean;
  onToggle: () => void; onStepClick: (label:string) => void;
}

export default function StageBlock({ stage, open, onToggle, onStepClick }: Props) {
  return (
    <Wrapper>
      <Label>{stage.name}</Label>
      <Inner>
        <Row>
          {stage.steps.map((s) => (
            <Btn key={s} onClick={() => onStepClick(s)}>
              {s}
            </Btn>
          ))}
        </Row>

        {stage.extras.length > 0 && (
          <>
            <Toggle onClick={onToggle}>
              {open ? "▲ 收合附加項目" : "▼ 附加項目"}
            </Toggle>
            {open && (
              <ExtraWrap>
                {stage.extras.map((e) => (
                  <Pill key={e} onClick={() => onStepClick(e)}>
                    {e}
                  </Pill>
                ))}
              </ExtraWrap>
            )}
          </>
        )}
      </Inner>
    </Wrapper>
  );
}
