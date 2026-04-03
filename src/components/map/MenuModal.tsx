import React from 'react';
import { Link } from 'react-router-dom';
import { X, Utensils, Loader2 } from 'lucide-react';
import type { Stall } from '../../types/stall.types';
import type { Food } from '../../types/food.types';

interface MenuModalProps {
	stall: Stall | null;
	menu: Food[];
	loading: boolean;
	t: (key: string, options?: any) => string;
	onClose: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({
	stall,
	menu,
	loading,
	t,
	onClose,
}) => {
	if (!stall) return null;

	return (
		<div className='absolute inset-0 z-[5000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4'>
			<div className='bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200'>
				<button
					onClick={onClose}
					className='cursor-pointer absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg z-20'
				>
					<X size={24} strokeWidth={3} />
				</button>
				<div className='relative h-40 shrink-0'>
					<img
						src={
							stall.image ||
							'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'
						}
						alt={stall.name}
						className='w-full h-full object-cover'
					/>
					<div className='absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent'></div>
					<div className='absolute bottom-4 left-5 text-white'>
						<div className='text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1'>
							{stall.category}
						</div>
						<h3 className='text-2xl font-black italic tracking-tight'>
							{stall.name}
						</h3>
					</div>
				</div>
				<div className='p-6 flex-1 flex flex-col'>
					<h4 className='font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0'>
						<Utensils size={16} className='text-orange-500' />{' '}
						{t('typical_dishes')}
					</h4>

					{loading ? (
						<div className='flex items-center justify-center py-10'>
							<Loader2 className='w-8 h-8 animate-spin text-orange-500' />
						</div>
					) : (
						<div className='space-y-3 mb-6 flex-1 overflow-y-auto no-scrollbar'>
							{menu.slice(0, 4).map((item) => (
								<div
									key={item.id}
									className='flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100'
								>
									<div className='flex-1 pr-4'>
										<div className='font-bold text-sm text-slate-900 leading-tight line-clamp-1'>
											{item.name}
										</div>
									</div>
									<div className='font-black text-orange-600 text-sm whitespace-nowrap'>
										{item.price.toLocaleString('vi-VN')}{' '}
										<span className='text-[9px] font-bold text-slate-400'>
											VNĐ
										</span>
									</div>
								</div>
							))}
							{menu.length === 0 && (
								<div className='text-center py-4 text-slate-400 text-xs italic'>
									Chưa có món ăn nào trong thực đơn
								</div>
							)}
						</div>
					)}

					<div className='mt-auto shrink-0'>
						<Link
							to={`/stall/${stall.id}`}
							className='cursor-pointer block text-center w-full bg-linear-to-r from-orange-500 to-red-600 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:to-red-700 transition-all active:scale-95'
						>
							{t('view_details')}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MenuModal;
