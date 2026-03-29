import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PRODUCT_DATABASE } from "@/lib/mockDatabase"
import { Camera, Video, DollarSign, Info, Loader2 } from "lucide-react"

// ============================================================================
// FIX LỖI 1: DI CHUYỂN COMPONENT CON RA NGOÀI ĐỂ KHÔNG BỊ VĂNG CON TRỎ KHI GÕ
// ============================================================================
const SpecInput = ({ label, field, value, onChange }) => (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <Input 
        value={value || ""} 
        onChange={(e) => onChange(field, e.target.value)} 
        className="mt-1 bg-white" 
      />
    </div>
)

// THÊM: NHẬN productId TỪ TRANG CHA (ProductPostPage)
export default function ProductInput({ productId }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  // State để biết đang ở chế độ thêm mới hay sửa
  const isEditing = !!productId; 

  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  
  const [specs, setSpecs] = useState({
    brand: "", cpu: "", ram: "", mainMem: "", size: "", refreshRate: "", resolution: "", gpu: "", type: ""
  })

  const [history, setHistory] = useState({
    condition: "", purchaseDate: "", purchaseOrigin: "", description: ""
  })

  const [media, setMedia] = useState({ images: [], video: null })

  // ============================================================================
  // FIX LỖI 2: TỰ ĐỘNG LẤY DỮ LIỆU CŨ NẾU LÀ CHẾ ĐỘ CHỈNH SỬA
  // ============================================================================
  useEffect(() => {
    if (isEditing) {
      const fetchProductDetails = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/products/${productId}/`);
          if (response.ok) {
            const data = await response.json();
            
            // Đổ dữ liệu cũ vào form
            setTitle(data.title);
            setCategory(data.category);
            setPrice(data.price);
            
            // Điền thông số
            if (data.specs) {
               setSpecs(prev => ({ ...prev, ...data.specs }));
            }
            
            // Điền lịch sử & mô tả
            setHistory({
               condition: data.condition,
               purchaseDate: data.purchase_date || "",
               description: data.description || "",
               purchaseOrigin: ""
            });

          } else {
             alert("Không tìm thấy sản phẩm để sửa!");
             navigate('/shop/manage');
          }
        } catch (error) {
          console.error("Lỗi lấy dữ liệu sửa:", error);
        }
      };

      fetchProductDetails();
    }
  }, [productId, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title || !category || !price || !history.condition) {
      alert("Vui lòng điền đầy đủ các thông tin có dấu *")
      return
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("Bạn cần đăng nhập để thực hiện thao tác này!");
      navigate('/login'); 
      return;
    }

    setLoading(true)
    const formData = new FormData()

    formData.append('title', title)
    formData.append('category', category)
    formData.append('price', price)
    formData.append('specs', JSON.stringify(specs))
    formData.append('condition', history.condition)
    formData.append('description', history.description || "")
    
    if (history.purchaseDate) {
      let formattedDate = history.purchaseDate;
      if (formattedDate.length === 7) { 
        formattedDate += "-01";
      }
      formattedDate = formattedDate.replace(/\.$/, ""); 
      formData.append('purchase_date', formattedDate);
    } 

    if (media.video) {
      formData.append('video_proof', media.video)
    }
    
    if (media.images && media.images.length > 0) {
      Array.from(media.images).forEach((file) => {
        formData.append('uploaded_images', file) 
      })
    }

    try {
      // NẾU SỬA THÌ DÙNG PATCH VÀ GỌI VÀO URL CÓ ID, NẾU THÊM MỚI THÌ POST
      const url = isEditing 
          ? `http://localhost:8000/api/products/${productId}/` 
          : 'http://localhost:8000/api/products/';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (response.status === 401) {
          alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
          navigate('/login');
          return;
      }

      if (response.ok) {
        alert(isEditing ? "🎉 Cập nhật sản phẩm thành công!" : "🎉 Đăng sản phẩm thành công!")
        navigate('/shop/manage') 
      } else {
        const err = await response.json()
        alert("Lỗi: " + JSON.stringify(err))
      }
    } catch (error) {
      console.error("Network Error:", error)
      alert("Không thể kết nối tới Server.")
    } finally {
      setLoading(false)
    }
  }

  // Nếu đang ở chế độ sửa thì KHÔNG nên tự động gợi ý specs khi đổi tên nữa 
  // để tránh ghi đè thông số cũ của khách.
  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle) 
    
    if (!isEditing) {
        const searchString = newTitle.toLowerCase()
        const matchedKey = Object.keys(PRODUCT_DATABASE).find(key => searchString.includes(key))
        
        if (matchedKey) {
          const matchedProduct = PRODUCT_DATABASE[matchedKey]
          setCategory(matchedProduct.category)
          setSpecs({ ...matchedProduct })
        }
    }
  }

  const handleSpecChange = (field, value) => setSpecs(prev => ({ ...prev, [field]: value }))
  const handleHistoryChange = (field, value) => setHistory(prev => ({ ...prev, [field]: value }))

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-lg mb-20 mt-10">
      <h2 className="mb-8 text-2xl md:text-3xl font-bold text-slate-900 border-b pb-4 uppercase tracking-tight">
          {isEditing ? "Cập Nhật Sản Phẩm" : "Đăng Bán Sản Phẩm"}
      </h2>
      
      <div className="space-y-10">
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg"><Info size={20} className="text-red-600"/> 1. Thông Tin Cơ Bản</h3>
          <div>
            <label className="text-sm font-medium text-slate-700">Tên sản phẩm *</label>
            <Input placeholder="VD: iPhone 15 Pro Max..." className="mt-1" value={title} onChange={handleTitleChange} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Danh mục *</label>
            <select className="w-full mt-1 p-2.5 border border-slate-300 rounded-md bg-white text-sm outline-none focus:ring-2 focus:ring-red-500" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Chọn danh mục...</option>
              <option value="phone">Điện thoại / Máy tính bảng</option>
              <option value="laptop">Laptop / Máy tính xách tay</option>
              <option value="pc">PC & Linh kiện máy tính</option>
            </select>
          </div>
        </section>

        {category && (
          <section className="p-5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">2. Thông Số Kỹ Thuật</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {category === "phone" && (
                <>
                  <SpecInput label="Thương hiệu" field="brand" value={specs.brand} onChange={handleSpecChange} />
                  <SpecInput label="CPU / Chipset" field="cpu" value={specs.cpu} onChange={handleSpecChange} />
                  <SpecInput label="Dung lượng RAM" field="ram" value={specs.ram} onChange={handleSpecChange} />
                  <SpecInput label="Bộ nhớ trong" field="mainMem" value={specs.mainMem} onChange={handleSpecChange} />
                  <SpecInput label="Màn hình" field="size" value={specs.size} onChange={handleSpecChange} />
                  <SpecInput label="Tần số quét" field="refreshRate" value={specs.refreshRate} onChange={handleSpecChange} />
                </>
              )}
              {category === "laptop" && (
                <>
                  <SpecInput label="Thương hiệu" field="brand" value={specs.brand} onChange={handleSpecChange} />
                  <SpecInput label="CPU" field="cpu" value={specs.cpu} onChange={handleSpecChange} />
                  <SpecInput label="VGA" field="gpu" value={specs.gpu} onChange={handleSpecChange} />
                  <SpecInput label="RAM" field="ram" value={specs.ram} onChange={handleSpecChange} />
                  <SpecInput label="Ổ cứng" field="mainMem" value={specs.mainMem} onChange={handleSpecChange} />
                  <SpecInput label="Màn hình" field="size" value={specs.size} onChange={handleSpecChange} />
                </>
              )}
              {category === "pc" && (
                <>
                  <div className="col-span-2 md:col-span-3">
                    <label className="text-xs font-medium text-slate-600">Loại linh kiện</label>
                    <select className="w-full mt-1 p-2 border border-slate-300 rounded-md bg-white text-sm" value={specs.type} onChange={(e) => handleSpecChange('type', e.target.value)}>
                      <option value="">Chọn loại...</option>
                      <option value="GPU">Card màn hình</option>
                      <option value="CPU">Vi xử lý</option>
                      <option value="RAM">RAM</option>
                      <option value="SSD">Ổ cứng</option>
                    </select>
                  </div>
                  <SpecInput label="Thương hiệu" field="brand" value={specs.brand} onChange={handleSpecChange} />
                </>
              )}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">3. Tình Trạng & Lịch Sử</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Tình trạng ngoại quan *</label>
              <select className="w-full mt-1 p-2.5 border border-slate-300 rounded-md text-sm outline-none focus:border-red-500" value={history.condition} onChange={(e) => handleHistoryChange('condition', e.target.value)}>
                <option value="">Chọn tình trạng...</option>
                <option value="99">Như mới (99%)</option>
                <option value="95">Tốt (95%)</option>
                <option value="90">Khá (90%)</option>
                <option value="parts">Xác máy</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Thời gian mua mới (Dự kiến)</label>
              <Input 
                type="date" 
                className="mt-1" 
                value={history.purchaseDate} 
                onChange={(e) => handleHistoryChange('purchaseDate', e.target.value)} 
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mô tả chi tiết</label>
            <textarea rows="3" value={history.description} className="w-full mt-1 p-3 border border-slate-300 rounded-md text-sm outline-none focus:border-red-500" onChange={(e) => handleHistoryChange('description', e.target.value)} />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">4. Hình Ảnh & Video Xác Thực</h3>
          {isEditing && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                 Lưu ý: Nếu bạn tải lên ảnh/video mới, hệ thống sẽ thêm vào danh sách ảnh hiện tại.
              </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-xl p-8 hover:bg-slate-100 cursor-pointer transition">
              <Camera className="text-slate-400 mb-3" size={32} />
              <span className="text-sm font-medium text-slate-700 text-center">Tải ảnh sản phẩm</span>
              <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => setMedia({...media, images: e.target.files})} />
            </label>
            
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-red-300 bg-red-50/30 rounded-xl p-8 hover:bg-red-50 cursor-pointer transition">
              <Video className="text-red-500 mb-3" size={32} />
              <span className="text-sm font-medium text-red-700 text-center">Video hoạt động</span>
              <input type="file" className="hidden" accept="video/*" onChange={(e) => setMedia({...media, video: e.target.files[0]})} />
            </label>
          </div>
        </section>

        <section className="space-y-4 pt-8 border-t border-slate-200">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg"><DollarSign size={20} className="text-green-600"/> 5. Định Giá Bán</h3>
          <div className="relative max-w-[300px]">
            <span className="absolute right-4 top-3.5 text-slate-500 font-bold">VNĐ</span>
            <Input 
              type="number" 
              className="pl-4 pr-12 py-7 text-2xl font-bold border-2 border-slate-400 focus-visible:ring-red-500" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </section>

        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full py-7 text-lg md:text-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all rounded-xl shadow-lg"
        >
          {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang lưu...</> : (isEditing ? "Cập Nhật Thông Tin" : "Đăng Bán Lên Chợ")}
        </Button>
      </div>
    </div>
  )
}