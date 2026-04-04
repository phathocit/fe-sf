import { Clock, AlertCircle } from 'lucide-react';

interface VendorPendingProps {
	onLogout: () => void;
}

export default function VendorPending({ onLogout }: VendorPendingProps) {
	return (
		<div className='h-screen flex flex-col items-center justify-center bg-slate-950 p-10 text-center relative overflow-hidden isolation-auto'>
			<div className='relative z-50 flex flex-col items-center'>
				<div className='w-28 h-28 border border-amber-500/20 rounded-4xl flex items-center justify-center text-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.15)] mb-10 overflow-hidden group'>
					<div className='absolute inset-0'></div>
					<Clock size={48} className='animate-pulse' />
				</div>

				<h1 className='text-5xl font-black text-white italic tracking-tighter mb-4 uppercase'>
					Đang chờ <span className='text-amber-500'>phê duyệt</span>
				</h1>
				<p className='text-slate-400 font-bold max-w-lg uppercase tracking-widest text-[10px] leading-relaxed mb-12 px-6'>
					Hệ thống đang kiểm tra thông tin đăng ký của bạn. Vui lòng quay lại
					sau khi Ban Quản Trị đã kích hoạt gian hàng của bạn.
				</p>

				<div className='flex gap-4 relative z-[60]'>
					<button
						onClick={() => window.location.reload()}
						className='cursor-pointer px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/5 shadow-xl hover:scale-105 active:scale-95'
					>
						Làm mới
					</button>
					<button
						onClick={onLogout}
						className='cursor-pointer px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-2xl shadow-amber-600/20 hover:scale-105 active:scale-95'
					>
						Đăng xuất
					</button>
				</div>
			</div>

			<div className='absolute bottom-10 text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 z-50'>
				<AlertCircle size={14} /> Smart Food Street • Quản trị viên
			</div>

			<div className='absolute top-0 left-0 w-full h-full bg-indigo-950/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[-1]'></div>
		</div>
	);
}
