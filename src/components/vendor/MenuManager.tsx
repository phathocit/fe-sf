import { useState } from 'react';
import { Plus, ImageOff, Edit, Search } from 'lucide-react';
import type { Food } from '../../types/food.types';

interface MenuManagerProps {
	menu: Food[];
	onAddItem: () => void;
	onEditItem: (item: Food) => void;
}

export default function MenuManager({
	menu,
	onAddItem,
	onEditItem,
}: MenuManagerProps) {
	const [searchTerm, setSearchTerm] = useState('');

	const filteredMenu = menu.filter((item) =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<>
			<div className='flex justify-between items-end mb-12'>
				<div>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-10 h-1 bg-orange-500 rounded-full'></div>
						<span className='text-xs font-black text-orange-500 uppercase tracking-[0.3em]'>
							Kitchen Manager
						</span>
					</div>
					<h1 className='text-4xl font-black text-slate-900 italic tracking-tight'>
						QUẢN LÝ THỰC ĐƠN
					</h1>
					<p className='text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]'>
						Cập nhật giá món và thêm món mới vào menu của bạn
					</p>
				</div>
				<button
					onClick={onAddItem}
					className='bg-orange-500 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-orange-500/30 hover:bg-orange-600 hover:-translate-y-1 transition-all text-xs uppercase tracking-widest flex items-center gap-3 cursor-pointer'
				>
					<Plus size={20} strokeWidth={3} /> Thêm Món Mới
				</button>
			</div>

			<div className='bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden flex flex-col'>
				<div className='p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0'>
					<h3 className='font-black text-slate-800 flex items-center gap-3 italic uppercase text-lg'>
						Danh sách món ăn <span className='text-orange-600'>({filteredMenu.length})</span>
					</h3>
					<div className='relative'>
						<Search
							size={16}
							className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400'
						/>
						<input
							type='text'
							placeholder='Tìm kiếm món...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='bg-white border border-slate-200 pl-12 pr-6 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 w-64 shadow-sm transition-all'
						/>
					</div>
				</div>

				<div className='p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 max-h-[700px] overflow-y-auto custom-scrollbar bg-slate-50/20'>
					{filteredMenu.length > 0 ? (
						filteredMenu.map((item) => (
							<div
								key={item.id}
								className={`group relative bg-white border border-slate-100 rounded-4xl p-5 flex gap-6 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden ${!item.isAvailable ? 'opacity-75 grayscale-[0.3]' : ''}`}
							>
								{!item.isAvailable && (
									<div className='absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] pointer-events-none z-0'></div>
								)}
								<div className='absolute top-4 right-4 flex gap-2 z-20'>
									<button
										onClick={() => onEditItem(item)}
										className='w-10 h-10 rounded-xl bg-white text-orange-500 shadow-xl border border-slate-100 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all scale-90 hover:scale-100 cursor-pointer'
										title='Sửa'
									>
										<Edit size={18} />
									</button>
								</div>

								<div className='w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 grow-0 shrink-0 shadow-inner group-hover:rotate-2 transition-transform relative'>
									{item.image ? (
										<img src={item.image} alt='' className='w-full h-full object-cover' />
									) : (
										<div className='w-full h-full flex items-center justify-center text-slate-400'>
											<ImageOff size={32} />
										</div>
									)}
									{!item.isAvailable && (
										<div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
											<span className='bg-white text-black text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest'>
												HẾT HÀNG
											</span>
										</div>
									)}
								</div>
								<div className='flex-1 flex flex-col justify-center relative z-10'>
									<div
										className={`text-[10px] font-black uppercase tracking-widest mb-1 italic ${item.isAvailable ? 'text-orange-500' : 'text-slate-400'}`}
									>
										{item.isAvailable ? 'MÓN ĐANG BÁN' : 'TẠM NGƯNG'}
									</div>
									<h4
										className={`font-black text-xl italic uppercase tracking-tight transition-colors ${item.isAvailable ? 'text-slate-900 group-hover:text-orange-600' : 'text-slate-400 line-through'}`}
									>
										{item.name}
									</h4>
									<div
										className={`font-black text-2xl mt-2 flex items-baseline gap-1.5 ${item.isAvailable ? 'text-orange-600' : 'text-slate-300'}`}
									>
										{item.price.toLocaleString('vi-VN')}{' '}
										<span className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
											VNĐ
										</span>
									</div>
								</div>
							</div>
						))
					) : (
						<div className='col-span-full py-20 flex flex-col items-center justify-center text-slate-300 gap-4'>
							<Search size={48} strokeWidth={1} />
							<p className='font-black uppercase tracking-widest text-xs'>
								Không tìm thấy món ăn nào
							</p>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
