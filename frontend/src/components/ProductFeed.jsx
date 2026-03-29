import { useState, useEffect } from "react" // ADDED
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Laptop, Tablet, Cpu, LayoutGrid, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
export default function ProductFeed() {
  const [activeCategory, setActiveCategory] = useState("all")
  // STATE FOR LIVE PRODUCTS
  const [allProducts, setAllProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // FETCH DATA FROM DJANGO
  // FETCH DATA FROM DJANGO
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Đổi 127.0.0.1 thành localhost cho khớp với lúc đăng sản phẩm
        const response = await fetch('http://localhost:8000/api/products/') 
        const data = await response.json()
        
        // DÒNG NÀY RẤT QUAN TRỌNG: In ra Console để bắt bệnh
        console.log("Dữ liệu Django gửi về:", data); 

        const validData = Array.isArray(data) ? data : (data.results || [])
        setAllProducts(validData) 
      } catch (error) {
        console.error("Lỗi mạng/CORS khi tải dữ liệu:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = activeCategory === "all" 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory)

  const categories = [
    { id: "all", label: "Tất cả", icon: <LayoutGrid size={16}/> },
    { id: "phone", label: "Điện thoại / Tablet", icon: <Tablet size={16}/> },
    { id: "laptop", label: "Laptop", icon: <Laptop size={16}/> },
    { id: "pc", label: "PC & Linh kiện", icon: <Cpu size={16}/> },
  ]

  const getCategoryName = (cat) => {
    if(cat === 'phone') return 'Điện thoại'
    if(cat === 'laptop') return 'Laptop'
    if(cat === 'pc') return 'Linh kiện'
    return cat
  }

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500 font-medium">Đang tải sản phẩm từ Chợ...</div>
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Menu Chọn Danh Mục */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full flex gap-2.5 h-11 px-7 shadow-sm transition-all duration-300 border ${
              activeCategory === cat.id 
                ? "bg-[#d70018] hover:bg-[#d70018]/90 text-white border-[#d70018] shadow-red-200 shadow-lg" 
                : "bg-white text-slate-700 hover:bg-red-50 hover:border-red-200"
            }`}
          >
            {cat.icon}
            <span className="font-semibold">{cat.label}</span>
          </Button>
        ))}
      </div>

      {/* Lưới Sản Phẩm */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((product) => {
          
          const currentPrice = Number(product.price);
          const originalNewPrice = Number(product.original_new_price || 0); // Mapped to Django field
          let savingsPercent = 0;
          if (originalNewPrice > currentPrice) {
            savingsPercent = Math.round(((originalNewPrice - currentPrice) / originalNewPrice) * 100);
          }

          const conditionDisplay = product.condition === "99" ? "Như mới 99%" : 
                                   product.condition === "95" ? "Tốt 95%" : 
                                   product.condition === "90" ? "Khá 90%" : "Xác máy";

          // Safely get the first image
          const imageUrl = product.images && product.images.length > 0 
            ? (product.images[0].image.startsWith('http') 
                ? product.images[0].image 
                : `http://localhost:8000${product.images[0].image}`)
            : "https://via.placeholder.com/150?text=No+Image";

          return (
            <Card key={product.id} className="overflow-hidden group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border-slate-100 rounded-2xl bg-white flex flex-col relative">
              
              {savingsPercent > 0 && (
                <div className="absolute top-0 left-0 bg-[#f59e0b] text-slate-950 text-[11px] font-black px-3 py-1.5 rounded-br-xl z-10 shadow">
                  Tiết kiệm {savingsPercent}%
                </div>
              )}

              <div className="aspect-square relative overflow-hidden bg-white p-4 flex items-center justify-center border-b border-slate-50">
                <img 
                  src={imageUrl} 
                  alt={product.title} 
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-2 right-2 bg-slate-100/90 text-slate-600 hover:bg-slate-100 border-0 font-medium text-[10px] px-2 py-0.5">
                  {getCategoryName(product.category)}
                </Badge>
              </div>

              <CardContent className="p-4 space-y-3 flex-grow">
                {/* Specs parsing (since specs is a JSON string/object from Django) */}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                  <span>{product.specs?.brand || "Brand"}</span>
                </p>

                <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm md:text-[15px] h-10 md:h-11 leading-tight group-hover:text-[#d70018] transition-colors">
                  {product.title}
                </h3>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <Sparkles size={14} className="text-[#f59e0b] shrink-0" />
                  <span className="text-xs font-medium text-slate-600 line-clamp-1">
                    {conditionDisplay}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p className="text-lg md:text-xl font-extrabold text-[#d70018]">
                    {currentPrice.toLocaleString('vi-VN')} ₫
                  </p>
                  
                  {savingsPercent > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">
                        Giá mua mới: {originalNewPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 mt-auto">
  <Link to={`/product/${product.id}`} className="w-full">
    <Button 
      variant="outline" 
      className="w-full text-xs font-bold border-red-100 text-[#d70018] hover:bg-red-50 hover:border-red-200 hover:text-[#d70018] rounded-lg h-9"
    >
      Xem chi tiết
    </Button>
  </Link>
</CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}