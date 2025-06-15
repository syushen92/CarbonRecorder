import React from "react";
import styled from "styled-components";

const StageBlockWrapper = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 16px auto;
  display: grid;
  grid-template-columns: 40px 1fr;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const StageLabel = styled.div`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  background: #eee;
  color: #333;
  font-weight: bold;
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StepWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const StepRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const StepButton = styled.button`
  writing-mode: vertical-rl;
  text-orientation: upright;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 28px;
  height: 72px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  color: #666;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  margin: 0 12px 8px auto;
`;

const ExtraInfo = styled.div`
  padding: 8px 12px 12px;
  border-top: 1px dashed #ccc;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Pill = styled.div`
  background: #e6f0ff;
  color: #333;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
`;

interface StageBlockProps {
  stage: {
    name: string;
    steps: string[];
    extras: string[];
  };
  open: boolean;
  onToggle: () => void;
  onStepClick: (label: string) => void;
}

export default function StageBlock({
  stage,
  open,
  onToggle,
  onStepClick,
}: StageBlockProps) {
  return (
    <StageBlockWrapper>
      <StageLabel>{stage.name}</StageLabel>
      <div>
        <StepWrapper>
          <StepRow>
            {stage.steps.map((step, idx) => (
              <React.Fragment key={step}>
                <StepButton onClick={() => onStepClick(step)}>
                  {step}
                </StepButton>
                {idx < stage.steps.length - 1 && <span>→</span>}
              </React.Fragment>
            ))}
          </StepRow>
        </StepWrapper>
        {stage.extras && stage.extras.length > 0 && (
          <>
            <ToggleButton onClick={onToggle}>
              {open ? "▲ 收合附加項目" : "▼ 附加項目"}
            </ToggleButton>
            {open && (
              <ExtraInfo>
                {stage.extras.map((item) => (
                  <Pill key={item} onClick={() => onStepClick(item)}>
                    {item}
                  </Pill>
                ))}
              </ExtraInfo>
            )}
          </>
        )}
      </div>
    </StageBlockWrapper>
  );
}