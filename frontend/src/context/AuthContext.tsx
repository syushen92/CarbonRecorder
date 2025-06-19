import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import CarbonRecorderABI from "../CarbonRecorderABI.json";
import contractInfo from "../contractAddress.json";

const CONTRACT_ADDRESS = contractInfo.address;

/* -------- 型別 -------- */
export type RoleType = "None" | "Consumer" | "Farmer";

interface AuthContextValue {
  account: string;
  role: RoleType;
  contract: ethers.Contract | null;
  login: () => Promise<void>;
  logout: () => void;
  registerUser: (r: "Consumer" | "Farmer") => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);
export const useAuth = () => useContext(AuthContext);

/* -------- Provider -------- */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState(
    () => sessionStorage.getItem("account") || ""
  );
  const [role, setRole] = useState<RoleType>(
    () => (sessionStorage.getItem("role") as RoleType) || "None"
  );
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  /* 角色轉字串 */
  const mapRole = (n: number): RoleType =>
    n === 2 ? "Farmer" : n === 1 ? "Consumer" : "None";

  /* 建立合約 + 讀角色 */
  const boot = async (acc: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer   = await provider.getSigner();
    const c        = new ethers.Contract(CONTRACT_ADDRESS, CarbonRecorderABI, signer);
    setContract(c);

    const roleBN  = await c.getUserRole(acc);
    const roleStr = mapRole(Number(roleBN));
    setRole(roleStr);
    sessionStorage.setItem("role", roleStr);
  };

  /* 只監聽帳號切換，不自動 boot（避免一開頁就跳過登入頁） */
  useEffect(() => {
    if (account && !contract) {
      // ① 重新整理時，自動把合約建起來
      boot(account);
      
    }
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accs: string[]) => {
        if (accs.length === 0) {
          logout();
        } else {
          logout();
          setAccount(accs[0]);
          sessionStorage.setItem("account", accs[0]);
          await boot(accs[0]);
        }
      });
    }
  }, []);

  /* ---------------- 外部能用的函式 ---------------- */
  const login = async () => {
    if (!window.ethereum) throw new Error("請先安裝 MetaMask");
    const [acc] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(acc);
    sessionStorage.setItem("account", acc);
    await boot(acc);
  };

  const logout = () => {
    setAccount("");
    setRole("None");
    setContract(null);
    sessionStorage.clear();
  };

  const refreshRole = async () => {
    if (!contract || !account) return;
    const rBN = await contract.getUserRole(account);
    const r   = mapRole(Number(rBN));
    setRole(r);
    sessionStorage.setItem("role", r);
  };

  const registerUser = async (r: "Consumer" | "Farmer") => {
    if (!contract) throw new Error("合約還沒初始化");
    const curr = await contract.getUserRole(account);
    if (Number(curr) !== 0) throw new Error("此錢包已經註冊過，請直接登入");

    const roleNum = r === "Consumer" ? 1 : 2;
    const tx = await contract.registerUser(roleNum);
    await tx.wait();
    await refreshRole();
  };

  return (
    <AuthContext.Provider
      value={{ account, role, contract, login, logout, registerUser, refreshRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};
