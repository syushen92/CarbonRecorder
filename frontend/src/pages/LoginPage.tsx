import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/*
  ───── 木質調動畫小解說 ─────
  1. 外層 WoodPage：淡木紋漸層背景 + 0.6s 淡入
  2. CardPanel    ：淺胡桃卡片、柔和陰影、滑入動畫
  3. TitleCarved  ：咖啡色文字 + 內陰影 (模擬雕刻) + keyframe 昇起
  4. 按鈕          ：沿用 index.css 木質調 .Button 樣式
*/

export default function LoginPage() {
  const { account, role, login, logout } = useAuth();
  const navigate = useNavigate();

  // 已註冊直接導回首頁
  useEffect(() => {
    if (account && role !== "None") navigate("/");
  }, [account, role, navigate]);

  return (
    /* ① 全頁木紋漸層背景 + 淡入 */
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(145deg, #F4F1ED 0%, #E9E2D6 35%, #E3D4C1 100%)",
        animation: "fade-in 0.6s ease-out",
      }}
    >
      {/* ② 卡片容器 */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "48px 40px",
          background: "#EFE8DF",
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(76,58,40,.18)",
          textAlign: "center",
          transform: "translateY(20px)",
          animation: "slide-up 0.6s 0.15s ease-out forwards",
        }}
      >
        {/* ③ 木紋雕刻標題 */}
        <h2
          style={{
            margin: "0 0 24px",
            fontSize: 24,
            color: "#4C3A28",
            fontWeight: 700,
            letterSpacing: 1,
            textShadow: "0 1px 1px rgba(255,255,255,.4), inset 0 -2px 4px rgba(0,0,0,.18)",
            animation: "rise 0.6s 0.35s ease-out forwards",
            opacity: 0,
          }}
        >
          碳足跡紀錄系統
        </h2>

        {/* ④ 內容區 */}
        {account ? (
          <>
            <p style={{ fontSize: 12, color: "#715A44", margin: "0 0 20px" }}>
              ✅ 已連接：{account}
            </p>

            <div className="ButtonRow">
              <button className="Button" onClick={logout}>
                切換錢包 / 登出
              </button>

              <button
                className="Button"
                onClick={() =>
                  navigate(role === "None" ? "/register" : "/")
                }
              >
                進入系統
              </button>
            </div>
          </>
        ) : (
          <button className="Button" onClick={login}>
            🔐 連接錢包登入
          </button>
        )}
      </div>

      {/* ⑤ 關鍵影格動畫定義  */}
      <style>
        {`
        @keyframes fade-in{
          from{opacity:0}
          to{opacity:1}
        }
        @keyframes slide-up{
          to{transform:translateY(0)}
        }
        @keyframes rise{
          to{opacity:1; transform:translateY(-6px)}
        }
        `}
      </style>
    </div>
  );
}
