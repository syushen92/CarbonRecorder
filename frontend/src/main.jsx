import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './pages/index.css'
// import App from './App.jsx'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import ProductLifecyclePage from './pages/App'
import ProductListPage from './pages/ProductListPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductListPage/>}/>
        <Route path="/product/:productId" element={<ProductLifecyclePage/>}/>
      </Routes>
    </BrowserRouter>
    {/* <App /> */}
  </StrictMode>,
)
