import { Users, Store, Activity, Settings } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex">
       {/* Admin Sidebar */}
       <div className="w-64 bg-slate-900 text-white flex flex-col py-6">
          <div className="px-6 mb-8">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Quản Trị Hệ Thống</div>
             <h2 className="text-2xl font-black">Admin Panel</h2>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
             <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-600 rounded-xl font-medium text-white shadow-lg shadow-indigo-600/20">
                <Store size={20} /> Quản lý Gian hàng
             </a>
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Users size={20} /> Quản lý User
             </a>
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Activity size={20} /> Thống kê Giao dịch
             </a>
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Settings size={20} /> Cài đặt hệ thống
             </a>
          </nav>
       </div>

       {/* Admin Content */}
       <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h1 className="text-3xl font-black text-slate-800">Danh sách Gian Hàng</h1>
                <p className="text-slate-500 font-medium">Bạn có 124 gian hàng đang hoạt động.</p>
             </div>
             <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors">
               + Thêm Gian Hàng Mới
             </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                   <tr>
                      <th className="p-4 pl-6">ID</th>
                      <th className="p-4">Tên Gian Hàng</th>
                      <th className="p-4">Chủ sở hữu</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right pr-6">Thao tác</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                   {[1, 2, 3, 4, 5].map((item) => (
                     <tr key={item} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 text-slate-400">#SF{1000 + item}</td>
                        <td className="p-4">
                           <div className="font-bold text-slate-800">Bánh Mì Huỳnh Hoa {item}</div>
                           <div className="text-xs text-slate-400 mt-0.5">Danh mục: Cơm/Bánh</div>
                        </td>
                        <td className="p-4 text-slate-500">user_{item}@gmail.com</td>
                        <td className="p-4">
                           <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                             Hoạt động
                           </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                           <button className="text-indigo-600 hover:underline font-bold mr-3">Sửa</button>
                           <button className="text-rose-600 hover:underline font-bold">Khóa</button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
}
