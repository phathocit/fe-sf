import React from 'react';
import { X, Plus } from 'lucide-react';
import type { Food } from '../../types/food.types';
import { toast } from 'react-toastify';

interface MenuModalProps {
	currentItem: Partial<Food>;
	onClose: () => void;
	onChange: (data: Partial<Food>) => void;
	onSave: (e: React.FormEvent) => void;
}

export default function MenuModal({
	currentItem,
	onClose,
	onChange,
	onSave,
}: MenuModalProps) {
	
	const handleFileSelect = (file: File) => {
		if (!file.type.startsWith('image/')) {
			toast.error('Vui lòng chọn file hình ảnh!');
			return;
		}

		// Tạo preview URL cục bộ ngay lập tức và lưu file đối tượng
		const localPreview = URL.createObjectURL(file);
		onChange({ 
			...currentItem, 
			image: localPreview, 
			imageFile: file 
		});
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-6'>
			<div className='absolute inset-0 bg-slate-950/60 backdrop-blur-sm'></div>
			<div className='relative bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'>
				<div className='p-8 border-b border-slate-100 flex justify-between items-center bg-orange-50/30'>
					<h2 className='text-2xl font-black italic uppercase tracking-tight text-slate-900'>
						{currentItem.id ? 'Sửa' : 'Thêm'}{' '}
						<span className='text-orange-600'>Món Ăn</span>
					</h2>
					<button
						onClick={onClose}
						className='w-10 h-10 rounded-full bg-white border border-slate-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer'
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={onSave} className='p-8 space-y-6'>
					<div>
						<label className='block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2'>
							Tên Món Ăn
						</label>
						<input
							required
							type='text'
							value={currentItem.name || ''}
							onChange={(e) =>
								onChange({ ...currentItem, name: e.target.value })
							}
							className='w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all'
							placeholder='VD: Ốc Hương Trứng Muối...'
						/>
					</div>
					<div>
						<label className='block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2'>
							Giá Bán (VNĐ)
						</label>
						<input
							required
							type='number'
							value={currentItem.price || 0}
							onChange={(e) =>
								onChange({
									...currentItem,
									price: parseInt(e.target.value),
								})
							}
							className='w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-black text-orange-600 text-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all'
						/>
					</div>
					<div>
						<label className='block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2'>
							Mô tả
						</label>
						<input
							required
							type='text'
							value={currentItem.description || ''}
							onChange={(e) =>
								onChange({ ...currentItem, description: e.target.value })
							}
							className='w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all'
							placeholder='VD: Món ăn này rất ngon và bổ dưỡng...'
						/>
					</div>
					<div>
						<label className='block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2'>
							Hình Ảnh Món Ăn
						</label>
						<div
							onDragOver={(e) => {
								e.preventDefault();
								e.currentTarget.classList.add(
									'border-orange-500',
									'bg-orange-50/50',
								);
							}}
							onDragLeave={(e) => {
								e.preventDefault();
								e.currentTarget.classList.remove(
									'border-orange-500',
									'bg-orange-50/50',
								);
							}}
							onDrop={(e) => {
								e.preventDefault();
								e.currentTarget.classList.remove(
									'border-orange-500',
									'bg-orange-50/50',
								);
								const file = e.dataTransfer.files[0];
								if (file) {
									handleFileSelect(file);
								}
							}}
							onClick={() => document.getElementById('menuFileInput')?.click()}
							className='w-full border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-orange-50/30 hover:border-orange-500 transition-all cursor-pointer group relative overflow-hidden h-40'
						>
							{currentItem.image ? (
								<>
									<img
										src={currentItem.image}
										alt='Preview'
										className='absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110'
									/>
									<div className='absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
										<span className='text-white font-black text-[10px] uppercase tracking-widest bg-orange-600 px-4 py-2 rounded-full shadow-xl'>
											Thay đổi ảnh
										</span>
									</div>
								</>
							) : (
								<>
									<div className='w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:scale-110 transition-all'>
										<Plus size={24} strokeWidth={3} />
									</div>
									<div className='text-center'>
										<p className='text-xs font-black text-slate-900 uppercase italic tracking-tight'>
											Kéo thả ảnh món
										</p>
										<p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
											Hoặc click để chọn file
										</p>
									</div>
								</>
							)}
							<input
								id='menuFileInput'
								type='file'
								accept='image/*'
								className='hidden'
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleFileSelect(file);
									}
								}}
							/>
						</div>
					</div>

					<div>
						<label className='flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all'>
							<input
								type='checkbox'
								checked={currentItem.isAvailable ?? true}
								onChange={(e) =>
									onChange({ ...currentItem, isAvailable: e.target.checked })
								}
								className='w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500'
							/>
							<span className='text-xs font-black uppercase tracking-widest text-slate-700'>
								Đang phục vụ (Available)
							</span>
						</label>
					</div>

					<div className='pt-4'>
						<button
							type='submit'
							className='w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-orange-600 transition-all active:scale-95 cursor-pointer'
						>
							Lưu Món Ăn
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
