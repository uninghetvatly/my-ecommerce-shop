import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { UserPlus } from "lucide-react"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  // State lưu trữ toàn bộ dữ liệu form
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    phone: "",
    gender: "",
    dob: "",
    address: ""
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleGenderChange = (value) => {
    setFormData({ ...formData, gender: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Gọi API đăng ký (Chúng ta sẽ viết API này ở Backend sau)
      const response = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert("🎉 Đăng ký tài khoản thành công! Chào mừng bạn.")
        navigate('/profile') // Chuyển hướng về trang cá nhân
      } else {
        const errorData = await response.json()
        alert(`Lỗi: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error)
      alert("Không thể kết nối đến server.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-sans">
      <Card className="w-full max-w-2xl bg-white shadow-xl border-slate-100 rounded-3xl overflow-hidden">
        <div className="bg-[#d70018] h-3 w-full"></div>
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={32} className="text-[#d70018]" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900">Tạo Tài Khoản Mới</CardTitle>
          <CardDescription className="text-base text-slate-500">
            Tham gia cộng đồng mua bán đồ công nghệ ngay hôm nay
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* PHẦN 1: TÀI KHOẢN ĐĂNG NHẬP */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Thông tin đăng nhập</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập (Username) *</Label>
                  <Input id="username" name="username" required value={formData.username} onChange={handleChange} placeholder="VD: nguyenvan_a" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="Tối thiểu 6 ký tự" className="bg-slate-50" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Địa chỉ Email *</Label>
                  <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="VD: email@example.com" className="bg-slate-50" />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* PHẦN 2: THÔNG TIN CÁ NHÂN */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Thông tin cá nhân (Hồ sơ)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="full_name">Họ và Tên</Label>
                  <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="VD: Nguyễn Văn A" className="bg-slate-50" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="VD: 0912345678" className="bg-slate-50" />
                </div>

                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Select onValueChange={handleGenderChange}>
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Ngày sinh</Label>
                  <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} className="bg-slate-50" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Địa chỉ liên hệ</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, đường, phường/xã, quận/huyện..." className="bg-slate-50" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg font-bold bg-[#d70018] hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-200 mt-6">
              {isLoading ? "Đang xử lý..." : "Đăng Ký Tài Khoản"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-slate-50 p-6 flex justify-center border-t">
          <p className="text-slate-600 text-sm">
            Đã có tài khoản? <Link to="/login" className="text-[#d70018] font-bold hover:underline">Đăng nhập ngay</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}