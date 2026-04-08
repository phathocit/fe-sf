import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

const ErrorPage: React.FC = () => {
	return (
		<div className='min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden'>
			{/* Decorative elements */}
			<div className='absolute top-0 right-0 w-125 h-125 bg-amber-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen'></div>
			<div className='absolute bottom-0 left-0 w-125 h-125 bg-red-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen'></div>

			<div className='max-w-2xl w-full text-center relative z-10'>
				<div className='mb-8 relative inline-block'>
					<div className='w-32 h-32 bg-amber-500/10 border-2 border-amber-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce'>
						<AlertCircle size={64} className='text-amber-500' />
					</div>
					<div className='absolute -bottom-2 -right-2 bg-amber-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest -rotate-12'>
						System Error
					</div>
				</div>

				<h1 className='text-8xl font-black text-white italic tracking-tighter mb-4 uppercase'>
					OOPS <span className='text-amber-500 font-normal not-italic'>ERROR</span>
				</h1>
				
				<h2 className='text-3xl font-black text-slate-200 uppercase tracking-tight mb-6'>
					Đã xảy ra sự cố không mong muốn
				</h2>

				<p className='text-slate-400 font-bold text-lg mb-12 leading-relaxed max-w-lg mx-auto'>
					Hệ thống đang gặp trục trặc kỹ thuật hoặc liên kết bạn truy cập không còn tồn tại. 
					Hãy thử tải lại trang hoặc quay về trang chủ.
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
						onClick={() => window.location.reload()}
						className='cursor-pointer flex items-center gap-3 px-8 py-4 bg-linear-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-amber-500/20 hover:-translate-y-0.5 group/btn'
					>
						<RefreshCw size={18} className='group-hover/btn:rotate-180 transition-transform duration-500' />
						Thử Lại
					</button>
				</div>
			</div>

			{/* Background Text */}
			<div className='fixed -bottom-20 -left-20 text-[20vw] font-black text-white/1 leading-none select-none pointer-events-none uppercase italic tracking-tighter'>
				Broken
			</div>
		</div>
	);
};

export default ErrorPage;
