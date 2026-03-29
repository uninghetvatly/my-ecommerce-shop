export const PRODUCT_DATABASE = {
  // --- ĐIỆN THOẠI / TABLET ---
  "iphone 13": { 
    id: 1, category: "phone", brand: "Apple",
    originalNewPrice: 16990000, // Giá mua mới niêm yết (Mock)
    price: 8500000, // Giá bán đồ cũ
    conditionText: "Như mới (99%)", // Tình trạng cụ thể
    image: "https://images.unsplash.com/photo-1633113089631-6456cccaadad?w=400",
    cpu: "A15 Bionic", ram: "4GB", mainMem: "128GB", size: "6.1 inches", refreshRate: "60Hz" 
  },
  "galaxy s23": { 
    id: 2, category: "phone", brand: "Samsung",
    originalNewPrice: 21990000,
    price: 12500000,
    conditionText: "Tốt (95% - Trầy nhẹ)",
    image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400",
    cpu: "Snapdragon 8 Gen 2", ram: "8GB", mainMem: "256GB", size: "6.1 inches", refreshRate: "120Hz" 
  },
  "ipad pro 11": { 
    id: 3, category: "phone", brand: "Apple",
    originalNewPrice: 23990000,
    price: 15900000,
    conditionText: "Như mới (99%)",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    cpu: "M2", ram: "8GB", mainMem: "256GB", size: "11 inches", refreshRate: "120Hz" 
  },
  "pixel 7 pro": { 
    id: 4, category: "phone", brand: "Google",
    originalNewPrice: 18000000,
    price: 10200000,
    conditionText: "Khá (90% - Cấn góc)",
    image: "https://images.unsplash.com/photo-1666900251703-6056d68840c8?w=400",
    cpu: "Google Tensor G2", ram: "12GB", mainMem: "128GB", size: "6.7 inches", refreshRate: "120Hz" 
  },

  // --- LAPTOP ---
  "thinkpad t490s": { 
    id: 5, category: "laptop", brand: "Lenovo",
    originalNewPrice: 15000000,
    price: 7200000,
    conditionText: "Tốt (95%)",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
    cpu: "Intel Core i5-8365U", ram: "16GB", mainMem: "512GB SSD", size: "14 inches", refreshRate: "60Hz", resolution: "1920x1080", gpu: "Intel UHD 620" 
  },
  "macbook pro m1": { 
    id: 6, category: "laptop", brand: "Apple",
    originalNewPrice: 30000000,
    price: 18500000,
    conditionText: "Như mới (99%)",
    image: "https://images.unsplash.com/photo-1517336714460-4c50d917805d?w=400",
    cpu: "Apple M1", ram: "16GB", mainMem: "512GB SSD", size: "13.3 inches", refreshRate: "60Hz", resolution: "2560x1600", gpu: "8-core Apple GPU" 
  },
  "rog zephyrus g14": { 
    id: 7, category: "laptop", brand: "ASUS",
    originalNewPrice: 38000000,
    price: 22000000,
    conditionText: "Khá (90% - Pin chai 15%)",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    cpu: "Ryzen 9 5900HS", ram: "16GB", mainMem: "1TB SSD", size: "14 inches", refreshRate: "144Hz", resolution: "2560x1440", gpu: "RTX 3060" 
  },
  "dell xps 13": { 
    id: 8, category: "laptop", brand: "Dell",
    originalNewPrice: 28000000,
    price: 14500000,
    conditionText: "Tốt (95%)",
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400",
    cpu: "Intel i7-1185G7", ram: "16GB", mainMem: "512GB SSD", size: "13.4 inches", refreshRate: "60Hz", resolution: "3840x2400", gpu: "Iris Xe Graphics" 
  },

  // --- PC & LINH KIỆN ---
  "rtx 3060": { 
    id: 9, category: "pc", type: "GPU", brand: "NVIDIA",
    originalNewPrice: 10000000,
    price: 6800000,
    conditionText: "Tốt (95% - Hết BH)",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400"
  },
  "ryzen 5 5600x": { 
    id: 10, category: "pc", type: "CPU", brand: "AMD",
    originalNewPrice: 6500000,
    price: 3500000,
    conditionText: "Như mới (99% - Fullbox)",
    image: "https://images.unsplash.com/photo-1591405351990-4726e33df58d?w=400"
  },
  "corsair vengeance": { 
    id: 11, category: "pc", type: "RAM", brand: "Corsair",
    originalNewPrice: 2800000,
    price: 1800000,
    conditionText: "Tốt (95%)",
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400"
  }
};

// --- MOCK DATA USER PROFILE ---
export const MOCK_USER = {
  name: "Nguyễn Văn Hoài Nam",
  gender: "Nam",
  dob: "1998-05-15",
  phone: "0901 234 567",
  email: "nam.nguyen@email.com",
  avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Nam", // Tạo avatar giả lập
  joinedDate: "2023-01-10",
};

// --- MOCK DATA SHOP PROFILE & MANAGEMENT ---
export const MOCK_SHOP = {
  info: {
    name: "Nam Mobile - Chuyên Đồ Cũ Chất",
    logo: "https://api.dicebear.com/8.x/shapes/svg?seed=NamMobile",
    followers: 1250,
    rating: 4.8,
    script: "Chào mừng bạn đến với Nam Mobile. Shop mình chuyên các dòng iPhone, Samsung cũ bản VN/A, nguyên zin, chưa sửa chữa. Cam kết bảo hành 6 tháng, 1 đổi 1 trong 30 ngày. Đã được sàn xác thực uý tín.",
  },
  // Giả lập đơn hàng bán được (Cho Tab Quản lý đơn hàng)
  orders: [
    { id: "DH1001", customer: "Trần Thế Tài", product: "Macbook Pro M1", price: 18500000, date: "2024-05-20", status: "Đã giao", payment: "Đã thanh toán" },
    { id: "DH1002", customer: "Lê Thị Hồng", product: "iPhone 13", price: 8500000, date: "2024-05-22", status: "Đang giao", payment: "COD - Chờ thu" },
    { id: "DH1003", customer: "Phạm Minh Quốc", product: "RTX 3060", price: 6800000, date: "2024-05-23", status: "Chờ lấy hàng", payment: "Đã thanh toán" },
  ],
  // Giả lập tài chính (Cho Tab Thống kê)
  revenue: {
    totalRevenue: 33800000, // Tổng thu
    totalExpenditure: 25000000, // Tổng chi (vốn nhập hàng mock)
    balance: 8800000 // Dòng tiền hiện tại
  }
};

// ... (Giữ nguyên các mock data cũ ở trên)

// --- MOCK DATA GIỎ HÀNG (Phân nhóm theo Shop giống Shopee) ---
export const MOCK_CART = [
  {
    shopId: "shop1",
    shopName: "Nam Mobile - Đồ Cũ Chất",
    isFavorite: true,
    items: [
      {
        id: "c1",
        name: "iPhone 13 Pro Max 256GB Bản VN/A nguyên zin",
        variant: "Màu Xám Đen",
        price: 16500000,
        quantity: 1,
        stock: 1,
        image: "https://images.unsplash.com/photo-1633113089631-6456cccaadad?w=400"
      }
    ]
  },
  {
    shopId: "shop2",
    shopName: "GearVN Official (Hàng Lướt)",
    isFavorite: false,
    items: [
      {
        id: "c2",
        name: "Bàn phím cơ Keychron K2 V2 (Blue Switch)",
        variant: "Led RGB, Nhôm",
        price: 1200000,
        quantity: 1,
        stock: 3,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400"
      },
      {
        id: "c3",
        name: "Chuột Không Dây Logitech G304",
        variant: "Màu Đen",
        price: 650000,
        quantity: 2,
        stock: 5,
        image: "https://images.unsplash.com/photo-1527814050087-379381547949?w=400"
      }
    ]
  }
];

// --- MOCK DATA ĐƠN MUA ---
export const MOCK_PURCHASES = [
  {
    id: "DH-99012",
    shopName: "Macbook VN",
    productName: "Macbook Pro M1 16GB/512GB",
    price: 18500000,
    status: "Đang giao hàng",
    expectedDate: "2024-05-30",
    image: "https://images.unsplash.com/photo-1517336714460-4c50d917805d?w=400"
  },
  {
    id: "DH-99013",
    shopName: "Hà Nội Computer",
    productName: "Card màn hình RTX 3060 12GB Cũ",
    price: 6800000,
    status: "Chờ lấy hàng",
    expectedDate: "2024-05-28",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400"
  }
];