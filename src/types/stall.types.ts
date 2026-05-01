export interface Stall {
  id: number;
  streetId: number;
  vendorId: number;
  name: string;
  category: string;
  latitude: string;
  longitude: string;
  image: string;
  description?: string;
  script?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Cập nhật các trường từ Backend Trigger Config
  radius?: number; // Khoảng cách kích hoạt
  triggerType?: string; // Loại trigger (GEOFENCE,...)
  triggerDistance?: number; // Khoảng cách thông báo sớm
  cooldownSeconds?: number; // Thời gian chờ để phát lại
  priority?: number; // Độ ưu tiên phát
  coordinates?: [number, number];
  imageFile?: File;
}
