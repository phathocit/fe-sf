import { useState, useEffect, useMemo } from 'react';
import { Eye, User, Mail, XCircle, ShieldAlert } from 'lucide-react';
import stallApi from '../../api/stallApi';
import accountApi from '../../api/accountApi';
import foodApi from '../../api/foodApi';
import { type Stall } from '../../types/stall.types';
import { type Account } from '../../types/auth.types';
import { type Food } from '../../types/food.types';
import { toast } from 'react-toastify';
import AdminLayout from '../../layouts/AdminLayout';
import StallDetailModal from '../../components/admin/modals/StallDetailModal';
import VendorInfoModal from '../../components/admin/modals/VendorInfoModal';

export default function StallsPage() {
	const [stalls, setStalls] = useState<Stall[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	// Modals state
	const [isStallDetailOpen, setIsStallDetailOpen] = useState(false);
	const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
	const [stallMenu, setStallMenu] = useState<Food[]>([]);
	const [stallMenuLoading, setStallMenuLoading] = useState(false);

	const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
	const [selectedVendor, setSelectedVendor] = useState<Account | null>(null);
	const [vendorLoading, setVendorLoading] = useState(false);

	useEffect(() => {
		fetchStalls();
	}, []);

	const fetchStalls = async () => {
		setLoading(true);
		try {
			const res = await stallApi.getAll();
			setStalls(res.result.filter((s: Stall) => s.isActive));
		} catch (error) {
			console.log(error);
			toast.error('Không thể tải danh sách gian hàng');
		} finally {
			setLoading(false);
		}
	};

	const filteredData = useMemo(() => {
		const q = searchQuery.toLowerCase();
		return stalls.filter(
			(s) => s.name.toLowerCase().includes(q) || s.id.toString().includes(q),
		);
	}, [stalls, searchQuery]);

	const handleToggleActive = async (stall: Stall) => {
		if (!window.confirm(`Xác nhận ngừng hoạt động gian hàng ${stall.name}?`))
			return;
		try {
			const res = await stallApi.update(stall.id, {
				...stall,
				isActive: false,
			});
			if (res.result) {
				setStalls(stalls.filter((s) => s.id !== stall.id));
				toast.success('Vô hiệu hóa thành công!');
				setIsStallDetailOpen(false);
			}
		} catch {
			toast.error('Thao tác thất bại!');
		}
	};

	const handleViewStallDetails = async (stall: Stall) => {
		setSelectedStall(stall);
		setIsStallDetailOpen(true);
		setStallMenuLoading(true);
		try {
			const foodRes = await foodApi.getByStallId(stall.id);
			setStallMenu(foodRes.result || []);
			const accRes = await accountApi.getById(stall.vendorId);
			setSelectedVendor(accRes.result);
		} catch {
			toast.error('Không thể lấy đầy đủ thông tin');
		} finally {
			setStallMenuLoading(false);
		}
	};

	const handleViewVendor = async (vendorId: number) => {
		setVendorLoading(true);
		setIsVendorModalOpen(true);
		try {
			const res = await accountApi.getById(vendorId);
			setSelectedVendor(res.result);
		} catch {
			toast.error('Không thể lấy thông tin chủ gian hàng');
			setIsVendorModalOpen(false);
		} finally {
			setVendorLoading(false);
		}
	};

	return (
		<AdminLayout
			title='Quản Lý Gian Hàng'
			subtitle={`Hệ thống ghi nhận ${stalls.length} gian hàng đang hoạt động`}
			searchPlaceholder='Tìm kiếm gian hàng...'
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
								<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									Trạng thái
								</th>
								<th className='p-6 text-right pr-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									Hành động
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-50 font-medium text-slate-700'>
							{loading ? (
								<tr>
									<td colSpan={5} className='p-20 text-center'>
										<div className='inline-block w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin'></div>
									</td>
								</tr>
							) : filteredData.length === 0 ? (
								<tr>
									<td colSpan={5} className='p-20 text-center text-slate-400'>
										<ShieldAlert
											size={48}
											className='mx-auto mb-4 opacity-20'
										/>
										<p className='font-black uppercase tracking-widest text-xs'>
											Không tìm thấy gian hàng nào
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
												<div className='w-14 h-14 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform shrink-0'>
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
													<div className='text-[10px] text-slate-400 font-bold uppercase mt-0.5 line-clamp-1 max-w-50'>
														{stall.description || 'Chưa có mô tả'}
													</div>
												</div>
											</div>
										</td>
										<td className='p-6'>
											<span className='bg-orange-50 text-orange-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100 whitespace-nowrap'>
												{stall.category}
											</span>
										</td>
										<td className='p-6'>
											<div className='flex items-center gap-2'>
												<div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></div>
												<span className='text-[10px] font-black uppercase tracking-widest text-emerald-600'>
													Đang bán
												</span>
											</div>
										</td>
										<td className='p-6 text-right pr-10'>
											<div className='flex justify-end gap-2'>
												<button
													onClick={() => handleViewStallDetails(stall)}
													className='cursor-pointer w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm'
												>
													<Eye size={18} />
												</button>
												<button
													onClick={() => handleViewVendor(stall.vendorId)}
													className='cursor-pointer w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm'
												>
													<User size={18} />
												</button>
												<button
													onClick={() =>
														toast.info(`Cảnh báo gửi tới ${stall.name}`)
													}
													className='cursor-pointer w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm'
												>
													<Mail size={18} />
												</button>
												<button
													onClick={() => handleToggleActive(stall)}
													className='cursor-pointer w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm'
												>
													<XCircle size={18} />
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
				onToggleActive={handleToggleActive}
			/>

			<VendorInfoModal
				vendor={selectedVendor}
				loading={vendorLoading}
				isOpen={isVendorModalOpen}
				onClose={() => setIsVendorModalOpen(false)}
			/>
		</AdminLayout>
	);
}
