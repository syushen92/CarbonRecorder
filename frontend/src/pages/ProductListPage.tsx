import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CarbonRecorderABI from "../CarbonRecorderABI.json";
import contractInfo from "../contractAddress.json";

const CONTRACT_ADDRESS = contractInfo.address;

/* 木質配色 */
const WOOD = {
  card  : "linear-gradient(145deg,#EFE8DF 0%, #E2D3C1 100%)",
  button: "linear-gradient(135deg,#D8C4AA 0%, #B49779 100%)",
  logout: "linear-gradient(135deg,#E6DED2 0%, #CCBBAA 100%)",
};

export default function ProductListPage() {
  const nav = useNavigate();
  const { account, role, contract: ctxContract, login, logout } = useAuth();
  const [contract, setContract] = useState<any>(ctxContract);
  const [products, setProducts] = useState<
    { id: number; name: string; owner: string }[]
  >([]);
  const [newName, setNewName] = useState("");

  /* ------- 合約互動 ------- */
  async function ensureContract() {
    if (contract) return contract;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const c = new ethers.Contract(CONTRACT_ADDRESS, CarbonRecorderABI, signer);
    setContract(c);
    return c;
  }
  async function loadProducts(c: any) {
    const count = Number(await c.productCount());
    const list: any[] = [];
    for (let i = 1; i <= count; i++) {
      const [id, name] = await c.getProduct(i);
      list.push({ id: Number(id), name, owner: "" });
    }
    setProducts(list);
  }
  async function addProduct() {
    if (role !== "Farmer") return alert("只有茶行可新增商品");
    if (!newName.trim()) return alert("請輸入商品名稱");
    const c = await ensureContract();
    const tx = await c.addProduct(newName.trim());
    await tx.wait();
    setNewName("");
    await loadProducts(c);
  }
  useEffect(() => {
    if (!account) return;
    (async () => {
      const c = await ensureContract();
      await loadProducts(c);
    })();
  }, [account]);

  /* ------- UI ------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(140deg,#F3F0EB 0%,#E6DED2 60%,#DDD0BF 100%)",
        animation: "fade-bg 0.6s ease",
      }}
    >
      {/* 浮動登出 */}
      <button
        onClick={() => { logout(); window.location.reload(); }}
        style={{
          position: "fixed",
          top: 8,
          right: 18,
          padding: "4px 12px",
          fontSize: 13,
          color: "#4C3A28",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          background: WOOD.logout,
          boxShadow: "0 2px 5px rgba(0,0,0,.16)",
        }}
      >
        🔄 登出
      </button>

      {/* 商品卡片：頂端僅 8px */}
      <div
        style={{
          maxWidth: 480,
          margin: "8px auto 32px",
          padding: "32px 26px",
          background: WOOD.card,
          borderRadius: 20,
          boxShadow: "0 6px 18px rgba(0,0,0,.18)",
        }}
      >
        <h2
          style={{
            margin: "0 0 16px",
            color: "#4C3A28",
            fontSize: 22,
            textAlign: "center",
          }}
        >
          商品列表
        </h2>

        {account ? (
          <p
            style={{
              textAlign: "center",
              color: "#5B4A37",
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            ✅ 已連接：{account}
          </p>
        ) : (
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <button
              className="Button"
              onClick={login}
              style={{ background: WOOD.button }}
            >
              🔐 連接錢包
            </button>
          </div>
        )}

        {/* 新增商品 */}
        {role === "Farmer" && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="輸入新商品名稱"
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1.5px solid #D0C6BA",
                borderRadius: 8,
                fontSize: 14,
                color: "#4C3A28",
                background: "#F4F1ED",
              }}
            />
            <button
              className="Button"
              onClick={addProduct}
              style={{ background: WOOD.button }}
            >
              新增
            </button>
          </div>
        )}

        {/* 列出商品 */}
        {products.length === 0 ? (
          <p style={{ color: "#7C6B55", textAlign: "center" }}>尚無商品</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {products.map((p) => (
              <li key={p.id} style={{ marginBottom: 10 }}>
                <button
                  onClick={() => nav(`/product/${p.id}`)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    border: "none",
                    borderRadius: 10,
                    background: WOOD.button,
                    color: "#4C3A28",
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,.14)",
                    transition: "transform .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")}
                >
                  #{p.id} – {p.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 全域 & 動畫 */}
      <style>{`
        body{margin:0}
        @keyframes fade-bg{from{opacity:0} to{opacity:1}}
      `}</style>
    </div>
  );
}
