import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const HEADER_HEIGHT = 36;

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: ${HEADER_HEIGHT}px;
  z-index: 1000;

  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const CenterTitle = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  font-size: 16px;
  color: #333;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
`;

type HeaderProps = {
  showBackButton?: boolean;
  title?: string;
};

export default function Header({ showBackButton = true, title }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <Section style={{ justifyContent: 'flex-start' }}>
        {showBackButton ? (
          <IconButton onClick={() => navigate(-1)}>⬅️</IconButton>
        ) : (
          <IconButton style={{ visibility: 'hidden' }}>⬅️</IconButton>
        )}
      </Section>

      <CenterTitle>{title || "載入中"}</CenterTitle>
    </HeaderContainer>
  );
}

export { HEADER_HEIGHT };
