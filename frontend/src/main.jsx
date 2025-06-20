import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./pages/index.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProductLifecyclePage from "./pages/ProductLifeCycle";
import ProductListPage from "./pages/ProductListPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { ReportProvider } from "./context/ReportContext";

function Gate() {
  const { account, role } = useAuth();
  const { pathname } = useLocation();

  if (!account) return <LoginPage />;            // 未連錢包
  if (role === "None") {                         // 未註冊
    return pathname === "/register"
      ? <RegisterPage account={account} />
      : <Navigate to="/register" replace />;
  }
  if (pathname === "/register") return <Navigate to="/" replace />;
  return <ProductListPage />;                    // 已註冊
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReportProvider>   {/* ← 加這層 */}
          <Routes>
            <Route path="/"           element={<Gate />} />
            <Route path="/register"   element={<Gate />} />
            <Route path="/product/:productId" element={<ProductLifecyclePage />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </ReportProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
