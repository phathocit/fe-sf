import { Users, TrendingUp, Volume2, Navigation, Activity } from "lucide-react";

export default function Analytics() {
  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1 bg-orange-500 rounded-full"></div>
            <span className="text-xs font-black text-orange-500 uppercase tracking-[0.3em]">
              Insight & Data
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tight uppercase">
            THỐNG KÊ GIAN HÀNG
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">
            Theo dõi lượng khách ghé thăm và hiệu quả truyền thông audio
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Dữ liệu thời gian thực
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/5 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
              Tổng lượt ghé thăm
            </h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-slate-900 italic tracking-tight">
                1,284
              </span>
              <span className="text-green-500 font-black text-xs mb-1.5 flex items-center gap-1">
                <TrendingUp size={14} /> +12%
              </span>
            </div>
            <p className="text-slate-400 text-[9px] font-bold mt-4 uppercase tracking-[0.1em]">
              Tăng trưởng so với tháng trước
            </p>
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
            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
              Xác minh qua Audio
            </h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-slate-900 italic tracking-tight">
                856
              </span>
              <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md mb-2">
                HIỆU QUẢ CAO
              </span>
            </div>
            <p className="text-slate-400 text-[9px] font-bold mt-4 uppercase tracking-[0.1em]">
              Khách đã nghe hết bài thuyết minh audio
            </p>
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
            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
              Xác minh dừng chân (GPS)
            </h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-slate-900 italic tracking-tight">
                428
              </span>
              <span className="text-slate-400 font-black text-[10px] mb-1.5 italic">
                Dừng &gt; 15 phút
              </span>
            </div>
            <p className="text-slate-400 text-[9px] font-bold mt-4 uppercase tracking-[0.1em]">
              Tọa độ GPS trùng khớp & dừng trong thời gian dài
            </p>
          </div>
        </div>
      </div>

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
              <div
                key={idx}
                className="flex-1 flex flex-col items-center group"
              >
                <div className="w-full relative">
                  <div
                    style={{ height: `${val}%` }}
                    className={`w-full rounded-t-2xl transition-all duration-500 group-hover:brightness-110 relative ${idx === 4 ? "bg-orange-600" : "bg-slate-100"}`}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {val * 10}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-4xl shadow-2xl p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="font-black italic uppercase tracking-tight mb-8">
              Nguồn khách hàng
            </h3>

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
                * Dữ liệu dựa trên GPS tích hợp và lượt phản hồi từ hệ thống
                thuyết minh tự động.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
