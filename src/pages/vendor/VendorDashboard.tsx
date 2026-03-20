import { Plus, CheckCircle2, PackageSearch, ImageOff, Bell } from 'lucide-react';
import { stallsData } from '../../data/mockData';

export default function VendorDashboard() {
  const stall = stallsData[0]; // Giả sử user này là chủ gian hàng đầu tiên

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex">
       {/* Vendor Sidebar */}
       <div className="w-64 bg-orange-600 text-white flex flex-col py-6">
          <div className="px-6 mb-8 flex items-center gap-3">
             <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
               <img src={stall.image} alt={stall.name} className="w-full h-full object-cover" />
             </div>
             <div>
                <h2 className="text-lg font-black leading-tight line-clamp-1">{stall.name}</h2>
                <div className="text-xs font-bold text-orange-200">ID: {stall.id}</div>
             </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 text-sm">
             <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg shadow-orange-900/10">
                <PackageSearch size={18} /> Quản lý Menu
             </a>
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-black/10 rounded-xl transition-all font-medium">
                <CheckCircle2 size={18} /> Chỉnh sửa Thông tin
             </a>
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-black/10 rounded-xl transition-all font-medium">
                <Bell size={18} /> Đơn hàng mới
                <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">12</span>
             </a>
          </nav>
       </div>

       {/* Vendor Content */}
       <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h1 className="text-3xl font-black text-gray-800">Quản lý Thực Đơn</h1>
                <p className="text-gray-500 font-medium mt-1">Sửa đổi giá và thêm món mới cho {stall.name}</p>
             </div>
             <button className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2">
               <Plus size={18} strokeWidth={3} /> Thêm Món Mới
             </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                   <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                   Danh sách món ăn ({stall.menu.length})
                </h3>
                <input 
                  type="text" 
                  placeholder="Tìm món..." 
                  className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" 
                />
             </div>
             
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {stall.menu.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 bg-gray-50/50 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all group relative">
                     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 rounded-full bg-white text-orange-500 shadow-sm border border-gray-100 flex items-center justify-center hover:bg-orange-50 font-bold text-xs" title="Sửa">Sửa</button>
                        <button className="w-8 h-8 rounded-full bg-white text-rose-500 shadow-sm border border-gray-100 flex items-center justify-center hover:bg-rose-50 font-bold text-xs" title="Xóa">Xóa</button>
                     </div>
                     <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                       {item.image ? 
                           <img src={item.image} alt="" className="w-full h-full object-cover" /> 
                         : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageOff size={24} /></div>
                       }
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-bold text-gray-800">{item.name}</h4>
                        <div className="text-orange-600 font-black text-lg mt-2 flex items-baseline gap-1">
                           {item.price.toLocaleString('vi-VN')} <span className="text-xs text-gray-400 font-bold">VNĐ</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}
