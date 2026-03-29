import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Store, Layers3 } from "lucide-react"

export default function ShopViewPage() {
  const { id } = useParams() // Lấy ID của shop từ URL
  const navigate = useNavigate()
  
  const [shopInfo, setShopInfo] = useState(null)
  const [shopProducts, setShopProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPublicShopData = async () => {
      try {
        // GỌI 2 API PUBLIC (Không cần Token)
        const [infoRes, productsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/users/shop/${id}/public/`),
          fetch(`http://localhost:8000/api/products/?shop_id=${id}`)
        ]);

        if (infoRes.ok) {
           const infoData = await infoRes.json();
           setShopInfo(infoData);
        } else {
           navigate('/') // Nếu không thấy shop thì đá về trang chủ
           return
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setShopProducts(productsData); 
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu shop:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublicShopData()
  }, [id, navigate])

  if (isLoading) return <div className="p-20 text-center text-slate-500">Đang tải thông tin Shop...</div>
  if (!shopInfo) return null

  return (
    <div className="container mx-auto px-4 py-10 font-sans max-w-7xl">
      
      {/* HEADER SHOP */}
      <div className="flex items-center justify-between gap-4 mb-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
            <div className="bg-red-50 text-[#d70018] p-5 rounded-full border border-red-100 flex items-center justify-center">
                <Store size={40}/>
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase">{shopInfo.name}</h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2">
                    Tham gia từ: {new Date(shopInfo.created_at).toLocaleDateString('vi-VN')}
                </p>
            </div>
        </div>
      </div>

      {/* TABS (Chỉ có Info và Products) */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 h-auto grid grid-cols-2 max-w-md shadow-inner">
          <TabsTrigger value="products" className="rounded-xl gap-2 h-12 data-[state=active]:bg-red-50 data-[state=active]:text-[#d70018] font-semibold text-slate-600">
            <Layers3 size={17}/> Sản phẩm ({shopProducts.length})
          </TabsTrigger>
          <TabsTrigger value="info" className="rounded-xl gap-2 h-12 data-[state=active]:bg-red-50 data-[state=active]:text-[#d70018] font-semibold text-slate-600">
            <Store size={17}/> Giới thiệu Shop
          </TabsTrigger>
        </TabsList>

        {/* TAB SẢN PHẨM */}
        <TabsContent value="products">
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
                <CardTitle>Tất cả sản phẩm</CardTitle>
                <CardDescription>Các sản phẩm hiện đang được bán bởi shop này.</CardDescription>
            </CardHeader>
            <CardContent>
                {shopProducts.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 italic">Shop này hiện chưa đăng bán sản phẩm nào.</div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-16">Ảnh</TableHead>
                                    <TableHead>Tên sản phẩm</TableHead>
                                    <TableHead>Danh mục</TableHead>
                                    <TableHead>Tình trạng</TableHead>
                                    <TableHead className="text-right">Giá bán</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shopProducts.map((p) => {
                                    const conditionDisplay = p.condition === "99" ? "Như mới 99%" : 
                                                             p.condition === "95" ? "Tốt 95%" : 
                                                             p.condition === "90" ? "Khá 90%" : "Xác máy";
                                    
                                    const imageUrl = p.images && p.images.length > 0 
                                        ? (p.images[0].image.startsWith('http') ? p.images[0].image : `http://localhost:8000${p.images[0].image}`)
                                        : "https://via.placeholder.com/150?text=No+Image";

                                    return (
                                        <TableRow 
                                            key={p.id} 
                                            // NÚT CHUYỂN HƯỚNG KHI BẤM VÀO SẢN PHẨM
                                            onClick={() => navigate(`/product/${p.id}`)}
                                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                                        >
                                            <TableCell><img src={imageUrl} className="w-12 h-12 object-cover rounded border bg-white" /></TableCell>
                                            <TableCell className="font-bold text-slate-800">{p.title}</TableCell>
                                            <TableCell><Badge variant="outline" className="capitalize">{p.category}</Badge></TableCell>
                                            <TableCell><span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{conditionDisplay}</span></TableCell>
                                            <TableCell className="text-right font-black text-[#d70018]">{Number(p.price).toLocaleString('vi-VN')}₫</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB THÔNG TIN */}
        <TabsContent value="info">
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
                <CardTitle>Về chúng tôi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-base bg-slate-50 p-6 rounded-xl border">
                  {shopInfo.description || "Chủ shop chưa cập nhật bài giới thiệu."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}