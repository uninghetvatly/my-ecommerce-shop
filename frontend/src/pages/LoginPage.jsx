import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Gọi API lấy Token của JWT
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        // Lưu chìa khóa (Token) vào bộ nhớ trình duyệt
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        
        alert("Đăng nhập thành công!")
        window.location.href = "/" // Dùng window.location để nó load lại Navbar
      } else {
        setError("Sai tên đăng nhập hoặc mật khẩu!")
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-[#d70018] h-2 w-full"></div>
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl font-black text-slate-900">Đăng Nhập</CardTitle>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tên đăng nhập</Label>
              <Input required onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input type="password" required onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <Button type="submit" className="w-full bg-[#d70018] hover:bg-red-700 text-white font-bold h-12">
              Đăng Nhập
            </Button>
            <p className="text-center text-sm mt-4 text-slate-600">
              Chưa có tài khoản? <Link to="/register" className="text-[#d70018] font-bold">Đăng ký</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}