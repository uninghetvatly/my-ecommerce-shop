import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingCart, Zap, ShieldCheck, Store, MessageSquare } from "lucide-react"
import { Star } from "lucide-react"
import { Link } from "react-router-dom"
export default function ProductView() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState("")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [reviews, setReviews] = useState([])
  const [newComment, setNewComment] = useState("")
  const [newRating, setNewRating] = useState(5)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const handleAddToCart = async () => {
    // 1. Lấy chìa khóa ra kiểm tra
    const token = localStorage.getItem('access_token')
    
    // Nếu chưa đăng nhập thì báo lỗi và chuyển ra trang login
    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!")
      navigate('/login') // Chuyển hướng
      return
    }
  
    setIsAddingToCart(true)
    try {
      const response = await fetch('http://localhost:8000/api/cart/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 2. KẸP CHÌA KHÓA VÀO ĐÂY!
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      })

      // 3. Nếu chìa khóa hết hạn
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!")
        navigate('/login')
        return
      }

      if (response.ok) {
        alert("🎉 Đã thêm sản phẩm vào giỏ hàng thành công!")
      } else {
        alert("Oops! Có lỗi xảy ra khi thêm vào giỏ hàng.")
      }
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }
  const handleBuyNow = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert("Bạn cần đăng nhập để mua hàng!")
      navigate('/login')
      return
    }

    setIsAddingToCart(true)
    try {
      const response = await fetch('http://localhost:8000/api/cart/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id, quantity: 1 })
      })

      if (response.ok) {
        // Thay vì chỉ hiện thông báo, ta chuyển hướng thẳng sang trang giỏ hàng
        navigate('/cart') 
      } else if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!")
        navigate('/login')
      }
    } catch (error) {
      console.error("Lỗi mua ngay:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }
  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        // 1. Lấy thông tin sản phẩm (Lúc này API đã trả về kèm shop_info, average_rating)
        const resProduct = await fetch(`http://localhost:8000/api/products/${id}/`)
        if (resProduct.ok) {
          const data = await resProduct.json()
          setProduct(data)
          
          let finalImageUrl = "https://via.placeholder.com/500?text=No+Image"
          
          if (data.images && data.images.length > 0) {
            const firstImg = data.images[0].image
            finalImageUrl = firstImg.startsWith('http') ? firstImg : `http://localhost:8000${firstImg}`
          } else if (data.image) {
            finalImageUrl = data.image.startsWith('http') ? data.image : `http://localhost:8000${data.image}`
          }
          
          setMainImage(finalImageUrl)
        } else {
          navigate('/')
        }
      const resReviews = await fetch(`http://localhost:8000/api/products/${id}/reviews/`)
        if (resReviews.ok) {
           const revData = await resReviews.json()
           setReviews(revData)
        }
      } catch (error) {
        console.error("Lỗi:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProductAndReviews()
  }, [id])
const handleSubmitReview = async () => {
     const token = localStorage.getItem('access_token')
     if (!token) {
        alert("Bạn cần đăng nhập để đánh giá!")
        navigate('/login')
        return
     }
     
     if (!newComment.trim()) return

     setIsSubmittingReview(true)
     try {
         const response = await fetch(`http://localhost:8000/api/products/${id}/reviews/`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify({ rating: newRating, comment: newComment })
         })

         if (response.ok) {
             const newRev = await response.json()
             setReviews([newRev, ...reviews]) // Thêm review mới lên đầu
             setNewComment("") // Xóa trắng ô nhập
             // Cập nhật lại rating của product
             setProduct({...product, review_count: product.review_count + 1})
             alert("Cảm ơn bạn đã đánh giá!")
         } else {
             const err = await response.json()
             alert(err.error || "Có lỗi xảy ra")
         }
     } finally {
         setIsSubmittingReview(false)
     }
  }
  if (loading) return <div className="p-20 text-center text-slate-500">Đang tải...</div>
  if (!product) return null

  // Helper để map tình trạng
  const conditionMap = {
    '99': 'Như mới (99%)',
    '95': 'Tốt (95%)',
    '90': 'Khá (90%)',
    'parts': 'Xác máy / Cần sửa chữa'
  };

  // Helper để map danh mục
  const categoryMap = {
    'phone': 'Điện thoại / Máy tính bảng',
    'laptop': 'Laptop / Máy tính xách tay',
    'pc': 'PC & Linh kiện máy tính'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans space-y-12">
      
      {/* PHẦN 1: HÌNH ẢNH & GIÁ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl border bg-white overflow-hidden flex items-center justify-center p-4 shadow-sm">
          <img src={mainImage} alt={product.title} className="max-w-full max-h-full object-contain" />
        </div>

        <div className="flex flex-col">
          <Badge className="w-fit mb-3 bg-slate-100 text-slate-700 capitalize">
            {categoryMap[product.category] || product.category}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <Badge variant="outline" className="text-[#f59e0b] border-[#f59e0b] bg-amber-50">
              <ShieldCheck size={16} className="mr-1"/> 
              {conditionMap[product.condition] || "Đã qua sử dụng"}
            </Badge>
          </div>

          <div className="bg-slate-50 border rounded-2xl p-6 mb-8">
            <div className="text-3xl font-extrabold text-[#d70018]">
              {Number(product.price).toLocaleString('vi-VN')} ₫
            </div>
            {product.original_new_price && (
              <div className="text-sm font-medium text-slate-500 line-through mt-1">
                Giá gốc mua mới: {Number(product.original_new_price).toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-auto">
            <Button 
  size="lg" 
  variant="outline" 
  className="flex-1 h-14 border-2"
  onClick={handleAddToCart} 
  disabled={isAddingToCart}
>
  {isAddingToCart ? "Đang xử lý..." : "Thêm Giỏ Hàng"}
</Button>
            <Button onClick={handleBuyNow} disabled={isAddingToCart} size="lg" className="flex-1 h-14 bg-[#d70018] hover:bg-red-700 text-white font-bold">Mua Ngay</Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* PHẦN 2: THÔNG SỐ & SHOP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-black uppercase">Mô tả sản phẩm</h3>
          <div className="bg-white p-6 rounded-2xl border text-slate-600 whitespace-pre-wrap leading-relaxed">
            {product.description || "Người bán chưa cung cấp mô tả chi tiết."}
          </div>

          {/* THÔNG TIN SHOP ĐÃ CẬP NHẬT DỮ LIỆU THẬT */}
          <h3 className="text-xl font-black uppercase pt-6">Thông tin người bán</h3>
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border"><AvatarFallback>{product.shop_info?.name?.charAt(0) || "S"}</AvatarFallback></Avatar>
                <div>
                  <h4 className="font-bold text-lg text-slate-900">{product.shop_info?.name || "Người dùng ẩn danh"}</h4>
                  <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-slate-500 flex items-center gap-1"><Store size={14}/> Tham gia: {product.shop_info?.joined_date}</p>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                         <Star size={12} className="fill-current mr-1"/>
                         {product.average_rating} ({product.review_count} đánh giá)
                      </Badge>
                  </div>
                </div>
              </div>
             {product.shop_info?.id ? (
  <Link to={`/shop/view/${product.shop_info.id}`}>
     <Button variant="outline" className="rounded-full">Xem Shop</Button>
  </Link>
) : (
  <Button variant="outline" disabled className="rounded-full">Chưa có Shop</Button>
)}
              
            </CardContent>
          </Card>
        </div>

        {/* BẢNG THÔNG SỐ ĐÃ ĐƯỢC FIX CỨNG ĐỂ ẨN ID/IMAGE */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase">Thông số chi tiết</h3>
          <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableBody>
                {/* 1. HIỂN THỊ NGÀY THÁNG TĨNH */}
  {product.created_at && (
    <TableRow className="hover:bg-slate-50 border-b">
      <TableCell className="font-medium text-slate-500 bg-slate-50/50 w-1/2">Ngày đăng</TableCell>
      <TableCell className="font-bold text-slate-800">
        {new Date(product.created_at).toLocaleDateString('vi-VN')}
      </TableCell>
    </TableRow>
  )}
  
  {product.purchase_date && (
    <TableRow className="hover:bg-slate-50 border-b">
      <TableCell className="font-medium text-slate-500 bg-slate-50/50">Ngày mua ban đầu</TableCell>
      <TableCell className="font-bold text-slate-800">{product.purchase_date}</TableCell>
    </TableRow>
  )}

  {/* 2. QUÉT TỰ ĐỘNG CÁC THÔNG SỐ CÒN LẠI (ĐÃ LỌC SẠCH RÁC) */}
  {(() => {
    // Gom tất cả dữ liệu (cả vòng ngoài lẫn trong specs) vào một cục để xử lý chung
    const allSpecs = { ...product, ...(product.specs || {}) };
    
    // DANH SÁCH ĐEN: Tuyệt đối KHÔNG hiển thị những từ khóa này vào bảng
    const blockedKeys = [
      'id', 'category', 'originalNewPrice', 'original_new_price', 
      'price', 'conditionText', 'condition', 'image', 'images', 
      'title', 'description', 'seller', 'created_at', 'updated_at', 
      'video_proof', 'is_active', 'specs', 'purchase_date'
    ];

    // TỪ ĐIỂN DỊCH: Ép các key tiếng Anh phổ biến thành tiếng Việt
    const specLabels = {
      brand: "Thương hiệu",
      cpu: "Vi xử lý (CPU)",
      ram: "Dung lượng RAM",
      mainMem: "Bộ nhớ lưu trữ",
      size: "Kích thước màn hình",
      refreshRate: "Tần số quét",
      resolution: "Độ phân giải",
      gpu: "Card đồ họa",
      type: "Loại thiết bị"
    };

    // Bắt đầu quét và in ra bảng
    return Object.entries(allSpecs).map(([key, value]) => {
      // BỎ QUA nếu: nằm trong danh sách đen, giá trị rỗng, hoặc là một object/array phức tạp
      if (blockedKeys.includes(key) || !value || typeof value === 'object') return null;
      
      // Lấy tên tiếng Việt (nếu có trong từ điển), không thì giữ nguyên tên gốc
      const displayLabel = specLabels[key] || key;
      
      return (
        <TableRow key={key} className="hover:bg-slate-50 border-b">
          <TableCell className="font-medium text-slate-500 bg-slate-50/50 w-1/2">
            {displayLabel}
          </TableCell>
          <TableCell className="font-bold text-slate-800">{value}</TableCell>
        </TableRow>
      );
    });
  })()}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Separator />

      {/* PHẦN 3: BÌNH LUẬN & ĐÁNH GIÁ ĐÃ CÓ DATA THẬT */}
      <div className="space-y-6 max-w-3xl">
        <h3 className="text-xl font-black uppercase flex items-center gap-2">
          <MessageSquare size={24} /> Hỏi đáp & Đánh giá ({product.review_count})
        </h3>
        
        {/* Khung nhập bình luận */}
        <div className="flex gap-4 items-start">
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            {/* Chỗ chọn Sao */}
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setNewRating(star)} className={star <= newRating ? "text-yellow-400" : "text-slate-300"}>
                        <Star size={24} className={star <= newRating ? "fill-current" : ""} />
                    </button>
                ))}
            </div>

            <Textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm hoặc đặt câu hỏi về sản phẩm này..." 
              className="resize-none rounded-xl bg-white focus-visible:ring-red-500" 
              rows={3}
            />
            <Button onClick={handleSubmitReview} disabled={isSubmittingReview || !newComment.trim()} className="bg-slate-900 hover:bg-slate-800">
                {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </div>

        {/* Danh sách bình luận THẬT */}
        <div className="pt-6 space-y-6">
          {reviews.length === 0 ? (
             <p className="text-center text-slate-500 py-10">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          ) : (
             reviews.map((rev) => (
               <div key={rev.id} className="flex gap-4">
                 <Avatar className="h-10 w-10">
                   <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">{rev.user_name.substring(0,2).toUpperCase()}</AvatarFallback>
                 </Avatar>
                 <div className="bg-white border rounded-2xl rounded-tl-none p-4 flex-1 shadow-sm">
                   <div className="flex items-center justify-between mb-2">
                       <p className="font-bold text-sm text-slate-900">{rev.user_name}</p>
                       <div className="flex gap-0.5 text-yellow-400">
                           {[...Array(5)].map((_, i) => (
                               <Star key={i} size={14} className={i < rev.rating ? "fill-current" : "text-slate-200"} />
                           ))}
                       </div>
                   </div>
                   <p className="text-sm text-slate-600 whitespace-pre-wrap">{rev.comment}</p>
                   <div className="text-xs text-slate-400 mt-2 font-medium">
                       {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                   </div>
                 </div>
               </div>
             ))
          )}
        </div>
      </div>
    </div>
  )
}