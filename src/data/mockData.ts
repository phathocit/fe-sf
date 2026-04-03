export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export interface Stall {
  id: string;
  name: string;
  category: string;
  rating: number;
  coordinates: [number, number]; // [lat, lng]
  image: string;
  description: string;
  menu: MenuItem[];
  address: string;
  operatingHours: string;
  audioUrl?: string;
  isActive: boolean;
}

export const stallsData: Stall[] = [
  {
    id: "1",
    name: "Ốc Oanh Vĩnh Khánh",
    category: "Ốc & Hải Sản",
    rating: 4.6,
    coordinates: [10.7595, 106.7042],
    address: "534 Vĩnh Khánh, Phường 10, Quận 4, TP.HCM",
    operatingHours: "13:00 - 23:00",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
    description: "Quán ốc nổi tiếng nhất nhì Quận 4, chuyên các món ốc xào sả ớt, nướng mọi.",
    menu: [
      { id: "m1", name: "Ốc Hương Trứng Muối", price: 120000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800", description: "Ốc hương to, sốt trứng muối béo ngậy" },
      { id: "m2", name: "Càng Ghẹ Rang Muối", price: 150000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800", description: "Càng ghẹ tươi ngon, vị muối ớt đậm đà" },
      { id: "m3", name: "Ốc Len Xào Dừa", price: 80000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800", description: "Ốc xào nước cốt dừa thơm nức" }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    isActive: true
  },
  {
    id: "2",
    name: "Ốc Đào - Chi Nhánh Quận 4",
    category: "Ốc & Hải Sản",
    rating: 4.4,
    coordinates: [10.7610, 106.7035],
    address: "132 Vĩnh Khánh, Phường 10, Quận 4, TP.HCM",
    operatingHours: "12:00 - 00:00",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
    description: "Chi nhánh Ốc Đào cực kỳ đắt khách với công thức sốt độc quyền.",
    menu: [
      { id: "m4", name: "Ốc Tỏi Nướng Mỡ Hành", price: 110000, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" },
      { id: "m5", name: "Sò Dương Nướng Phô Mai", price: 95000, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" }
    ],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    isActive: true
  },
  {
    id: "3",
    name: "Súp Cua Hạnh",
    category: "Ăn Nhẹ",
    rating: 4.7,
    coordinates: [10.7605, 106.7038],
    address: "210 Vĩnh Khánh, Phường 10, Quận 4, TP.HCM",
    operatingHours: "16:00 - 22:00",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800",
    description: "Súp cua đặc biệt với óc heo, trứng bắc thảo và nhiều thịt cua.",
    menu: [
      { id: "m6", name: "Súp Cua Thập Cẩm", price: 35000, image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
      { id: "m7", name: "Súp Óc Heo Trứng Bắc Thảo", price: 45000, image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" }
    ],
    isActive: true
  },
  {
    id: "4",
    name: "Phá Lấu Cô Thảo",
    category: "Món Khô",
    rating: 4.8,
    coordinates: [10.7588, 106.7048],
    address: "243/29G Tôn Đản (Gần Vĩnh Khánh), Quận 4, TP.HCM",
    operatingHours: "10:00 - 21:00",
    image: "https://images.unsplash.com/photo-1627344933560-c44d7f57fb40?auto=format&fit=crop&q=80&w=800",
    description: "Quán phá lấu bò huyền thoại with nước dùng béo ngậy, ăn kèm bánh mì giòn.",
    menu: [
      { id: "m8", name: "Phá Lấu Bò Chén", price: 30000, image: "https://images.unsplash.com/photo-1627344933560-c44d7f57fb40?auto=format&fit=crop&q=80&w=800" },
      { id: "m9", name: "Phá Lấu Mì Gói", price: 35000, image: "https://images.unsplash.com/photo-1627344933560-c44d7f57fb40?auto=format&fit=crop&q=80&w=800" }
    ],
    isActive: true
  },
  {
    id: "5",
    name: "Bún Mắm Cô Mai",
    category: "Món Nước",
    rating: 4.5,
    coordinates: [10.7600, 106.7045],
    address: "Vĩnh Khánh, Quận 4, TP.HCM",
    operatingHours: "07:00 - 22:00",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
    description: "Bún mắm đậm đà hương vị miền Tây với nhiều tôm, mực, cá viên.",
    menu: [
      { id: "m10", name: "Bún Mắm Đặc Biệt", price: 65000, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800" },
      { id: "m11", name: "Lẩu Mắm 2 Người", price: 250000, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800" }
    ],
    isActive: true
  },
  {
    id: "6",
    name: "Chè Phục Phục",
    category: "Tráng Miệng",
    rating: 4.3,
    coordinates: [10.7603, 106.7040],
    address: "Vĩnh Khánh, Quận 4, TP.HCM",
    operatingHours: "16:00 - 23:30",
    image: "https://images.unsplash.com/photo-1563805042-7684c8e9e533?auto=format&fit=crop&q=80&w=800",
    description: "Chè thái sầu riêng và trà sữa nhà làm thơm mát.",
    menu: [
      { id: "m12", name: "Chè Thái Sầu Riêng", price: 30000, image: "https://images.unsplash.com/photo-1563805042-7684c8e9e533?auto=format&fit=crop&q=80&w=800" }
    ],
    isActive: true
  },
  {
    id: "7",
    name: "Lẩu Dê 404",
    category: "Lẩu & Nướng",
    rating: 4.2,
    coordinates: [10.7592, 106.7050],
    address: "Vĩnh Khánh, Quận 4, TP.HCM",
    operatingHours: "11:00 - 23:00",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
    description: "Chuyên lẩu dê và các món nướng tại bàn, không gian rộng rãi.",
    menu: [
      { id: "m13", name: "Lẩu Dê Nhỏ", price: 180000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800" }
    ],
    isActive: true
  },
  {
    id: "8",
    name: "Bánh Tráng Cuốn Bà Bắc",
    category: "Ăn Vặt",
    rating: 4.9,
    coordinates: [10.7615, 106.7030],
    address: "Vĩnh Khánh, Quận 4, TP.HCM",
    operatingHours: "15:00 - 23:00",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
    description: "Bánh tráng cuốn bơ và hành phi cực kỳ hấp dẫn du khách.",
    menu: [
      { id: "m14", name: "Bánh Tráng Cuốn Bơ", price: 20000, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800" }
    ],
    isActive: true
  }
];

export interface PendingVendor {
  id: string;
  ownerName: string;
  phone: string;
  stallName: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const pendingVendorsData: PendingVendor[] = [
  {
    id: "PV1",
    ownerName: "Nguyễn Văn A",
    phone: "0901234567",
    stallName: "Bánh Mì Sài Gòn",
    email: "vana@example.com",
    status: 'PENDING',
    createdAt: "2024-03-25T10:00:00Z"
  },
  {
    id: "PV2",
    ownerName: "Trần Thị B",
    phone: "0912345678",
    stallName: "Bún Chả Hà Nội",
    email: "thib@example.com",
    status: 'PENDING',
    createdAt: "2024-03-26T14:30:00Z"
  }
];
