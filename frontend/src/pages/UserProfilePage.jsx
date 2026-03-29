import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, CalendarDays, VenetianMask } from "lucide-react"

export default function UserProfilePage() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. Mở két sắt (localStorage) lấy cái chìa khóa (Token) ra
        const token = localStorage.getItem('access_token');

        // 2. Gửi request lên Backend, nhớ kẹp cái chìa khóa vào Header
        const response = await fetch('http://localhost:8000/api/users/profile/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}` // Chú ý: dùng dấu backtick (`) để truyền biến
          }
        });

        // 3. Nếu bảo vệ (Backend) báo 401 Unauthorized (Không được phép)
        if (response.status === 401) {
          alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
          window.location.href = '/login'; // Đá văng ra trang Đăng nhập
          return; // Dừng hàm lại, không chạy xuống dưới nữa
        }

        // 4. Nếu thẻ hợp lệ, lấy dữ liệu ra dùng bình thường
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Lỗi tải profile:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);
  const InfoField = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
      <div className="bg-white p-3 rounded-full text-slate-500 border border-slate-100 shadow">
        {icon}
      </div>
      <div className="flex-1 space-y-0.5">
        <Label className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</Label>
        <p className="text-base font-semibold text-slate-900">{value || "Chưa cập nhật"}</p>
      </div>
    </div>
  )

  if (loading) return <div className="p-20 text-center font-bold text-slate-500">Đang tải hồ sơ...</div>
  if (!userData) return <div className="p-20 text-center text-red-500">Không thể tải thông tin cá nhân.</div>

  return (
    <div className="container mx-auto px-4 py-10 font-sans max-w-4xl">
      <Card className="border-slate-100 rounded-3xl shadow-xl overflow-hidden bg-white relative">
        <div className="h-32 bg-red-50 border-b border-slate-100"></div>
        <CardContent className="p-8 pt-0 relative">
          
          <div className="flex flex-col md:flex-row items-center gap-6 -mt-16 mb-8 text-center md:text-left">
            <img 
              src={userData.avatar}
              alt={userData.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-2xl bg-white object-cover"
            />
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tighter">
                {userData.name}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Thành viên từ: {userData.joinedDate ? new Date(userData.joinedDate).toLocaleDateString('vi-VN') : 'Không rõ'}
              </p>
            </div>
          </div>

          <Separator className="my-8 bg-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField icon={<User size={20}/>} label="Họ và Tên" value={userData.name} />
            <InfoField icon={<VenetianMask size={20}/>} label="Giới tính" value={userData.gender} />
            <InfoField icon={<CalendarDays size={20}/>} label="Ngày sinh" value={userData.dob ? new Date(userData.dob).toLocaleDateString('vi-VN') : null} />
            <InfoField icon={<Phone size={20}/>} label="Số điện thoại" value={userData.phone} />
            <div className="md:col-span-2">
              <InfoField icon={<Mail size={20}/>} label="Địa chỉ Email" value={userData.email} />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}