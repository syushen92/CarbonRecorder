// src/pages/Home.tsx
import React, { useState } from 'react';
import Header from '../components/Header';
import StageBlock from '../components/StageBlock';
import HistoryList from '../components/HistoryList';
import TabSelector from '../components/TabSelector';
import './index.css';

interface HomeProps {
  productName: string;
  records: any[];
  productId: string;
  contract: any;
  onStepClick: (stageName: string, stepName: string) => void;
  stages: any[];
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  saveAndReturn: () => void;
}

export default function Home({
  records,
  onStepClick,
  stages,
  openSections,
  setOpenSections,
  saveAndReturn,
}: HomeProps) {
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'history'>('lifecycle');

  return (
    <div>
      <TabSelector activeTab={activeTab} onChange={setActiveTab}/>
      {activeTab === 'lifecycle' ? (
        <>
          {stages.map((stage) => (
            <StageBlock
              key={stage.name}
              stage={stage}
              open={!!openSections[stage.name]}
              onToggle={() =>
                setOpenSections((prev) => ({
                  ...prev,
                  [stage.name]: !prev[stage.name],
                }))
              }
              onStepClick={(stepName) => onStepClick(stage.name, stepName)}
            />
          ))}
        </>
      ) : (
        <div className="CenteredContent">
          <HistoryList records={records} />
          <div className="ButtonRow">
            <button className="SaveButton" onClick={saveAndReturn}>
              儲存並回到商品列表
            </button>
          </div>
        </div>
      )}
    </div>
  );
}