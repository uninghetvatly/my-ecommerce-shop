import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Store, Layers3, ClipboardList, TrendingUp, PackagePlus, Save, X } from "lucide-react"

export default function ShopManagementPage() {
  const [shopInfo, setShopInfo] = useState(null)
  const [shopProducts, setShopProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // STATE CHO CHỈNH SỬA SHOP
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", email: "", description: "" })
  const [shopOrders, setShopOrders] = useState([])
  
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [infoRes, productsRes, ordersRes] = await Promise.all([
          fetch('http://localhost:8000/api/users/shop/', { headers }),
          fetch('http://localhost:8000/api/products/?seller=me', { headers }),
          fetch('http://localhost:8000/api/orders/?role=seller', { headers })
        ]);

        if (infoRes.status === 401 || productsRes.status === 401) {
             window.location.href = '/login';
             return;
        }

        if (infoRes.ok) {
           const infoData = await infoRes.json();
           setShopInfo(infoData);
           setEditForm({ name: infoData.name, email: infoData.email, description: infoData.description });
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setShopProducts(productsData); 
        }
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setShopOrders(ordersData);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu shop:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopData()
  }, [])

  // HÀM XỬ LÝ LƯU THÔNG TIN SHOP
  const handleSaveShopInfo = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/users/shop/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        alert("Cập nhật thông tin shop thành công!");
        setShopInfo({ ...shopInfo, ...editForm }); // Cập nhật UI ngay lập tức
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Lỗi cập nhật shop:", error);
    }
  }

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:8000/api/orders/${orderId}/?role=seller`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            // Cập nhật lại list đơn hàng trực tiếp trên UI
            setShopOrders(shopOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } else {
            alert("Lỗi khi cập nhật trạng thái!");
        }
    } catch (error) {
        console.error(error);
    }
};
  return (
    <div className="container mx-auto px-4 py-10 font-sans max-w-7xl">
      <div className="flex items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="bg-red-50 text-[#d70018] p-3.5 rounded-2xl border border-red-100">
                <Store size={28}/>
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-950 tracking-tighter uppercase">Quản Lý Shop Của Tôi</h1>
                <p className="text-sm text-slate-500">Chào mừng trở lại, {shopInfo?.name || "Đang tải..."}</p>
            </div>
        </div>
        <Link to="/sell">
            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 rounded-xl h-12 px-6 shadow-lg shadow-green-100">
                <PackagePlus size={19} />
                Đăng Sản Phẩm Mới
            </Button>
        </Link>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 h-auto grid grid-cols-2 md:grid-cols-4 shadow-inner">
          <TabsTrigger value="info" className="rounded-xl gap-2 h-12 data-[state=active]:bg-red-50 data-[state=active]:text-[#d70018] font-semibold text-slate-600">
            <Store size={17}/> Thông tin Shop
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl gap-2 h-12 data-[state=active]:bg-red-50 data-[state=active]:text-[#d70018] font-semibold text-slate-600">
            <Layers3 size={17}/> Kho Sản phẩm
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl gap-2 h-12 data-[state=active]:bg-red-50 data-[state=active]:text-[#d70018] font-semibold text-slate-600">
            <ClipboardList size={17}/> Đơn hàng
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-xl gap-2 h-12 data-[state=active]:bg-red-50 data-[state=active]:text-[#d70018] font-semibold text-slate-600">
            <TrendingUp size={17}/> Thống kê & Tài chính
          </TabsTrigger>
        </TabsList>

        {/* TAB THÔNG TIN SHOP CÓ CHỨC NĂNG CHỈNH SỬA */}
        <TabsContent value="info">
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Hồ Sơ Cửa Hàng</CardTitle>
                  <CardDescription>Quản lý tên hiển thị và thông tin liên hệ của shop.</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>Chỉnh sửa hồ sơ</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}><X size={16} className="mr-2"/> Hủy</Button>
                    <Button className="bg-[#d70018] hover:bg-red-700" onClick={handleSaveShopInfo}><Save size={16} className="mr-2"/> Lưu lại</Button>
                  </div>
                )}
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label>Tên Cửa Hàng</Label>
                <Input 
                  disabled={!isEditing} 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  className={!isEditing ? "bg-slate-50 border-transparent text-slate-900 font-semibold" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Liên Hệ</Label>
                <Input 
                  disabled={!isEditing} 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                  className={!isEditing ? "bg-slate-50 border-transparent text-slate-900" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Mô Tả Shop</Label>
                <Textarea 
                  disabled={!isEditing} 
                  rows={4}
                  value={editForm.description} 
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})} 
                  className={!isEditing ? "bg-slate-50 border-transparent text-slate-900 resize-none" : "resize-none"}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
                <CardTitle>Kho Sản Phẩm Hiện Có</CardTitle>
                <CardDescription>Danh sách tất cả sản phẩm shop đang đăng bán lên sàn.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
                ) : (
                    <Table className="border rounded-lg">
                        <Table className="border rounded-lg">
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-16">Ảnh</TableHead>
                                <TableHead>Tên sản phẩm</TableHead>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Tình trạng</TableHead>
                                <TableHead className="text-right">Giá bán</TableHead>
                                {/* THÊM CỘT THAO TÁC Ở ĐÂY */}
                                <TableHead className="text-center w-28">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shopProducts.map((p) => {
                                const conditionDisplay = p.condition === "99" ? "Như mới 99%" : 
                                                         p.condition === "95" ? "Tốt 95%" : 
                                                         p.condition === "90" ? "Khá 90%" : "Xác máy";
                                
                                const imageUrl = p.images && p.images.length > 0 
                                    ? (p.images[0].image.startsWith('http') 
                                        ? p.images[0].image 
                                        : `http://localhost:8000${p.images[0].image}`)
                                    : "https://via.placeholder.com/150?text=No+Image";

                                return (
                                <TableRow key={p.id}>
                                    <TableCell><img src={imageUrl} className="w-10 h-10 object-cover rounded border bg-white" /></TableCell>
                                    <TableCell className="font-medium text-slate-800 line-clamp-2 mt-2">{p.title}</TableCell>
                                    <TableCell><Badge variant="outline" className="capitalize">{p.category}</Badge></TableCell>
                                    <TableCell><span className="text-xs font-medium text-slate-600">{conditionDisplay}</span></TableCell>
                                    <TableCell className="text-right font-bold text-[#d70018]">{Number(p.price).toLocaleString('vi-VN')}₫</TableCell>
                                    
                                    {/* THÊM NÚT CHỈNH SỬA Ở ĐÂY */}
                                    <TableCell className="text-center">
                                        <Link to={`/edit-product/${p.id}`}>
                                            <Button variant="outline" size="sm" className="h-8 text-xs bg-slate-50 hover:bg-slate-100 hover:text-blue-600 border-slate-200">
                                                Sửa
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    </Table>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... Orders and Stats tabs remain the same (still using MOCK_SHOP for now) ... */}
       <TabsContent value="orders">
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
                <CardTitle>Quản Lý Đơn Hàng</CardTitle>
                <CardDescription>Xử lý các đơn hàng khách đã đặt mua sản phẩm của bạn.</CardDescription>
            </CardHeader>
            <CardContent>
                {shopOrders.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border">
                        Shop của bạn chưa có đơn hàng nào.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {shopOrders.map(order => (
                            <div key={order.id} className="border rounded-xl p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
                                
                                {/* CỘT TRÁI: Thông tin chung & Sản phẩm */}
                                <div className="space-y-4 flex-1 w-full">
                                    <div className="flex items-center gap-3 border-b pb-3">
                                        <h3 className="font-bold text-lg text-slate-900">Đơn #{order.id}</h3>
                                        {/* Badge trạng thái */}
                                        <Badge className={
                                            order.status === 'pending' ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200" :
                                            order.status === 'confirmed' ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" :
                                            order.status === 'shipped' ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200" :
                                            order.status === 'completed' ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : 
                                            "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                                        }>
                                            {order.status === 'pending' ? 'Chờ xác nhận' :
                                             order.status === 'confirmed' ? 'Đã xác nhận' :
                                             order.status === 'shipped' ? 'Đang giao' :
                                             order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                        </Badge>
                                        <span className="text-sm text-slate-400 ml-auto">
                                            {new Date(order.created_at).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-slate-500 mb-1">Khách hàng</p>
                                            <p className="font-semibold text-slate-900">{order.buyer}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 mb-1">Số điện thoại</p>
                                            <p className="font-semibold text-slate-900">{order.phone_number}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-slate-500 mb-1">Địa chỉ giao hàng</p>
                                            <p className="font-semibold text-slate-900">{order.shipping_address}</p>
                                        </div>
                                    </div>

                                    {/* Danh sách SP */}
                                    <div className="space-y-3 mt-4">
                                        <p className="font-semibold text-slate-700 text-sm">Sản phẩm khách đặt:</p>
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex gap-4 text-sm items-center bg-white border border-slate-100 p-3 rounded-lg">
                                                <div className="w-12 h-12 bg-slate-50 rounded border flex items-center justify-center p-1 shrink-0">
                                                    <img 
                                                        src={item.product.images?.length > 0 ? (item.product.images[0].image.startsWith('http') ? item.product.images[0].image : `http://localhost:8000${item.product.images[0].image}`) : "https://via.placeholder.com/150"} 
                                                        alt={item.product.title} 
                                                        className="max-w-full max-h-full object-contain mix-blend-multiply" 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-medium text-slate-800 line-clamp-1">{item.product.title}</span>
                                                    <span className="text-slate-500 text-xs">Phân loại: {item.product.category}</span>
                                                </div>
                                                <span className="text-slate-500 font-medium">x{item.quantity}</span>
                                                <span className="font-bold text-[#d70018] w-24 text-right">{Number(item.price).toLocaleString('vi-VN')}₫</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CỘT PHẢI: Hành động của Shop */}
                                <div className="w-full md:w-56 space-y-3 shrink-0 bg-slate-50 p-4 rounded-xl border">
                                    <div className="text-center mb-4 border-b pb-4">
                                        <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Tổng thu (Dự kiến)</p>
                                        <p className="font-black text-2xl text-[#d70018]">{Number(order.total_price).toLocaleString('vi-VN')}₫</p>
                                        <Badge variant="outline" className="mt-2 bg-white text-slate-600 border-slate-200">{order.payment_display}</Badge>
                                    </div>

                                    {/* Hiển thị nút bấm tùy theo trạng thái */}
                                    {order.status === 'pending' && (
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200" onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}>Xác nhận đơn</Button>
                                    )}
                                    {order.status === 'confirmed' && (
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200" onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}>Giao cho ĐVVC</Button>
                                    )}
                                    {order.status === 'shipped' && (
                                        <Button className="w-full bg-green-600 hover:bg-green-700 shadow-md shadow-green-200" onClick={() => handleUpdateOrderStatus(order.id, 'completed')}>Hoàn thành đơn</Button>
                                    )}
                                    
                                    {/* Nút Hủy (Chỉ hiện khi đơn chưa giao/chưa hoàn thành/chưa hủy) */}
                                    {['pending', 'confirmed'].includes(order.status) && (
                                        <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => {
                                            if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) handleUpdateOrderStatus(order.id, 'cancelled');
                                        }}>Từ chối / Hủy đơn</Button>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
            <Card className="rounded-2xl border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle>Thống kê & Tài chính</CardTitle>
                    <CardDescription>Báo cáo doanh thu và các chỉ số hoạt động của shop.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-50 rounded-xl border p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                        <TrendingUp size={40} className="text-slate-300" />
                        <p>Tính năng thống kê đang được phát triển.</p>
                        <p className="text-sm">Vui lòng quay lại sau nhé!</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}