import { useState, useEffect } from 'react';
import { Plus, PackageSearch, ImageOff, Edit, Trash2, X, LogOut, Settings, MapPin, Search, Navigation, BarChart3, TrendingUp, Users, Activity, Volume2 } from 'lucide-react';
import { stallsData, type MenuItem } from '../../data/mockData';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function VendorDashboard() {
  const [stall, setStall] = useState(stallsData[0]); // Giả sử user này là chủ gian hàng đầu tiên
  const [activeTab, setActiveTab] = useState<'menu' | 'settings' | 'analytics'>('menu');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);
  const [tmpStall, setTmpStall] = useState({...stall});
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) { console.error(err); }
  };

  // Custom icon for picker
  const pickerIcon = L.divIcon({
    html: `<div class="w-10 h-10 bg-indigo-600 border-4 border-white rounded-full shadow-2xl flex items-center justify-center text-white font-bold">📍</div>`,
    className: 'picker-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  // Helper component to catch map clicks
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setTmpStall({ ...tmpStall, coordinates: [e.latlng.lat, e.latlng.lng] });
      },
    });
    return tmpStall.coordinates ? (
      <Marker position={tmpStall.coordinates as [number, number]} icon={pickerIcon} />
    ) : null;
  }

  const handleReverseGeocode = async () => {
    try {
      const [lat, lng] = tmpStall.coordinates as [number, number];
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data.display_name) {
        setTmpStall({ ...tmpStall, address: data.display_name });
      }
    } catch (error) {
       console.error("Geocoding error", error);
    }
  };

  function RecenterMapHandler({ coords }: { coords: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(coords, 17);
    }, [coords, map]);
    return null;
  }

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

  const handleSaveMenu = (e: React.FormEvent) => {
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

  const handleSaveStall = (e: React.FormEvent) => {
    e.preventDefault();
    setStall({...tmpStall});
    alert('Thông tin gian hàng đã được cập nhật thành công!');
    setActiveTab('menu');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Xóa món này khỏi menu?')) {
      const newMenu = stall.menu.filter(m => m.id !== id);
      setStall({ ...stall, menu: newMenu });
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
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
             <button 
                onClick={() => setActiveTab('menu')}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs ${activeTab === 'menu' ? 'bg-white text-orange-600 shadow-xl scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
             >
                <PackageSearch size={20} /> Quản lý Thực đơn
             </button>
             <button 
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs ${activeTab === 'analytics' ? 'bg-white text-orange-600 shadow-xl scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
             >
                <BarChart3 size={20} /> Thống kê gian hàng
             </button>
             <button 
                onClick={() => { setTmpStall({...stall}); setActiveTab('settings'); }}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs mt-4 ${activeTab === 'settings' ? 'bg-white text-orange-600 shadow-xl scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
             >
                <Settings size={20} /> Cài đặt shop
             </button>
          </nav>

          <div className="mt-auto space-y-4 relative z-10">
             <Link to="/" className="flex items-center gap-3 px-5 py-4 text-white/70 hover:text-white hover:bg-black/20 rounded-2xl transition-all font-black uppercase tracking-widest text-xs border border-white/10">
                <LogOut size={20} /> Thoát ra Home
             </Link>
          </div>
       </div>

       {/* Vendor Content */}
       <div className="flex-1 p-12 overflow-y-auto">
          {activeTab === 'menu' ? (
             <>
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
             </>
          ) : activeTab === 'analytics' ? (
             <div className="max-w-6xl mx-auto pb-20">
                <div className="flex justify-between items-end mb-12">
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-1 bg-orange-500 rounded-full"></div>
                         <span className="text-xs font-black text-orange-500 uppercase tracking-[0.3em]">Insight & Data</span>
                      </div>
                      <h1 className="text-4xl font-black text-slate-900 italic tracking-tight uppercase">THỐNG KÊ GIAN HÀNG</h1>
                      <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Theo dõi lượng khách ghé thăm và hiệu quả truyền thông audio</p>
                   </div>
                   <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dữ liệu thời gian thực</span>
                   </div>
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                   <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/5 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Users size={80} />
                      </div>
                      <div className="relative z-10">
                         <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                            <Users size={24} />
                         </div>
                         <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Tổng lượt ghé thăm</h3>
                         <div className="flex items-end gap-3">
                            <span className="text-4xl font-black text-slate-900 italic tracking-tight">1,284</span>
                            <span className="text-green-500 font-black text-xs mb-1.5 flex items-center gap-1">
                               <TrendingUp size={14} /> +12%
                            </span>
                         </div>
                         <p className="text-slate-400 text-[9px] font-bold mt-4 uppercase tracking-[0.1em]">Tăng trưởng so với tháng trước</p>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Volume2 size={80} />
                      </div>
                      <div className="relative z-10">
                         <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                            <Volume2 size={24} />
                         </div>
                         <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Xác minh qua Audio</h3>
                         <div className="flex items-end gap-3">
                            <span className="text-4xl font-black text-slate-900 italic tracking-tight">856</span>
                            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md mb-2">HIỆU QUẢ CAO</span>
                         </div>
                         <p className="text-slate-400 text-[9px] font-bold mt-4 uppercase tracking-[0.1em]">Khách đã nghe hết bài thuyết minh audio</p>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Navigation size={80} />
                      </div>
                      <div className="relative z-10">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                            <Navigation size={24} />
                         </div>
                         <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Xác minh dừng chân (GPS)</h3>
                         <div className="flex items-end gap-3">
                            <span className="text-4xl font-black text-slate-900 italic tracking-tight">428</span>
                            <span className="text-slate-400 font-black text-[10px] mb-1.5 italic">Dừng &gt; 15 phút</span>
                         </div>
                         <p className="text-slate-400 text-[9px] font-bold mt-4 uppercase tracking-[0.1em]">Tọa độ GPS trùng khớp & dừng trong thời gian dài</p>
                      </div>
                   </div>
                </div>

                {/* Detailed Charts Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 bg-white rounded-4xl border border-slate-100 shadow-sm p-10">
                      <div className="flex items-center justify-between mb-10">
                         <h3 className="font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-3">
                            <Activity className="text-orange-500" /> Biểu đồ lưu lượng tuần
                         </h3>
                         <select className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none">
                            <option>7 Ngày qua</option>
                            <option>30 Ngày qua</option>
                         </select>
                      </div>
                      
                      <div className="h-64 flex items-end justify-between gap-4 px-4">
                         {[65, 40, 85, 30, 95, 55, 75].map((val, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center group">
                               <div className="w-full relative">
                                  <div 
                                    style={{ height: `${val}%` }} 
                                    className={`w-full rounded-t-2xl transition-all duration-500 group-hover:brightness-110 relative ${idx === 4 ? 'bg-orange-600' : 'bg-slate-100'}`}
                                  >
                                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {val * 10}
                                     </div>
                                  </div>
                               </div>
                               <span className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">
                                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][idx]}
                               </span>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-slate-900 rounded-4xl shadow-2xl p-10 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                      <div className="relative z-10 h-full flex flex-col">
                         <h3 className="font-black italic uppercase tracking-tight mb-8">Nguồn khách hàng</h3>
                         
                         <div className="space-y-8 flex-1">
                            <div>
                               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                  <span>Quét QR tại chỗ</span>
                                  <span className="text-orange-500">45%</span>
                               </div>
                               <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-orange-600 w-[45%]"></div>
                               </div>
                            </div>
                            <div>
                               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                  <span>Gợi ý từ Audio Tour</span>
                                  <span className="text-indigo-400">30%</span>
                               </div>
                               <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 w-[30%]"></div>
                               </div>
                            </div>
                            <div>
                               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                  <span>Tìm kiếm Map</span>
                                  <span className="text-emerald-400">25%</span>
                               </div>
                               <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 w-[25%]"></div>
                               </div>
                            </div>
                         </div>

                         <div className="mt-10 pt-10 border-t border-white/10 italic">
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                               * Dữ liệu dựa trên GPS tích hợp và lượt phản hồi từ hệ thống thuyết minh tự động.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          ) : (
             <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-1 bg-indigo-500 rounded-full"></div>
                      <span className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em]">Profile Setting</span>
                   </div>
                   <h1 className="text-4xl font-black text-slate-900 italic tracking-tight">CÀI ĐẶT GIAN HÀNG</h1>
                   <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Quản lý thông tin hiển thị và giới thiệu về gian hàng của bạn</p>
                </div>

                <div className="bg-white rounded-4xl shadow-2xl shadow-indigo-500/5 border border-slate-100 overflow-hidden">
                   <form onSubmit={handleSaveStall} className="p-12 space-y-10">
                      <div className="grid grid-cols-2 gap-10">
                        <div className="col-span-2">
                           <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Tên Gian Hàng</label>
                           <input 
                             required
                             type="text" 
                             value={tmpStall.name}
                             onChange={e => setTmpStall({...tmpStall, name: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-black text-xl text-slate-900 focus:outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all italic tracking-tight"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Giờ hoạt động</label>
                           <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                              <input 
                                 type="time" 
                                 value={tmpStall.operatingHours.split(' - ')[0] || '08:00'}
                                 onChange={e => {
                                    const parts = tmpStall.operatingHours.split(' - ');
                                    const newHours = `${e.target.value} - ${parts[1] || '22:00'}`;
                                    setTmpStall({...tmpStall, operatingHours: newHours});
                                 }}
                                 className="flex-1 bg-white border border-slate-100 px-4 py-3 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                              />
                              <span className="font-black text-slate-300">TỚI</span>
                              <input 
                                 type="time" 
                                 value={tmpStall.operatingHours.split(' - ')[1] || '22:00'}
                                 onChange={e => {
                                    const parts = tmpStall.operatingHours.split(' - ');
                                    const newHours = `${parts[0] || '08:00'} - ${e.target.value}`;
                                    setTmpStall({...tmpStall, operatingHours: newHours});
                                 }}
                                 className="flex-1 bg-white border border-slate-100 px-4 py-3 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Danh mục đặc trưng</label>
                           <input 
                             type="text" 
                             value={tmpStall.category}
                             onChange={e => setTmpStall({...tmpStall, category: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-bold focus:outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                           />
                        </div>
                        <div className="col-span-2">
                           <div className="flex justify-between items-end mb-4">
                              <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Địa chỉ gian hàng</label>
                              <button 
                                 type="button"
                                 onClick={() => setIsLocModalOpen(true)}
                                 className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                              >
                                 <Navigation size={14} className="rotate-45" /> Xác nhận trên Map
                              </button>
                           </div>
                           <input 
                             required
                             type="text" 
                             value={tmpStall.address}
                             onChange={e => setTmpStall({...tmpStall, address: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-bold focus:outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                           />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Giới thiệu về gian hàng</label>
                           <textarea 
                             rows={5}
                             value={tmpStall.description}
                             onChange={e => setTmpStall({...tmpStall, description: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-bold focus:outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none leading-relaxed text-slate-600"
                             placeholder="VD: Quán chuyên các món hải sản bình dân vùng biển..."
                           />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Ảnh bìa & Hình ảnh gian hàng</label>
                           <div 
                              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50/50'); }}
                              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/50'); }}
                              onDrop={(e) => {
                                 e.preventDefault();
                                 e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/50');
                                 const file = e.dataTransfer.files[0];
                                 if (file && file.type.startsWith('image/')) {
                                    const url = URL.createObjectURL(file);
                                    setTmpStall({...tmpStall, image: url});
                                 }
                              }}
                              onClick={() => document.getElementById('stallFileInput')?.click()}
                              className="w-full border-4 border-dashed border-slate-100 rounded-4xl p-10 flex items-center gap-10 bg-slate-50/30 hover:bg-white hover:border-indigo-500 transition-all cursor-pointer group shadow-inner"
                           >
                              {tmpStall.image ? (
                                 <>
                                    <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-2xl relative group-hover:rotate-2 transition-transform">
                                       <img src={tmpStall.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Kéo thả ảnh mới để thay đổi</p>
                                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Ảnh bìa gian hàng là ấn tượng đầu tiên của khách hàng</p>
                                       <div className="mt-6 flex gap-3">
                                          <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Update Required</span>
                                       </div>
                                    </div>
                                 </>
                              ) : (
                                 <div className="w-full flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-300"><Plus size={32} /></div>
                                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Phóng ảnh bìa của bạn lên đây</p>
                                 </div>
                              )}
                              <input 
                                 id="stallFileInput"
                                 type="file" 
                                 accept="image/*"
                                 className="hidden"
                                 onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                       const url = URL.createObjectURL(file);
                                       setTmpStall({...tmpStall, image: url});
                                    }
                                 }}
                              />
                           </div>
                        </div>
                      </div>
                      
                      <div className="pt-6">
                         <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/40 hover:bg-indigo-600 transition-all active:scale-95 group relative overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center gap-4">
                               LƯU TẤT CẢ THÔNG TIN <Edit size={20} />
                            </span>
                            <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                         </button>
                      </div>
                   </form>
                </div>
             </div>
          )}
       </div>

       {/* Modal CRUD Menu */}
       {isModalOpen && currentItem && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
            <div className="relative bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-orange-50/30">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">
                    {currentItem.id ? 'Sửa' : 'Thêm'} <span className="text-orange-600">Món Ăn</span>
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm">
                    <X size={20} />
                  </button>
               </div>
               
               <form onSubmit={handleSaveMenu} className="p-8 space-y-6">
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
       {/* Modal Location Picker */}
       {isLocModalOpen && (
         <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
            <div className="relative bg-white w-full max-w-4xl h-[80vh] rounded-4xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900 flex items-center gap-3">
                    <MapPin className="text-indigo-600" /> Xác nhận <span className="text-indigo-600">Vị Trí</span>
                  </h2>
                  <div className="flex gap-2">
                     <button 
                        onClick={handleReverseGeocode}
                        className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                     >
                        Lấy địa chỉ từ Pin 📍
                     </button>
                     <button onClick={() => setIsLocModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all">
                        <X size={20} />
                     </button>
                  </div>
               </div>
               
               <div className="flex-1 relative">
                  <MapContainer 
                     center={tmpStall.coordinates as [number, number]} 
                     zoom={17} 
                     className="w-full h-full"
                  >
                     <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                     <LocationMarker />
                     <RecenterMapHandler coords={tmpStall.coordinates as [number, number]} />
                  </MapContainer>
                  
                  {/* Search Overlay */}
                  <div className="absolute top-6 left-6 z-[7000] w-96 max-w-[calc(100%-48px)]">
                     <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-white">
                        <Search className="text-slate-400 ml-3" size={18} />
                        <input 
                           type="text" 
                           placeholder="Tìm kiếm địa chỉ..." 
                           value={searchQuery}
                           onChange={(e) => {
                              setSearchQuery(e.target.value);
                              fetchSuggestions(e.target.value);
                           }}
                           className="flex-1 bg-transparent border-none py-3 pr-4 outline-none text-xs font-bold"
                           onKeyDown={async (e) => {
                              if (e.key === 'Enter' && searchQuery) {
                                 const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
                                 const data = await res.json();
                                 if (data && data.length > 0) {
                                    const { lat, lon } = data[0];
                                    setTmpStall({ ...tmpStall, coordinates: [parseFloat(lat), parseFloat(lon)] });
                                    setSuggestions([]);
                                 }
                              }
                           }}
                        />
                     </div>

                     {/* Suggestions Dropdown */}
                     {suggestions.length > 0 && (
                        <div className="mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                           {suggestions.map((s, idx) => (
                              <button
                                 key={idx}
                                 onClick={() => {
                                    setTmpStall({ ...tmpStall, coordinates: [parseFloat(s.lat), parseFloat(s.lon)] });
                                    setSearchQuery(s.display_name);
                                    setSuggestions([]);
                                 }}
                                 className="w-full text-left p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group flex items-start gap-3"
                              >
                                 <MapPin size={14} className="text-slate-400 mt-0.5 group-hover:text-indigo-600 transition-colors" />
                                 <div className="flex-1">
                                    <p className="text-[11px] font-black text-slate-800 line-clamp-1">{s.display_name}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.address?.suburb || s.address?.city || 'Địa điểm'}</p>
                                 </div>
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[7000] bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl flex items-center gap-4 animate-bounce">
                     <Navigation size={20} className="text-indigo-400 animate-pulse" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em]">Click lên bản đồ để di chuyển PIN</p>
                  </div>
               </div>
               
               <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-6 shrink-0">
                  <div className="flex-1">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Địa chỉ hiện tại xác nhận từ Map</p>
                     <p className="text-xs font-bold text-slate-700 line-clamp-1 italic">"{tmpStall.address}"</p>
                  </div>
                  <button 
                     onClick={() => setIsLocModalOpen(false)}
                     className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                  >
                     Xong, hoàn tất
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
