import { useParams } from "react-router-dom"
import ProductInput from "../components/ProductInput"

export default function ProductPostPage() {
  const { id } = useParams(); // Lấy ID nếu đang ở chế độ chỉnh sửa

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 text-center">
          {id ? "Chỉnh Sửa Sản Phẩm" : "Đăng Bán Sản Phẩm Mới"}
        </h1>
        
        {/* Truyền id vào ProductInput. Nếu không có id thì form tự hiểu là Đăng mới */}
        <ProductInput productId={id} />
      </div>
    </div>
  )
}