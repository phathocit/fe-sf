import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Github, Facebook } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="h-screen bg-slate-950 text-white flex overflow-hidden font-sans">
      {/* Nửa bên trái ảnh nền món ăn siêu xịn */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000" 
            alt="Food background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-6 leading-tight">
            Thực thần điểm danh! <br/><span className="text-orange-500">Quẩy tung Vĩnh Khánh</span>
          </h2>
          <p className="text-slate-300 font-bold text-lg mb-8">
            Gia nhập cộng đồng ăn uống lớn nhất Sài Gòn, lưu quán ngon, đánh giá chân thực và chốt đơn trong chớp mắt.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className={`w-12 h-12 rounded-full border-4 border-slate-950 bg-slate-800 shrink-0 z-${10-i}`}>
                    <img src={`https://i.pravatar.cc/150?img=${i+10}`} className="w-full h-full rounded-full object-cover" alt="avatar" />
                 </div>
               ))}
            </div>
            <p className="font-black text-sm uppercase tracking-widest text-slate-400">
              +10K Thực thần <br/>đã tham gia
            </p>
          </div>
        </div>
      </div>

      {/* Nửa bên phải Form Đăng nhập/Đăng ký */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-10 lg:p-12 xl:p-16 relative z-10">
        {/* Abstract glow bg */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>

        <div className="max-w-md w-full mx-auto flex flex-col justify-between h-full py-4">
          <div>
            <Link to="/" className="cursor-pointer inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors font-black uppercase tracking-widest text-xs mb-8 w-max">
              <ArrowLeft size={16} /> Trang chủ
            </Link>

            <div className="mb-6">
               <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/30 mb-4 transform -rotate-6">SF</div>
               <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter mb-2">
                 {isLogin ? 'Welcome Back!' : 'Tạo tài khoản'}
               </h1>
               <p className="text-slate-400 font-bold text-sm">
                 {isLogin ? 'Đăng nhập để xem danh sách quán ruột của bạn.' : 'Tạo tài khoản để mở khóa mọi tính năng xịn sò.'}
               </p>
            </div>

            <div className="flex bg-slate-900 rounded-xl p-1 mb-6 shadow-inner">
              <button 
                onClick={() => setIsLogin(true)} 
                className={`cursor-pointer flex-1 py-2.5 font-black text-xs uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                Đăng Nhập
              </button>
              <button 
                onClick={() => setIsLogin(false)} 
                className={`cursor-pointer flex-1 py-2.5 font-black text-xs uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                Đăng Ký
              </button>
            </div>

            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Tên hiển thị</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" placeholder="Bé Tèo Thích Ăn Xôi" className="w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-sm" />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="email" placeholder="teo@example.com" className="w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between pl-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mật khẩu</label>
                  {isLogin && <a href="#" className="cursor-pointer text-[10px] font-black text-orange-500 hover:underline hover:text-orange-400">Quên pass?</a>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-lg tracking-widest" />
                </div>
              </div>

              <button type="button" className="cursor-pointer w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all active:translate-y-0 mt-3">
                {isLogin ? "LET'S GO 🚀" : "GIA NHẬP NGAY 💥"}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center shrink-0">
            <div className="relative flex items-center justify-center mb-5">
              <div className="absolute w-full h-px bg-slate-800"></div>
              <span className="relative bg-slate-950 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Hoặc tiếp tục với</span>
            </div>
            <div className="flex gap-4">
              <button className="cursor-pointer flex-1 bg-slate-900 border-2 border-slate-800 hover:border-slate-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
                <Github size={18} /> <span className="hidden sm:inline">GitHub</span>
              </button>
              <button className="cursor-pointer flex-1 bg-blue-600/10 border-2 border-blue-600/20 hover:bg-blue-600 hover:border-blue-600 text-blue-500 hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
                <Facebook size={18} /> <span className="hidden sm:inline">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
