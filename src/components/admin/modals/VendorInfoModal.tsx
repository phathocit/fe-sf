import { X, Mail, User } from 'lucide-react';
import { type Account } from '../../../types/auth.types';

interface VendorInfoModalProps {
	vendor: Account | null;
	loading: boolean;
	isOpen: boolean;
	onClose: () => void;
}

export default function VendorInfoModal({
	vendor,
	loading,
	isOpen,
	onClose,
}: VendorInfoModalProps) {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-100 flex items-center justify-center p-6'>
			<div
				className='absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300'
				onClick={onClose}
			></div>
			<div className='relative bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300'>
				<div className='p-1 bg-orange-500'></div>
				<div className='p-8'>
					<div className='flex justify-between items-center mb-8'>
						<h2 className='text-3xl font-black italic uppercase tracking-tight'>
							THÔNG TIN <span className='text-orange-600'>CHỦ QUÁN</span>
						</h2>
						<button
							onClick={onClose}
							className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all'
						>
							<X size={20} />
						</button>
					</div>

					{loading ? (
						<div className='p-10 flex flex-col items-center gap-4 text-slate-400'>
							<div className='w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin'></div>
							<span className='font-black text-[10px] uppercase tracking-widest'>
								Đang truy xuất thông tin...
							</span>
						</div>
					) : vendor ? (
						<div className='space-y-6'>
							<div className='flex items-center gap-5 p-6 bg-slate-50 rounded-4xl border border-slate-100'>
								<div className='w-20 h-20 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-3xl shadow-inner'>
									{vendor.fullName?.charAt(0) || 'V'}
								</div>
								<div>
									<div className='text-2xl font-black text-slate-900 leading-none mb-1'>
										{vendor.fullName}
									</div>
									<div className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
										Họ tên đầy đủ
									</div>
								</div>
							</div>

							<div className='grid grid-cols-1 gap-4 px-2'>
								<div className='flex items-center gap-4 py-4 border-b border-slate-50'>
									<div className='w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0'>
										<Mail size={18} />
									</div>
									<div>
										<div className='text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5'>
											Email Liên Hệ
										</div>
										<div className='font-bold text-slate-900'>
											{vendor.email || 'Chưa cung cấp'}
										</div>
									</div>
								</div>
								<div className='flex items-center gap-4 py-4 border-b border-slate-50'>
									<div className='w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0'>
										<User size={18} />
									</div>
									<div>
										<div className='text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5'>
											Tên Đăng Nhập
										</div>
										<div className='font-bold text-slate-900'>
											@{vendor.userName}
										</div>
									</div>
								</div>
							</div>

							<div className='pt-6'>
								<button
									onClick={onClose}
									className='cursor-pointer w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all'
								>
									Đóng cửa sổ
								</button>
							</div>
						</div>
					) : (
						<div className='p-10 text-center text-slate-400 font-bold'>
							Không tìm thấy thông tin chủ quán
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
