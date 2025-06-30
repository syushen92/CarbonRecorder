import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import CarbonRecorderABI from "../CarbonRecorderABI.json";
import contractInfo from "../contractAddress.json";
import "./index.css";

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

  const [modalOpen, setModalOpen] = useState(false);
  // 常用產品 ID 狀態（初始化從 localStorage 讀）
  const [modalProductId, setModalProductId] = useState("");
  const [frequentProductIds, setFrequentProductIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("frequentProducts");
    return saved ? JSON.parse(saved) : [];
  });

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

  // 設定常用產品
  function setFrequent() {
    const input = modalProductId.trim();
    if (!input){
      setModalOpen(false);
      return;
    }
    const ids = input
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n));

    // 原本與新的常用產品 ID 合併，並去除重複的，轉換成 Set 後再轉回 Array
    const merged = Array.from(new Set([...frequentProductIds, ...ids]));
    setFrequentProductIds(merged);
    localStorage.setItem("frequentProducts", JSON.stringify(merged));
    setModalOpen(false);
  }

  useEffect(() => {
    if (!account) return;
    (async () => {
      const c = await ensureContract();
      await loadProducts(c);
    })();
  }, [account]);

  // 排序：常用產品在前面
  const sortedProducts = [...products].sort((a, b) => {
    const aIsFrequent = frequentProductIds.includes(a.id);
    const bIsFrequent = frequentProductIds.includes(b.id);
    if (aIsFrequent && !bIsFrequent) return -1;
    if (!aIsFrequent && bIsFrequent) return 1;
    return 0;
  });

  /* ------- UI ------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",                // 新增
        justifyContent: "center",       // 新增
        alignItems: "center",           // 新增
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

        {/* 設定常用產品按鈕 */}
        <button
          onClick={() => {
            setModalProductId("") // 清空輸入框
            setModalOpen(true)
          }}
          style={{
            marginBottom: 12,
            padding: "6px 10px",
            fontSize: 12,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            background: WOOD.button,
            color: "#4C3A28",
          }}
        >
          ⭐ 設定常用產品
        </button>

        {/* 列出商品 */}
        {sortedProducts.length === 0 ? (
          <p style={{ color: "#7C6B55", textAlign: "center" }}>尚無商品</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sortedProducts.map((p) => (
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
                  {frequentProductIds.includes(p.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 避免觸發外層的點擊事件
                        const updated = frequentProductIds.filter(id => id !== p.id);
                        setFrequentProductIds(updated);
                        localStorage.setItem("frequentProducts", JSON.stringify(updated));
                      }}
                      style={{
                        marginLeft: 8,
                        background: "none",
                        border: "none",
                        fontSize: 15,
                        cursor: "pointer",
                      }}
                      title="取消常用"
                    >
                      ⭐
                    </button>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* 常用產品設定 */}
        <Modal visible={modalOpen} onClose={() => setModalOpen(false)}>
          <h3>輸入常用產品ID</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              className="InputAmount"
              value={modalProductId}
              onChange={(e) => setModalProductId(e.target.value)}
              placeholder="例如：1, 2, 3"
            />
          </div>
          <div style={{ textAlign:"right" }}>
              <div className="ButtonRow">
              <button className="SubmitButton" onClick={setFrequent}>
                確認
              </button>
              <button className="CancelButton" onClick={() => setModalOpen(false)}>
                取消
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* 全域 & 動畫 */}
      <style>{`
        body{margin:0}
        @keyframes fade-bg{from{opacity:0} to{opacity:1}}
      `}</style>
    </div>
  );
}
