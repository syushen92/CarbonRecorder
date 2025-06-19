import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { account, role, login, logout } = useAuth();
  const navigate = useNavigate();

  /* 若已註冊則導入首頁；若尚未註冊則由 Gate 轉 /register */
  useEffect(() => {
    if (account && role !== "None") navigate("/");
  }, [account, role, navigate]);

  return (
    <div className="CenteredContent">
      <h2>碳足跡紀錄系統</h2>

      {account ? (
        <>
          <p>✅ 已連接：{account}</p>
          <button className="Button" onClick={logout}>
            切換錢包 / 登出
          </button>
          <button
            className="Button"
            onClick={() => navigate(role === "None" ? "/register" : "/")}
          >
            進入系統
          </button>
        </>
      ) : (
        <button className="Button" onClick={login}>
          🔐 連接錢包登入
        </button>
      )}
    </div>
  );
}
