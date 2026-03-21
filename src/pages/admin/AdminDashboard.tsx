import { useState } from 'react';
import { Users, Store, Activity, Settings, Plus, Edit2, Trash2, X } from 'lucide-react';
import { stallsData, type Stall } from '../../data/mockData';

export default function AdminDashboard() {
  const [stalls, setStalls] = useState<Stall[]>(stallsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStall, setCurrentStall] = useState<Partial<Stall> | null>(null);

  const handleOpenModal = (stall?: Stall) => {
    if (stall) {
      setCurrentStall({ ...stall });
    } else {
      setCurrentStall({
        name: '',
        category: 'Ăn Nhẹ',
        address: '',
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
        menu: [],
        coordinates: [10.7601, 106.7042],
        description: '',
        operatingHours: '10:00 - 22:00'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStall) return;

    if (currentStall.id) {
      // Update
      setStalls(stalls.map(s => s.id === currentStall.id ? (currentStall as Stall) : s));
    } else {
      // Create
      const newStall = {
        ...currentStall,
        id: `SF${Date.now()}`,
      } as Stall;
      setStalls([...stalls, newStall]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa gian hàng này?')) {
      setStalls(stalls.filter(s => s.id !== id));
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
       {/* Admin Sidebar */}
       <div className="w-72 bg-slate-950 text-white flex flex-col py-8 px-6 shadow-2xl z-20">
          <div className="mb-10">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/40 mb-4 rotate-3">SF</div>
             <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Quản Trị Hệ Thống</div>
             <h2 className="text-2xl font-black italic tracking-tight">Admin <span className="text-indigo-500">Panel</span></h2>
          </div>
          
          <nav className="flex-1 space-y-1.5">
             <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 border border-white/10 rounded-xl font-bold text-white shadow-xl">
                <Store size={20} className="text-indigo-400" /> Quản lý Gian hàng
             </a>
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold">
                <Users size={20} /> Quản lý Người dùng
             </a>
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold">
                <Activity size={20} /> Thống kê Giao dịch
             </a>
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold mt-auto">
                <Settings size={20} /> Cài đặt hệ thống
             </a>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
             <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-black">AD</div>
                <div>
                   <div className="text-xs font-black">Super Admin</div>
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Online</div>
                </div>
             </div>
          </div>
       </div>

       {/* Admin Content */}
       <div className="flex-1 p-10 overflow-y-auto">
          <div className="flex justify-between items-end mb-10">
             <div>
                <h1 className="text-4xl font-black text-slate-900 italic tracking-tight mb-2">DANH SÁCH GIAN HÀNG</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Hiện có {stalls.length} gian hàng đang hoạt động trên hệ thống</p>
             </div>
             <button 
               onClick={() => handleOpenModal()}
               className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
             >
               <Plus size={20} strokeWidth={3} /> Thêm Gian Hàng Mới
             </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-4xl shadow-sm overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                   <tr>
                      <th className="p-6 pl-10">Gian Hàng</th>
                      <th className="p-6">Danh mục</th>
                      <th className="p-6">Địa chỉ</th>
                      <th className="p-6">Đánh giá</th>
                      <th className="p-6 text-right pr-10">Thao tác</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                   {stalls.map((stall) => (
                     <tr key={stall.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6 pl-10">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                                 <img src={stall.image} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                 <div className="font-black text-slate-900 text-base italic uppercase tracking-tight">{stall.name}</div>
                                 <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">ID: {stall.id}</div>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                              {stall.category}
                           </span>
                        </td>
                        <td className="p-6">
                           <div className="text-sm font-bold text-slate-500 max-w-xs truncate">{stall.address}</div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-1.5 text-yellow-500 font-black">
                              ⭐ {stall.rating}
                           </div>
                        </td>
                        <td className="p-6 text-right pr-10">
                           <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleOpenModal(stall)}
                                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                              >
                                 <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(stall.id)}
                                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* Modal CRUD */}
       {isModalOpen && currentStall && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
            <div className="relative bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight">
                    {currentStall.id ? 'Cập Nhật' : 'Thêm'} <span className="text-indigo-600">Gian Hàng</span>
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all">
                    <X size={20} />
                  </button>
               </div>
               
               <form onSubmit={handleSave} className="p-8 grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tên Gian Hàng</label>
                     <input 
                       required
                       type="text" 
                       value={currentStall.name}
                       onChange={e => setCurrentStall({...currentStall, name: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                       placeholder="Nhập tên gian hàng..."
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Danh Mục</label>
                     <select 
                       value={currentStall.category}
                       onChange={e => setCurrentStall({...currentStall, category: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                     >
                        <option>Ốc & Hải Sản</option>
                        <option>Ăn Nhẹ</option>
                        <option>Món Khô</option>
                        <option>Món Nước</option>
                        <option>Tráng Miệng</option>
                        <option>Lẩu & Nướng</option>
                        <option>Ăn Vặt</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Đánh Giá (1-5)</label>
                     <input 
                       type="number" 
                       step="0.1" min="1" max="5"
                       value={currentStall.rating}
                       onChange={e => setCurrentStall({...currentStall, rating: parseFloat(e.target.value)})}
                       className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                     />
                  </div>
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Địa Chỉ</label>
                     <input 
                       required
                       type="text" 
                       value={currentStall.address}
                       onChange={e => setCurrentStall({...currentStall, address: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                       placeholder="Nhập địa chỉ..."
                     />
                  </div>
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Hình Ảnh Gian Hàng</label>
                     <div 
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50/50'); }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/50'); }}
                        onDrop={(e) => {
                           e.preventDefault();
                           e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/50');
                           const file = e.dataTransfer.files[0];
                           if (file && file.type.startsWith('image/')) {
                              const url = URL.createObjectURL(file);
                              setCurrentStall({...currentStall, image: url});
                           }
                        }}
                        onClick={() => document.getElementById('fileInput')?.click()}
                        className="w-full border-2 border-dashed border-slate-200 rounded-4xl p-8 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-500 transition-all cursor-pointer group relative overflow-hidden h-48"
                     >
                        {currentStall.image ? (
                           <>
                              <img src={currentStall.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
                              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <span className="text-white font-black text-[10px] uppercase tracking-widest bg-indigo-600 px-4 py-2 rounded-full shadow-xl">Thay đổi ảnh</span>
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                                 <Plus size={32} strokeWidth={3} />
                              </div>
                              <div className="text-center">
                                 <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Kéo thả ảnh vào đây</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hoặc click để chọn file từ máy tính</p>
                              </div>
                           </>
                        )}
                        <input 
                           id="fileInput"
                           type="file" 
                           accept="image/*"
                           className="hidden"
                           onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 const url = URL.createObjectURL(file);
                                 setCurrentStall({...currentStall, image: url});
                              }
                           }}
                        />
                     </div>
                  </div>
                  
                  <div className="col-span-2 pt-4">
                     <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">
                        Lưu Thông Tin
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
}
