import { X, QrCode, Info } from 'lucide-react';
import { type Stall } from '../../../types/stall.types';

interface CreateQRModalProps {
	stalls: Stall[];
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	newQR: { name: string; stallId: number };
	setNewQR: (data: { name: string; stallId: number }) => void;
	loading: boolean;
}

export default function CreateQRModal({
	stalls,
	isOpen,
	onClose,
	onSubmit,
	newQR,
	setNewQR,
	loading,
}: CreateQRModalProps) {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-100 flex items-center justify-center p-6'>
			<div
				className='absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300'
				onClick={onClose}
			></div>
			<div className='relative bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col'>
				<div className='p-1 bg-slate-900'></div>
				<div className='p-10'>
					<div className='flex justify-between items-center mb-8'>
						<h2 className='text-3xl font-black italic uppercase tracking-tight'>
							TẠO <span className='text-orange-600'>QR CODE</span> MỚI
						</h2>
						<button
							onClick={onClose}
							className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all'
						>
							<X size={20} />
						</button>
					</div>

					<form onSubmit={onSubmit} className='space-y-6'>
						<div>
							<label className='block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1'>
								Tên định danh (Ví dụ: Menu QR, Bàn 1...)
							</label>
							<input
								type='text'
								required
								className='w-full bg-slate-50 border-2 border-slate-100 px-6 py-4 rounded-2xl font-bold focus:border-orange-500 focus:bg-white transition-all outline-none shadow-sm'
								placeholder='Nhập tên cho mã QR'
								value={newQR.name}
								onChange={(e) => setNewQR({ ...newQR, name: e.target.value })}
							/>
						</div>

						<div>
							<label className='block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1'>
								Chọn Gian Hàng
							</label>
							<select
								required
								className='w-full bg-slate-50 border-2 border-slate-100 px-6 py-4 rounded-2xl font-bold focus:border-orange-500 focus:bg-white transition-all outline-none shadow-sm appearance-none'
								value={newQR.stallId || ''}
								onChange={(e) =>
									setNewQR({ ...newQR, stallId: Number(e.target.value) })
								}
							>
								<option value=''>-- Chọn gian hàng --</option>
								{stalls.map((stall) => (
									<option key={stall.id} value={stall.id}>
										{stall.name} (#{stall.id})
									</option>
								))}
							</select>
						</div>

						<div className='p-6 bg-orange-50 rounded-3xl border border-orange-100'>
							<p className='text-[10px] font-bold text-orange-600 leading-relaxed uppercase tracking-wider'>
								<Info size={14} className='inline mr-1 mb-1' />
								Hệ thống sẽ tự động tạo một mã UUID ngẫu nhiên để đảm bảo tính
								duy nhất cho QR Code này.
							</p>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='cursor-pointer w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50'
						>
							{loading ? (
								<>
									<div className='w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin'></div>
									ĐANG KHỞI TẠO...
								</>
							) : (
								<>
									<QrCode size={18} /> XÁC NHẬN TẠO UUID QR
								</>
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
