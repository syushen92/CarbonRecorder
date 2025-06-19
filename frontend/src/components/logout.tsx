import React from "react";
import { useAuth } from "../context/AuthContext";

const Logout: React.FC = () => {
  const { account, logout } = useAuth();

  return (
    <header>
      {account && (
        <>
          <span>{account.slice(0, 6)}…{account.slice(-4)}</span>
          <button onClick={logout}>登出</button>
        </>
      )}
    </header>
  );
};

export default Logout;