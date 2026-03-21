import { useState } from 'react';
import { Plus, PackageSearch, ImageOff, Bell, Edit, Trash2, X, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { stallsData, type MenuItem } from '../../data/mockData';
import { Link } from 'react-router-dom';

export default function VendorDashboard() {
  const [stall, setStall] = useState(stallsData[0]); // Giả sử user này là chủ gian hàng đầu tiên
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setCurrentItem({ ...item });
    } else {
      setCurrentItem({
        name: '',
        price: 0,
        image: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;

    let newMenu = [...stall.menu];
    if (currentItem.id) {
      // Update
      newMenu = newMenu.map(m => m.id === currentItem.id ? (currentItem as MenuItem) : m);
    } else {
      // Create
      const newItem = {
        ...currentItem,
        id: `m${Date.now()}`,
      } as MenuItem;
      newMenu.push(newItem);
    }
    
    setStall({ ...stall, menu: newMenu });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Xóa món này khỏi menu?')) {
      const newMenu = stall.menu.filter(m => m.id !== id);
      setStall({ ...stall, menu: newMenu });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
       {/* Vendor Sidebar */}
       <div className="w-80 bg-orange-600 text-white flex flex-col py-10 px-6 shadow-2xl relative z-20 overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="px-2 mb-10 flex items-center gap-4 relative z-10">
             <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl rotate-3">
                <img src={stall.image} alt={stall.name} className="w-full h-full object-cover" />
             </div>
             <div>
                <h2 className="text-xl font-black italic tracking-tight line-clamp-1">{stall.name}</h2>
                <div className="text-[10px] font-black text-orange-200 uppercase tracking-widest mt-1 bg-black/10 px-2 py-0.5 rounded-md w-fit">Vendor ID: {stall.id}</div>
             </div>
          </div>
          
          <nav className="flex-1 space-y-2 relative z-10">
             <a href="#" className="flex items-center gap-3 px-5 py-4 bg-white text-orange-600 rounded-2xl font-black shadow-xl scale-105 transition-all uppercase tracking-widest text-xs">
                <PackageSearch size={20} /> Quản lý Thực đơn
             </a>
             <a href="#" className="flex items-center gap-3 px-5 py-4 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-black uppercase tracking-widest text-xs">
                <LayoutDashboard size={20} /> Tổng quan
             </a>
             <a href="#" className="flex items-center gap-3 px-5 py-4 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-black uppercase tracking-widest text-xs">
                <Bell size={20} /> Đơn hàng
                <span className="ml-auto bg-white text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-black">12</span>
             </a>
             <a href="#" className="flex items-center gap-3 px-5 py-4 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-black uppercase tracking-widest text-xs pt-10">
                <Settings size={20} /> Cài đặt shop
             </a>
          </nav>

          <div className="mt-auto space-y-4 relative z-10">
             <Link to="/" className="flex items-center gap-3 px-5 py-4 text-white/70 hover:text-white hover:bg-black/20 rounded-2xl transition-all font-black uppercase tracking-widest text-xs border border-white/10">
                <LogOut size={20} /> Thoát ra Home
             </Link>
          </div>
       </div>

       {/* Vendor Content */}
       <div className="flex-1 p-12 overflow-y-auto">
          <div className="flex justify-between items-end mb-12">
             <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-1 bg-orange-500 rounded-full"></div>
                   <span className="text-xs font-black text-orange-500 uppercase tracking-[0.3em]">Kitchen Manager</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 italic tracking-tight">QUẢN LÝ THỰC ĐƠN</h1>
                <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Cập nhật giá món và thêm món mới vào menu của bạn</p>
             </div>
             <button 
               onClick={() => handleOpenModal()}
               className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-orange-500/30 hover:bg-orange-600 hover:-translate-y-1 transition-all text-xs uppercase tracking-widest flex items-center gap-3"
             >
               <Plus size={20} strokeWidth={3} /> Thêm Món Mới
             </button>
          </div>

          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-3 italic uppercase text-lg">
                   Danh sách món ăn <span className="text-orange-600">({stall.menu.length})</span>
                </h3>
                <div className="relative">
                   <input 
                     type="text" 
                     placeholder="Tìm kiếm món..." 
                     className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 w-64 shadow-sm" 
                   />
                </div>
             </div>
             
             <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
                {stall.menu.map((item) => (
                  <div key={item.id} className="group relative bg-white border border-slate-100 rounded-4xl p-5 flex gap-6 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden">
                     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <button onClick={() => handleOpenModal(item)} className="w-10 h-10 rounded-xl bg-white text-orange-500 shadow-xl border border-slate-100 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all scale-90 hover:scale-100" title="Sửa">
                           <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-xl bg-white text-rose-500 shadow-xl border border-slate-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all scale-90 hover:scale-100" title="Xóa">
                           <Trash2 size={18} />
                        </button>
                     </div>

                     <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 grow-0 shrink-0 shadow-inner group-hover:rotate-2 transition-transform">
                       {item.image ? 
                           <img src={item.image} alt="" className="w-full h-full object-cover" /> 
                         : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageOff size={32} /></div>
                       }
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                        <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 italic">MÓN ĐANG BÁN</div>
                        <h4 className="font-black text-slate-900 text-xl italic uppercase tracking-tight group-hover:text-orange-600 transition-colors">{item.name}</h4>
                        <div className="text-orange-600 font-black text-2xl mt-2 flex items-baseline gap-1.5">
                           {item.price.toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VNĐ</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>

       {/* Modal CRUD Menu */}
       {isModalOpen && currentItem && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-orange-50/30">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">
                    {currentItem.id ? 'Sửa' : 'Thêm'} <span className="text-orange-600">Món Ăn</span>
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm">
                    <X size={20} />
                  </button>
               </div>
               
               <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tên Món Ăn</label>
                     <input 
                       required
                       type="text" 
                       value={currentItem.name}
                       onChange={e => setCurrentItem({...currentItem, name: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                       placeholder="VD: Ốc Hương Trứng Muối..."
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Giá Bán (VNĐ)</label>
                     <input 
                       required
                       type="number" 
                       value={currentItem.price}
                       onChange={e => setCurrentItem({...currentItem, price: parseInt(e.target.value)})}
                       className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-black text-orange-600 text-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Hình Ảnh Món Ăn</label>
                     <div 
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-orange-500', 'bg-orange-50/50'); }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-orange-500', 'bg-orange-50/50'); }}
                        onDrop={(e) => {
                           e.preventDefault();
                           e.currentTarget.classList.remove('border-orange-500', 'bg-orange-50/50');
                           const file = e.dataTransfer.files[0];
                           if (file && file.type.startsWith('image/')) {
                              const url = URL.createObjectURL(file);
                              setCurrentItem({...currentItem, image: url});
                           }
                        }}
                        onClick={() => document.getElementById('menuFileInput')?.click()}
                        className="w-full border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-orange-50/30 hover:border-orange-500 transition-all cursor-pointer group relative overflow-hidden h-40"
                     >
                        {currentItem.image ? (
                           <>
                              <img src={currentItem.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
                              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <span className="text-white font-black text-[10px] uppercase tracking-widest bg-orange-600 px-4 py-2 rounded-full shadow-xl">Thay đổi ảnh</span>
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:scale-110 transition-all">
                                 <Plus size={24} strokeWidth={3} />
                              </div>
                              <div className="text-center">
                                 <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">Kéo thả ảnh món</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hoặc click để chọn file</p>
                              </div>
                           </>
                        )}
                        <input 
                           id="menuFileInput"
                           type="file" 
                           accept="image/*"
                           className="hidden"
                           onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 const url = URL.createObjectURL(file);
                                 setCurrentItem({...currentItem, image: url});
                              }
                           }}
                        />
                     </div>
                  </div>
                  
                  <div className="pt-4">
                     <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-orange-600 transition-all active:scale-95">
                        Lưu Món Ăn
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
}
