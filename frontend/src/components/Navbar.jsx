import { Link } from "react-router-dom"
// Import thêm 3 icon: LogOut, LogIn, UserPlus
import { Search, User, ShoppingCart, Store, ClipboardList, LogOut, LogIn, UserPlus } from "lucide-react"

export default function Navbar() {
  // 1. Kiểm tra xem đã có "chìa khóa" trong bộ nhớ chưa
  const isLoggedIn = !!localStorage.getItem('access_token');

  // 2. Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login'; // Tải lại trang và về trang Đăng nhập
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#d70018] text-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* 1. TRÁI: Logo / Tên trang web */}
        <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter shrink-0 hover:text-white/90">
          CHỢ CÔNG NGHỆ
        </Link>

        {/* 2. GIỮA: Thanh tìm kiếm */}
        <div className="flex-1 max-w-2xl relative hidden sm:block">
          <input 
            type="text" 
            placeholder="Bạn cần tìm đồ công nghệ cũ gì hôm nay?" 
            className="w-full h-10 pl-4 pr-12 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-red-300 shadow-inner"
          />
          <button className="absolute right-1 top-1 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200">
            <Search size={18} />
          </button>
        </div>

        {/* 3. PHẢI: Cụm Icon Chức Năng */}
        <div className="flex items-center gap-5 md:gap-6 shrink-0 text-sm font-medium">
          
          {/* LUÔN HIỂN THỊ: GIỎ HÀNG */}
          <Link to="/cart" className="flex flex-col items-center gap-1 hover:text-red-200 transition-colors relative">
            <ShoppingCart size={22} />
            <span className="absolute -top-1 -right-2 bg-yellow-400 text-slate-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              3
            </span>
            <span className="text-[10px] hidden md:block">Giỏ hàng</span>
          </Link>

          {/* KIỂM TRA ĐIỀU KIỆN ĐĂNG NHẬP */}
          {isLoggedIn ? (
            <>
              <Link to="/orders" className="flex flex-col items-center gap-1 hover:text-red-200 transition-colors">
                <ClipboardList size={22} />
                <span className="text-[10px] hidden md:block">Đơn mua</span>
              </Link>

              <Link to="/shop/manage" className="flex flex-col items-center gap-1 hover:text-red-200 transition-colors">
                <Store size={22} />
                <span className="text-[10px] hidden md:block">Shop của tôi</span>
              </Link>

              <Link to="/profile" className="flex flex-col items-center gap-1 hover:text-red-200 transition-colors">
                <User size={22} />
                <span className="text-[10px] hidden md:block">Tài khoản</span>
              </Link>

              {/* NÚT ĐĂNG XUẤT */}
              <button onClick={handleLogout} className="flex flex-col items-center gap-1 hover:text-yellow-300 text-yellow-100 transition-colors">
                <LogOut size={22} />
                <span className="text-[10px] hidden md:block">Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              {/* NÚT ĐĂNG NHẬP / ĐĂNG KÝ (HIỆN KHI CHƯA ĐĂNG NHẬP) */}
              <Link to="/login" className="flex flex-col items-center gap-1 hover:text-red-200 transition-colors">
                <LogIn size={22} />
                <span className="text-[10px] hidden md:block">Đăng nhập</span>
              </Link>

              <Link to="/register" className="flex flex-col items-center gap-1 hover:text-red-200 transition-colors">
                <UserPlus size={22} />
                <span className="text-[10px] hidden md:block">Đăng ký</span>
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  )
}