import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import contractInfo from "../contractAddress.json";


export default function RegisterPage({ account }: { account: string }) {
  const navigate = useNavigate();
  const { contract, registerUser } = useAuth();
  const [role, setRole] = useState<"Consumer" | "Farmer">("Consumer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  (async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const net = await provider.getNetwork();
    console.log("🔥 chainId =", net.chainId);          // 應該印 1337
    const code = await provider.getCode(contractInfo.address);
    console.log("byteCode length =", code.length);     // > 2 代表鏈上有合約
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

  return (
    <div className="CenteredContent">
      <h2>註冊身份</h2>
      <p>錢包地址：<br /><b>{account}</b></p>

      <select value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option value="Consumer">消費者</option>
        <option value="Farmer">茶行（可新增商品）</option>
      </select>

      <button className="Button" onClick={handleRegister} disabled={loading}>
        {loading ? "送出中…" : "送出註冊"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 16 }}>
          註冊失敗：{error}
        </p>
      )}
    </div>
  );
}
