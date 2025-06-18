import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractInfo from "../contractAddress.json";
import CarbonRecorderABI from "../CarbonRecorderABI.json";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = contractInfo.address;

declare global {
  interface Window {
    ethereum?: any;
  }
}
export default function ProductListPage() {
  const navigate = useNavigate();
  const [contract, setContract] = useState<any>(null);
  const [products, setProducts] = useState<{ id: number; name: string; owner: string }[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [account, setAccount] = useState("");

  async function loadContract() {
    if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const code = await provider.getCode(CONTRACT_ADDRESS);
        console.log("code:", code);

        const network = await provider.getNetwork();
        console.log("Connected to network:", network.chainId);

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CarbonRecorderABI, signer);
        setContract(contract);
        loadProducts(contract);
    }
  }

  async function loadProducts(contract: any) {
    const countBN = await contract.productCount();
    const count = Number(countBN);
    const list: any[] = [];
    for (let i = 1; i <= count; i++) {
      const p = await contract.getProduct(i);
      list.push({ id: Number(p[0]), name: p[1], owner: p[2] });
    }
    setProducts(list);
  }

  async function connectWallet() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      loadContract();
    } else {
      alert("請安裝MetaMask");
    }
  }

  async function addProduct() {
    if (!contract) {
      alert("合約尚未載入");
      return;
    }
    if (!newProductName.trim()) {
      alert("請輸入商品名稱");
      return;
    }
    try {
      const tx = await contract.addProduct(newProductName.trim());
      await tx.wait();
      setNewProductName("");
      loadProducts(contract);
    } catch (e) {
      console.error("新增商品失敗", e);
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          loadContract();
        } else {
          setAccount("");
          setContract(null);
          setProducts([]);
        }
      });
    }
  }, []);

  return (
    <div className="PageWrapper">
      <div className="CenteredContent">
        <h2 style={{color:"#666"}}>商品列表</h2>
        {account ? (
          <p style={{ color: "#666", fontSize: "12px" }}>
            ✅ 已連接帳號：{account}</p>
        ) : (
          <button className="Button" onClick={connectWallet}>
            連接錢包
          </button>
        )}

        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="輸入新商品名稱"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            style={{ padding: "4px 8px", marginRight: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <button className="Button" style={{backgroundColor:"rgb(242, 230, 226)", color:"rgb(231, 172, 153)"}}
            onClick={addProduct}>
            新增商品
          </button>
        </div>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {products.map((p) => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <button
                className="Button"
                onClick={() => navigate(`/product/${p.id}`)}
                style={{ width: "100%", textAlign: "left" ,backgroundColor: "rgba(208, 228, 234, 0.58)", color: "rgba(78, 155, 178, 0.58)"}}
              >
                ID:{p.id} - {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
