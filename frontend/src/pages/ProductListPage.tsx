import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CarbonRecorderABI from "../CarbonRecorderABI.json";
import contractInfo from "../contractAddress.json";

const CONTRACT_ADDRESS = contractInfo.address;

export default function ProductListPage() {
  const navigate = useNavigate();
  const { account, role, contract: ctxContract, login, logout } = useAuth();
  const [contract, setContract] = useState<any>(ctxContract);
  const [products, setProducts] = useState<
    { id: number; name: string; owner: string }[]
  >([]);
  const [newName, setNewName] = useState("");

  /* 建合約 */
  async function ensureContract() {
    if (contract) return contract;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const c = new ethers.Contract(CONTRACT_ADDRESS, CarbonRecorderABI, signer);
    setContract(c);
    return c;
  }

  /* 讀商品清單 */
  async function loadProducts(c: any) {
    const count = Number(await c.productCount());
    const list: any[] = [];
    for (let i = 1; i <= count; i++) {
      const [id, name, owner] = await c.getProduct(i);
      list.push({ id: Number(id), name, owner });
    }
    setProducts(list);
  }

  /* 新增商品（Farmer） */
  async function addProduct() {
    if (role !== "Farmer") return alert("只有茶行可新增商品");
    if (!newName.trim()) return alert("請輸入商品名稱");
    const c = await ensureContract();
    const tx = await c.addProduct(newName.trim());
    await tx.wait();
    setNewName("");
    await loadProducts(c);
  }

  /* 首次 / 帳號變動時載入商品 */
  useEffect(() => {
    if (!account) return;
    (async () => {
      const c = await ensureContract();
      await loadProducts(c);
    })();
  }, [account]);

  return (
    <div className="PageWrapper">
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <button
          onClick={() => {
            logout(); // 清掉 context 狀態
            window.location.reload(); // 強制刷新畫面
          }}
          style={{
            backgroundColor: "#eee",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          🔄 強制登出
        </button>
      </div>

      <div className="CenteredContent">
        <h2 style={{ color: "#666" }}>商品列表</h2>

        {account ? (
          <p style={{ color: "#666", fontSize: 12 }}>✅ 已連接：{account}</p>
        ) : (
          <button className="Button" onClick={login}>
            🔐 連接錢包
          </button>
        )}

        {role === "Farmer" && (
          <div style={{ margin: "20px 0" }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="輸入新商品名稱"
              style={{ padding: "4px 8px", marginRight: 8 }}
            />
            <button className="Button" onClick={addProduct}>
              新增商品
            </button>
          </div>
        )}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {products.length === 0 ? (
            <p style={{ color: "#888" }}>尚無商品</p>
          ) : (
            products.map((p) => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <button
                  className="Button"
                  onClick={() => navigate(`/product/${p.id}`)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    backgroundColor: "rgba(208,228,234,.58)",
                    color: "rgba(78,155,178,.58)",
                  }}
                >
                  #{p.id} – {p.name}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
