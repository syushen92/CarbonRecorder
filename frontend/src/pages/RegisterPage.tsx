import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import contractInfo from "../contractAddress.json";

/* ───── 木質漸層配色 ───── */
const WOOD = {
  card:   "linear-gradient(145deg,#EFE8DF 0%, #E2D3C1 100%)",
  button: "linear-gradient(135deg,#D8C4AA 0%, #B49779 100%)",
  danger: "linear-gradient(135deg,#E4B0A1 0%, #C28767 100%)",
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function RegisterPage({ account }: { account: string }) {
  const navigate = useNavigate();
  const { contract, registerUser } = useAuth();
  const [role, setRole] = useState<"Consumer" | "Farmer">("Consumer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 測試鏈接回報（保留） */
  useEffect(() => {
    (async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const net = await provider.getNetwork();
      console.log("🔥 chainId =", net.chainId);
      const code = await provider.getCode(contractInfo.address);
      console.log("byteCode length =", code.length);
    })();
  }, []);

  async function handleRegister() {
    if (!contract) return alert("合約尚未載入");
    setLoading(true);
    setError("");
    try {
      await registerUser(role);
      alert("🎉 註冊成功！");
      navigate("/");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ───── UI ───── */
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(140deg,#F3F0EB 0%,#E6DED2 60%,#DDD0BF 100%)",
        animation: "fade-bg .6s ease",
      }}
    >
      {/* 卡片 */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "48px 40px",
          background: WOOD.card,
          borderRadius: 20,
          boxShadow: "0 8px 20px rgba(0,0,0,.18)",
          textAlign: "center",
          transform: "translateY(16px)",
          animation: "slide-up .6s .15s ease-out forwards",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: 22,
            color: "#4C3A28",
          }}
        >
          註冊身份
        </h2>

        <p style={{ fontSize: 12, color: "#5B4A37", marginBottom: 18 }}>
          錢包地址：<br />
          <b>{account}</b>
        </p>

        {/* 選單 */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#F4F1ED",
            border: "1.5px solid #D0C6BA",
            borderRadius: 8,
            fontSize: 14,
            color: "#4C3A28",
            marginBottom: 20,
            cursor: "pointer",
          }}
        >
          <option value="Consumer">消費者</option>
          <option value="Farmer">茶行（可新增商品）</option>
        </select>

        {/* 送出按鈕 */}
        <button
          className="Button"
          onClick={handleRegister}
          disabled={loading}
          style={{
            background: WOOD.button,
            width: "100%",
            height: 38,
            fontSize: 15,
          }}
        >
          {loading ? "送出中…" : "送出註冊"}
        </button>

        {/* 錯誤訊息 */}
        {error && (
          <p
            style={{
              color: "#9D5F42",
              background: "rgba(226,150,150,.2)",
              borderRadius: 8,
              padding: "8px 12px",
              marginTop: 18,
              fontSize: 13,
            }}
          >
            註冊失敗：{error}
          </p>
        )}
      </div>

      {/* 關鍵影格動畫 */}
      <style>
        {`
          @keyframes fade-bg{from{opacity:0} to{opacity:1}}
          @keyframes slide-up{to{transform:translateY(0)}}
        `}
      </style>
    </div>
  );
}
