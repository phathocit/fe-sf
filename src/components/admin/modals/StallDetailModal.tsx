import { X, MapPin, User, Info, Volume2, Utensils } from 'lucide-react';
import { type Stall } from '../../../types/stall.types';
import { type Food } from '../../../types/food.types';
import { type Account } from '../../../types/auth.types';

interface StallDetailModalProps {
	stall: Stall | null;
	vendor: Account | null;
	menu: Food[];
	menuLoading: boolean;
	isOpen: boolean;
	onClose: () => void;
	onToggleActive: (stall: Stall) => void;
}

export default function StallDetailModal({
	stall,
	vendor,
	menu,
	menuLoading,
	isOpen,
	onClose,
	onToggleActive,
}: StallDetailModalProps) {
	if (!isOpen || !stall) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-6'>
			<div
				className='absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300'
				onClick={onClose}
			></div>
			<div className='relative bg-white w-full max-w-5xl h-[85vh] rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col'>
				<div className='p-1 bg-indigo-600'></div>

				{/* Header */}
				<div className='p-8 pb-4 flex justify-between items-start border-b border-slate-50'>
					<div className='flex gap-6'>
						<div className='w-24 h-24 rounded-4xl overflow-hidden shadow-2xl rotate-3 shrink-0'>
							<img
								src={stall.image}
								alt=''
								className='w-full h-full object-cover'
							/>
						</div>
						<div>
							<div className='flex items-center gap-3 mb-2'>
								<span className='bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100'>
									{stall.category}
								</span>
								<span
									className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${stall.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}
								>
									{stall.isActive ? 'Kích hoạt' : 'Tạm khóa'}
								</span>
							</div>
							<h2 className='text-4xl font-black italic uppercase tracking-tighter text-slate-900'>
								{stall.name}
							</h2>
							<div className='flex items-center gap-4 mt-2 text-slate-400 font-bold text-xs uppercase tracking-widest'>
								<span className='flex items-center gap-1.5'>
									<MapPin size={14} className='text-rose-500' />{' '}
									{stall.latitude}, {stall.longitude}
								</span>
								<span className='flex items-center gap-1.5'>
									<User size={14} className='text-orange-500' /> Chủ quán:{' '}
									{vendor?.fullName || '...'}
								</span>
							</div>
						</div>
					</div>
					<button
						onClick={onClose}
						className='cursor-pointer w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm'
					>
						<X size={24} />
					</button>
				</div>

				{/* Content body */}
				<div className='flex-1 overflow-y-auto no-scrollbar p-8 grid grid-cols-1 lg:grid-cols-2 gap-12'>
					{/* Left: General Info & Script */}
					<div className='space-y-10'>
						<section>
							<h3 className='font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-3 mb-4'>
								<Info className='text-indigo-500' /> Giới thiệu gian hàng
							</h3>
							<div className='bg-slate-50 p-6 rounded-4xl border border-slate-100 text-slate-600 font-medium leading-relaxed'>
								{stall.description || 'Không có mô tả cho gian hàng này.'}
							</div>
						</section>

						<section>
							<h3 className='font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-3 mb-4'>
								<Volume2 className='text-orange-500' /> Kịch bản audio thuyết
								minh
							</h3>
							<div className='bg-orange-50/50 p-6 rounded-4xl border border-orange-100 text-slate-700 font-medium leading-relaxed italic'>
								“ {stall.script || 'Chưa được thiết lập kịch bản audio.'} ”
							</div>
						</section>
					</div>

					{/* Right: Menu List */}
					<section className='flex flex-col h-full'>
						<h3 className='font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-3 mb-4 shrink-0'>
							<Utensils className='text-emerald-500' /> Danh sách thực đơn (
							{menu.length})
						</h3>
						<div className='flex-1 overflow-y-auto pr-2 no-scrollbar'>
							{menuLoading ? (
								<div className='h-32 flex flex-col items-center justify-center gap-3 text-slate-400'>
									<div className='w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin'></div>
									<span className='font-black text-[9px] uppercase tracking-widest'>
										Đang tải menu...
									</span>
								</div>
							) : menu.length === 0 ? (
								<div className='h-32 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-4xl text-slate-400 font-bold'>
									<p className='text-xs uppercase tracking-widest'>
										Gian hàng chưa có thực đơn
									</p>
								</div>
							) : (
								<div className='space-y-4'>
									{menu.map((item) => (
										<div
											key={item.id}
											className='bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center gap-5 hover:border-emerald-200 transition-all group'
										>
											<div className='w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-inner group-hover:scale-110 transition-transform'>
												<img
													src={item.image}
													alt=''
													className='w-full h-full object-cover'
												/>
											</div>
											<div className='flex-1 min-w-0'>
												<h4 className='font-black text-slate-900 uppercase italic tracking-tight line-clamp-1'>
													{item.name}
												</h4>
												<p className='text-[10px] text-slate-400 font-bold truncate pr-4'>
													{item.description}
												</p>
											</div>
											<div className='text-right'>
												<div className='font-black text-indigo-600 italic tracking-tighter text-lg'>
													{item.price.toLocaleString('vi-VN')}
													<span className='text-xs ml-1'>đ</span>
												</div>
												<div
													className={`text-[9px] font-black uppercase tracking-widest ${item.isAvailable ? 'text-emerald-500' : 'text-rose-400'}`}
												>
													{item.isAvailable ? 'Có sẵn' : 'Hết món'}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</section>
				</div>

				{/* Footer */}
				<div className='p-8 pt-0 mt-auto'>
					<div className='flex gap-4'>
						<button
							onClick={() => onToggleActive(stall)}
							className={`flex-1 ${stall.isActive ? 'bg-rose-600' : 'bg-emerald-600'} text-white py-5 rounded-4xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer`}
						>
							{stall.isActive
								? 'Hủy kích hoạt gian hàng'
								: 'Kích hoạt gian hàng'}
						</button>
						<button
							onClick={onClose}
							className='px-10 bg-slate-900 text-white rounded-4xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all text-xs cursor-pointer'
						>
							Đóng
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
