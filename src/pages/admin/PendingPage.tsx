import { useState, useEffect, useMemo } from 'react';
import { Eye, CheckCircle2, X, ShieldAlert } from 'lucide-react';
import stallApi from '../../api/stallApi';
import accountApi from '../../api/accountApi';
import foodApi from '../../api/foodApi';
import { type Stall } from '../../types/stall.types';
import { type Account } from '../../types/auth.types';
import { type Food } from '../../types/food.types';
import { toast } from 'react-toastify';
import AdminLayout from '../../layouts/AdminLayout';
import StallDetailModal from '../../components/admin/modals/StallDetailModal';

export default function PendingPage() {
	const [stalls, setStalls] = useState<Stall[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	const [isStallDetailOpen, setIsStallDetailOpen] = useState(false);
	const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
	const [stallMenu, setStallMenu] = useState<Food[]>([]);
	const [stallMenuLoading, setStallMenuLoading] = useState(false);
	const [selectedVendor, setSelectedVendor] = useState<Account | null>(null);

	useEffect(() => {
		fetchPendingStalls();
	}, []);

	const fetchPendingStalls = async () => {
		setLoading(true);
		try {
			const res = await stallApi.getAll();
			setStalls(res.result.filter((s: Stall) => !s.isActive));
		} catch {
			toast.error('Không thể tải danh sách chờ');
		} finally {
			setLoading(false);
		}
	};

	const filteredData = useMemo(() => {
		const q = searchQuery.toLowerCase();
		return stalls.filter((s) => s.name.toLowerCase().includes(q));
	}, [stalls, searchQuery]);

	const handleApprove = async (stall: Stall) => {
		try {
			const res = await stallApi.update(stall.id, { ...stall, isActive: true });
			if (res.result) {
				setStalls(stalls.filter((s) => s.id !== stall.id));
				toast.success('Duyệt gian hàng thành công!');
				setIsStallDetailOpen(false);
			}
		} catch {
			toast.error('Duyệt thất bại!');
		}
	};

	const handleViewDetails = async (stall: Stall) => {
		setSelectedStall(stall);
		setIsStallDetailOpen(true);
		setStallMenuLoading(true);
		try {
			const foodRes = await foodApi.getByStallId(stall.id);
			setStallMenu(foodRes.result || []);
			const accRes = await accountApi.getById(stall.vendorId);
			setSelectedVendor(accRes.result);
		} catch {
			toast.error('Lỗi khi tải chi tiết');
		} finally {
			setStallMenuLoading(false);
		}
	};

	return (
		<AdminLayout
			title='Duyệt Gian Hàng Mới'
			subtitle='Đang xem xét hồ sơ các đối tác mới'
			searchPlaceholder='Tìm kiếm gian hàng chờ...'
			searchValue={searchQuery}
			onSearchChange={setSearchQuery}
		>
			<div className='flex-1 min-h-0 bg-white border border-slate-200 rounded-4xl shadow-sm flex flex-col'>
				<div className='flex-1 overflow-auto no-scrollbar'>
					<table className='w-full text-left border-separate border-spacing-0'>
						<thead className='sticky top-0 z-10'>
							<tr className='bg-slate-50'>
								<th className='p-6 pl-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									ID
								</th>
								<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									Gian Hàng
								</th>
								<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									Danh mục
								</th>
								<th className='p-6 text-right pr-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									Hành động
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-50 font-medium text-slate-700'>
							{loading ? (
								<tr>
									<td colSpan={4} className='p-20 text-center'>
										<div className='inline-block w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin'></div>
									</td>
								</tr>
							) : filteredData.length === 0 ? (
								<tr>
									<td colSpan={4} className='p-20 text-center text-slate-400'>
										<ShieldAlert
											size={48}
											className='mx-auto mb-4 opacity-20'
										/>
										<p className='font-black uppercase tracking-widest text-xs'>
											Chưa có gian hàng nào chờ duyệt
										</p>
									</td>
								</tr>
							) : (
								filteredData.map((stall) => (
									<tr
										key={stall.id}
										className='hover:bg-slate-50/50 transition-colors group'
									>
										<td className='p-6 pl-10'>
											<span className='font-black text-slate-400 text-xs tracking-tighter'>
												#{stall.id}
											</span>
										</td>
										<td className='p-6'>
											<div className='flex items-center gap-4'>
												<div className='w-14 h-14 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform'>
													<img
														src={stall.image}
														alt=''
														className='w-full h-full object-cover'
													/>
												</div>
												<div className='min-w-0'>
													<div className='font-black text-slate-900 text-base italic uppercase tracking-tight truncate'>
														{stall.name}
													</div>
												</div>
											</div>
										</td>
										<td className='p-6'>
											<span className='bg-orange-50 text-orange-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100'>
												{stall.category}
											</span>
										</td>
										<td className='p-6 text-right pr-10'>
											<div className='flex justify-end gap-2'>
												<button
													onClick={() => handleViewDetails(stall)}
													className='cursor-pointer px-4 h-10 rounded-xl bg-white border-2 border-slate-100 text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all font-bold text-xs'
												>
													<Eye size={16} /> Chi tiết
												</button>
												<button
													onClick={() => handleApprove(stall)}
													className='cursor-pointer px-4 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all font-black uppercase tracking-widest text-[10px]'
												>
													<CheckCircle2 size={16} /> Duyệt
												</button>
												<button
													onClick={() => toast.error('Đã từ chối')}
													className='cursor-pointer w-10 h-10 rounded-xl bg-white border-2 border-rose-100 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all'
												>
													<X size={18} />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			<StallDetailModal
				stall={selectedStall}
				vendor={selectedVendor}
				menu={stallMenu}
				menuLoading={stallMenuLoading}
				isOpen={isStallDetailOpen}
				onClose={() => setIsStallDetailOpen(false)}
				onToggleActive={handleApprove}
			/>
		</AdminLayout>
	);
}
