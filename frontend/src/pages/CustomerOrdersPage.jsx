import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, ShoppingBag, ArrowRight, Package, Truck, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function CustomerOrdersPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cart");

  // State cho Form Đặt Hàng
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
      shipping_address: "",
      phone_number: "",
      payment_method: "cod"
  });

  useEffect(() => {
    fetchCartAndOrders();
  }, []);

  const fetchCartAndOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setCartItems([]);
        setOrders([]);
        setLoading(false);
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      // Gọi song song 2 API: Giỏ hàng và Đơn hàng (vai trò buyer)
      const [cartRes, orderRes] = await Promise.all([
          fetch('http://localhost:8000/api/cart/', { headers }),
          fetch('http://localhost:8000/api/orders/?role=buyer', { headers })
      ]);
      
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCartItems(cartData.items || []);
      }
      
      if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/cart/remove/${itemId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
    }
  };

  // ==========================================
  // HÀM CHỐT ĐƠN HÀNG (CHECKOUT)
  // ==========================================
  const handlePlaceOrder = async () => {
      if (!checkoutForm.shipping_address || !checkoutForm.phone_number) {
          alert("Vui lòng điền đầy đủ địa chỉ và số điện thoại nhận hàng!");
          return;
      }

      try {
          const token = localStorage.getItem('access_token');
          const response = await fetch('http://localhost:8000/api/orders/', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(checkoutForm)
          });

          if (response.ok) {
              alert("🎉 Đặt hàng thành công!");
              setShowCheckout(false);
              fetchCartAndOrders(); // Gọi lại để clear giỏ hàng và load đơn hàng mới
              setActiveTab("orders"); // Chuyển sang tab đơn hàng
          } else {
              const err = await response.json();
              alert(err.error || "Có lỗi xảy ra khi đặt hàng.");
          }
      } catch (error) {
          console.error("Lỗi đặt hàng:", error);
      }
  };

  // ==========================================
  // HÀM HỦY ĐƠN HÀNG
  // ==========================================
  const handleCancelOrder = async (orderId) => {
      if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;

      try {
          const token = localStorage.getItem('access_token');
          const response = await fetch(`http://localhost:8000/api/orders/${orderId}/?role=buyer`, {
              method: 'PATCH',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'cancelled' })
          });

          if (response.ok) {
              alert("Đã hủy đơn hàng thành công.");
              fetchCartAndOrders(); // Load lại danh sách đơn
          } else {
              const err = await response.json();
              alert(err.error || "Không thể hủy đơn hàng này.");
          }
      } catch (error) {
          console.error("Lỗi hủy đơn:", error);
      }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Helper vẽ Timeline
  const renderTimeline = (status) => {
      const steps = [
          { id: 'pending', label: 'Chờ xác nhận', icon: Clock },
          { id: 'confirmed', label: 'Đã xác nhận', icon: Package },
          { id: 'shipped', label: 'Đang giao', icon: Truck },
          { id: 'completed', label: 'Hoàn thành', icon: CheckCircle2 }
      ];

      if (status === 'cancelled') {
          return (
              <div className="flex items-center gap-2 text-red-500 font-bold bg-red-50 p-3 rounded-xl w-fit mt-4">
                  <XCircle size={20} /> Đơn hàng đã bị hủy
              </div>
          );
      }

      const currentIndex = steps.findIndex(s => s.id === status);

      return (
          <div className="flex items-center justify-between w-full mt-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full md:before:h-0.5 before:w-0.5 md:before:w-full before:bg-slate-200 before:top-1/2 before:-translate-y-1/2">
              {steps.map((step, index) => {
                  const isActive = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const Icon = step.icon;
                  return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-[#d70018] border-[#d70018] text-white' : 'bg-white border-slate-300 text-slate-400'} ${isCurrent ? 'ring-4 ring-red-100' : ''}`}>
                              <Icon size={20} />
                          </div>
                          <span className={`text-xs font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</span>
                      </div>
                  )
              })}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl border shadow-sm h-14 flex w-full max-w-md mx-auto">
            <TabsTrigger value="cart" className="flex-1 rounded-lg text-base font-bold data-[state=active]:bg-[#d70018] data-[state=active]:text-white">
              Giỏ Hàng ({cartItems.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 rounded-lg text-base font-bold data-[state=active]:bg-[#d70018] data-[state=active]:text-white">
              Đơn Mua Của Tôi ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: GIỎ HÀNG */}
          <TabsContent value="cart">
            {loading ? (
              <div className="text-center py-20 text-slate-500">Đang tải giỏ hàng...</div>
            ) : cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
                <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Giỏ hàng của bạn đang trống</h3>
                <Link to="/"><Button className="bg-[#d70018] hover:bg-red-700 font-bold px-8 mt-4">Khám phá ngay</Button></Link>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
                <div className="flex-1 space-y-4">
                  {cartItems.map((item) => {
                    const prod = item.product;
                    let imageUrl = "https://via.placeholder.com/150";
                    if (prod.images && prod.images.length > 0) {
                      imageUrl = prod.images[0].image.startsWith('http') ? prod.images[0].image : `http://localhost:8000${prod.images[0].image}`;
                    }
                    return (
                      <div key={item.id} className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 relative">
                        <div className="w-24 h-24 bg-slate-50 rounded-xl border flex items-center justify-center p-2 flex-shrink-0">
                          <img src={imageUrl} alt={prod.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-1 text-xs text-slate-500">{prod.category}</Badge>
                          <h3 className="font-bold text-slate-900 line-clamp-2 pr-8">{prod.title}</h3>
                          <div className="text-[#d70018] font-black mt-2">
                            {Number(prod.price).toLocaleString('vi-VN')}₫
                            <span className="text-sm font-medium text-slate-500 ml-2 font-normal">x {item.quantity}</span>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)} className="absolute right-4 top-4 text-slate-300 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                      </div>
                    )
                  })}
                </div>

                {/* CỘT PHẢI: TỔNG KẾT & FORM ĐẶT HÀNG */}
                <div className="w-full lg:w-[350px] flex-shrink-0">
                  <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-24">
                    <h3 className="font-black text-lg text-slate-900 mb-4">Tóm tắt đơn hàng</h3>
                    
                    <div className="space-y-3 text-sm text-slate-600 border-b pb-4 mb-4">
                      <div className="flex justify-between">
                        <span>Tổng tiền ({cartItems.length} SP)</span>
                        <span className="font-bold text-slate-900">{cartTotal.toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mb-6">
                      <span className="font-bold text-slate-900">Tổng cộng:</span>
                      <span className="text-2xl font-black text-[#d70018]">{cartTotal.toLocaleString('vi-VN')}₫</span>
                    </div>

                    {!showCheckout ? (
                        <Button onClick={() => setShowCheckout(true)} className="w-full bg-[#d70018] hover:bg-red-700 h-14 text-base font-bold shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                            Tiến hành Đặt Hàng <ArrowRight size={18} />
                        </Button>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <Label>Địa chỉ nhận hàng (*)</Label>
                                <Input value={checkoutForm.shipping_address} onChange={(e) => setCheckoutForm({...checkoutForm, shipping_address: e.target.value})} placeholder="Số nhà, đường, phường, quận..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Số điện thoại (*)</Label>
                                <Input value={checkoutForm.phone_number} onChange={(e) => setCheckoutForm({...checkoutForm, phone_number: e.target.value})} placeholder="09xx..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Phương thức thanh toán</Label>
                                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2" value={checkoutForm.payment_method} onChange={(e) => setCheckoutForm({...checkoutForm, payment_method: e.target.value})}>
                                    <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                                    <option value="banking">Chuyển khoản ngân hàng</option>
                                </select>
                            </div>
                            <Button onClick={handlePlaceOrder} className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold">Chốt Đơn Ngay!</Button>
                            <Button variant="ghost" onClick={() => setShowCheckout(false)} className="w-full text-slate-500">Hủy bỏ</Button>
                        </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </TabsContent>

          {/* TAB 2: QUẢN LÝ ĐƠN MUA */}
          <TabsContent value="orders">
            {loading ? (
                 <div className="text-center py-20 text-slate-500">Đang tải đơn hàng...</div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border shadow-sm text-slate-500">
                    Bạn chưa có đơn hàng nào.
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl border shadow-sm p-6">
                            <div className="flex justify-between items-start border-b pb-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Đơn hàng #{order.id}</h3>
                                    <p className="text-sm text-slate-500">Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-xl text-[#d70018]">{Number(order.total_price).toLocaleString('vi-VN')}₫</div>
                                    <Badge variant="outline" className="mt-1 bg-slate-50">{order.payment_display}</Badge>
                                </div>
                            </div>

                            {/* TIMELINE TRẠNG THÁI */}
                            <div className="py-4">
                                {renderTimeline(order.status)}
                            </div>

                            {/* DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
                            <div className="mt-6 space-y-4">
    {order.items.map(item => (
        <div 
            key={item.id} 
            onClick={() => navigate(`/product/${item.product.id}`)}
            className="flex gap-4 items-center bg-white p-3 rounded-xl border border-slate-100 cursor-pointer hover:border-[#d70018] hover:shadow-sm transition-all group"
        >
            {/* Ảnh sản phẩm thu nhỏ */}
            <div className="w-12 h-12 bg-slate-50 rounded border flex items-center justify-center p-1 shrink-0">
                <img 
                    src={item.product.images?.length > 0 ? (item.product.images[0].image.startsWith('http') ? item.product.images[0].image : `http://localhost:8000${item.product.images[0].image}`) : "https://via.placeholder.com/150"} 
                    alt={item.product.title} 
                    className="max-w-full max-h-full object-contain mix-blend-multiply" 
                />
            </div>
            {/* Tên sản phẩm */}
            <div className="flex-1">
                <div className="font-bold text-slate-800 line-clamp-1 group-hover:text-[#d70018] transition-colors">{item.product.title}</div>
                <div className="text-xs text-slate-500">Phân loại: {item.product.category}</div>
            </div>
            {/* Số lượng & Giá */}
            <div className="text-sm text-slate-500">x{item.quantity}</div>
            <div className="font-bold text-slate-900 w-24 text-right">{Number(item.price).toLocaleString('vi-VN')}₫</div>
        </div>
    ))}
</div>

                            {/* THÔNG TIN GIAO HÀNG & NÚT HỦY ĐƠN */}
                            <div className="mt-6 flex flex-wrap justify-between items-end gap-4 bg-slate-50 p-4 rounded-xl">
                                <div className="text-sm text-slate-600">
                                    <p><span className="font-semibold">Giao đến:</span> {order.shipping_address}</p>
                                    <p><span className="font-semibold">SĐT:</span> {order.phone_number}</p>
                                </div>
                                {order.status === 'pending' && (
                                    <Button onClick={() => handleCancelOrder(order.id)} variant="destructive" size="sm">Hủy Đơn Hàng</Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}