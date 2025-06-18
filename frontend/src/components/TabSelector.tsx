import React from 'react';
import styled from 'styled-components';

const TabContainer = styled.div`
  display: flex;
  justify-content: space-around;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e5e5e5;
  max-width: 480px;
  margin: 0 auto;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 0;
  background: none;
  border: none;
  font-size: 16px;
  color: ${({ $active }) => ($active ? '#222' : '#888')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  border-bottom: ${({ $active }) => ($active ? '2px solid #222' : '2px solid transparent')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #222;
  }
`;

interface TabSelectorProps {
  activeTab: 'lifecycle' | 'history';
  onChange: (tab: 'lifecycle' | 'history') => void;
}

export default function TabSelector({ activeTab, onChange }: TabSelectorProps) {

  return (
    <TabContainer>
      <TabButton $active={activeTab === 'lifecycle'} onClick={() => onChange('lifecycle')}>
        生命週期
      </TabButton>
      <TabButton $active={activeTab === 'history'} onClick={() => onChange('records')}>
        歷史紀錄
      </TabButton>
    </TabContainer>
  );
}
