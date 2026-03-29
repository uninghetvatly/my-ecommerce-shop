import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductPostPage from "./pages/ProductPostPage";
import UserProfilePage from "./pages/UserProfilePage";
import ShopManagementPage from "./pages/ShopManagementPage";
import RegisterPage from "./pages/RegisterPage";
// IMPORT TRANG QUẢN LÝ MUA HÀNG MỚI
import ProductView from "./pages/ProductView";
import CustomerOrdersPage from "./pages/CustomerOrdersPage"; 
import LoginPage from "./pages/LoginPage"
import ShopViewPage from "./pages/ShopViewPage";
function App() {
  return (
    <BrowserRouter>
      <div className="font-sans min-h-screen bg-slate-50 text-slate-900 relative">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sell" element={<ProductPostPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/edit-product/:id" element={<ProductPostPage />} />
          <Route path="/shop/manage" element={<ShopManagementPage />} />
          <Route path="/product/:id" element={<ProductView />} />
          {/* CẢ 2 ROUTE NÀY GIỜ ĐỀU TRỎ VÀO TRANG MUA HÀNG CHỨA TABS */}
          <Route path="/cart" element={<CustomerOrdersPage />} />
          <Route path="/orders" element={<CustomerOrdersPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/shop/view/:id" element={<ShopViewPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;