import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
	return (
		<div className='min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden'>
			{/* Decorative elements */}
			<div className='absolute top-0 right-0 w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen'></div>
			<div className='absolute bottom-0 left-0 w-125 h-125 bg-purple-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen'></div>

			<div className='max-w-2xl w-full text-center relative z-10'>
				<div className='mb-8 relative inline-block'>
					<div className='w-32 h-32 bg-blue-500/10 border-2 border-blue-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse'>
						<Search size={64} className='text-blue-500' />
					</div>
					<div className='absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest rotate-12'>
						Not Found
					</div>
				</div>

				<h1 className='text-8xl font-black text-white italic tracking-tighter mb-4 uppercase'>
					404 <span className='text-blue-500 font-normal not-italic'>ERROR</span>
				</h1>
				
				<h2 className='text-3xl font-black text-slate-200 uppercase tracking-tight mb-6'>
					Trang này không tồn tại
				</h2>

				<p className='text-slate-400 font-bold text-lg mb-12 leading-relaxed max-w-lg mx-auto'>
					Có vẻ như bạn đã đi lạc hoặc liên kết này đã bị xóa. 
					Đừng lo lắng, bạn có thể quay lại trang chủ bằng nút bên dưới.
				</p>

				<div className='flex flex-wrap items-center justify-center gap-4'>
					<Link
						to='/'
						className='cursor-pointer flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all group'
					>
						<Home size={18} className='group-hover:-translate-y-0.5 transition-transform' />
						Về Trang Chủ
					</Link>
					
					<button
						onClick={() => window.history.back()}
						className='cursor-pointer flex items-center gap-3 px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-blue-500/20 hover:-translate-y-0.5'
					>
						<ArrowLeft size={18} />
						Quay Lại
					</button>
				</div>
			</div>

			{/* Background Text */}
			<div className='fixed -bottom-20 -right-20 text-[20vw] font-black text-white/1 leading-none select-none pointer-events-none uppercase italic tracking-tighter'>
				Missing
			</div>
		</div>
	);
};

export default NotFound;
