import { useState, useEffect, useMemo } from 'react';
import {
	CheckCircle2,
	XCircle,
	Search,
	Mail,
	User,
	ShieldAlert,
	X,
	Users,
	Activity,
} from 'lucide-react';
import stallApi from '../../api/stallApi';
import accountApi from '../../api/accountApi';
import type { Stall } from '../../types/stall.types';
import type { Account } from '../../types/auth.types';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

import AdminSidebar from '../../components/admin/AdminSidebar';
import type { AdminTab } from '../../components/admin/AdminSidebar';

export default function AdminDashboard() {
	const { logout } = useAuth();
	const [activeTab, setActiveTab] = useState<AdminTab>('stalls');
	const [stalls, setStalls] = useState<Stall[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
	const [selectedVendor, setSelectedVendor] = useState<Account | null>(null);
	const [vendorLoading, setVendorLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const response = await stallApi.getAll();
				setStalls(response.result);
			} catch (error) {
				console.error('Failed to fetch stalls:', error);
				toast.error('Không thể tải danh sách gian hàng');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const filteredStalls = useMemo(() => {
		const isShowingStallsTab = activeTab === 'stalls';

		return stalls.filter((s) => {
			const matchesTab = isShowingStallsTab ? s.isActive : !s.isActive;
			const matchesSearch =
				s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.id.toString().includes(searchQuery);
			return matchesTab && matchesSearch;
		});
	}, [stalls, searchQuery, activeTab]);

	const handleToggleActive = async (stall: Stall) => {
		const action = stall.isActive ? 'ngừng hoạt động' : 'kích hoạt lại';
		if (!window.confirm(`Xác nhận ${action} gian hàng ${stall.name}?`)) return;

		try {
			// Using spread to satisfy Stall type but only sending isActive toggle
			const res = await stallApi.update(stall.id, {
				...stall,
				isActive: !stall.isActive,
			});
			if (res.result) {
				setStalls(stalls.map((s) => (s.id === stall.id ? res.result : s)));
				toast.success(
					`${stall.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} thành công!`,
				);
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast.error('Thao tác thất bại!');
		}
	};

	const handleViewVendor = async (vendorId: number) => {
		setVendorLoading(true);
		setIsVendorModalOpen(true);
		try {
			const res = await accountApi.getById(vendorId);
			setSelectedVendor(res.result);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast.error('Không thể lấy thông tin chủ gian hàng');
			setIsVendorModalOpen(false);
		} finally {
			setVendorLoading(false);
		}
	};

	const handleSendWarning = (stall: Stall) => {
		toast.info(`Đã gửi cảnh báo đến gian hàng ${stall.name}`);
	};

	return (
		<div className='h-screen bg-slate-50 flex overflow-hidden'>
			<AdminSidebar 
				activeTab={activeTab} 
				onTabChange={setActiveTab} 
				onLogout={logout} 
			/>

			{/* Main Content */}
			<div className='flex-1 flex flex-col h-full overflow-hidden'>
				{/* Top Header */}
				<header className='bg-white border-b border-slate-200 px-10 py-6 flex justify-between items-center shrink-0'>
					<div>
						<h1 className='text-3xl font-black text-slate-900 italic tracking-tight uppercase'>
							{activeTab === 'stalls'
								? 'Quản Lý Gian Hàng'
								: 'Duyệt Gian Hàng Mới'}
						</h1>
						<p className='text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1'>
							{activeTab === 'stalls'
								? `Hệ thống ghi nhận ${stalls.length} gian hàng`
								: 'Đang xem xét hồ sơ các đối tác mới'}
						</p>
					</div>

					<div className='flex items-center gap-6'>
						<div className='relative group'>
							<Search
								className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors'
								size={18}
							/>
							<input
								type='text'
								placeholder='Tìm kiếm gian hàng...'
								className='bg-slate-100 border-none px-12 py-3 rounded-2xl text-sm font-bold w-64 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<div className='flex items-center gap-3 pl-6 border-l border-slate-200'>
							<div className='w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-black text-white shadow-lg'>
								AD
							</div>
							<div>
								<div className='text-xs font-black text-slate-900 leading-none'>
									Administrator
								</div>
								<div className='text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-1'>
									Active
								</div>
							</div>
						</div>
					</div>
				</header>

				{/* Content Area */}
				<main className='flex-1 p-10 overflow-hidden flex flex-col'>
					{loading ? (
						<div className='h-full flex items-center justify-center bg-white rounded-4xl border border-slate-100'>
							<div className='flex flex-col items-center gap-4'>
								<div className='w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin'></div>
								<p className='font-black text-slate-400 text-xs uppercase tracking-widest'>
									Đang tải dữ liệu...
								</p>
							</div>
						</div>
					) : (
						<>
							{(activeTab === 'stalls' || activeTab === 'pending') && (
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
														Quản lý nghiệp vụ
													</th>
												</tr>
											</thead>
											<tbody className='divide-y divide-slate-50 font-medium text-slate-700'>
												{filteredStalls.map((stall) => (
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
																	<div className='text-[10px] text-slate-400 font-bold uppercase mt-0.5 line-clamp-1 max-w-[200px]'>
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
																<div
																	className={`w-2 h-2 rounded-full ${stall.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
																></div>
																<span
																	className={`text-[10px] font-black uppercase tracking-widest ${stall.isActive ? 'text-emerald-600' : 'text-rose-600'}`}
																>
																	{stall.isActive ? 'Đang bán' : 'Bị Khóa'}
																</span>
															</div>
														</td>
														<td className='p-6 text-right pr-10'>
															{activeTab === 'stalls' ? (
																<div className='flex justify-end gap-2'>
																	<button
																		onClick={() => handleViewVendor(stall.vendorId)}
																		title='Xem chủ sở hữu'
																		className='cursor-pointer w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm'
																	>
																		<User size={18} />
																	</button>

																	<button
																		onClick={() => handleSendWarning(stall)}
																		title='Gửi cảnh báo qua Mail'
																		className='cursor-pointer w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm'
																	>
																		<Mail size={18} />
																	</button>

																	<button
																		onClick={() => handleToggleActive(stall)}
																		title='Khóa gian hàng'
																		className='cursor-pointer w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm'
																	>
																		<XCircle size={18} />
																	</button>
																</div>
															) : (
																<div className='flex justify-end gap-2'>
																	<button
																		onClick={() => handleViewVendor(stall.vendorId)}
																		title='Xem hồ sơ gian hàng'
																		className='cursor-pointer px-4 h-10 rounded-xl bg-white border-2 border-slate-100 text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-xs shadow-sm'
																	>
																		<ShieldAlert size={16} /> Hồ sơ
																	</button>
																	<button
																		onClick={() => handleToggleActive(stall)}
																		title='Duyệt gian hàng'
																		className='cursor-pointer px-4 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20'
																	>
																		<CheckCircle2 size={16} /> Duyệt
																	</button>
																	<button
																		onClick={() =>
																			toast.error('Đã từ chối gian hàng')
																		}
																		title='Hủy bỏ'
																		className='cursor-pointer w-10 h-10 rounded-xl bg-white border-2 border-rose-100 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm'
																	>
																		<X size={18} />
																	</button>
																</div>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
									{filteredStalls.length === 0 && (activeTab === 'stalls' || activeTab === 'pending') && (
										<div className='p-20 text-center text-slate-400 flex flex-col items-center'>
											<ShieldAlert size={48} className='mb-4 opacity-20' />
											<p className='font-black uppercase tracking-widest text-xs'>
												Không tìm thấy gian hàng nào
											</p>
										</div>
									)}
								</div>
							)}

							{activeTab === 'users' && (
								<div className='flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-4xl shadow-sm'>
									<Users size={64} className='text-slate-200 mb-6' />
									<h3 className='text-xl font-black text-slate-900 uppercase italic'>Quản lý Người dùng</h3>
									<p className='text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2'>Tính năng đang được phát triển</p>
								</div>
							)}

							{activeTab === 'analytics' && (
								<div className='flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-4xl shadow-sm'>
									<Activity size={64} className='text-slate-200 mb-6' />
									<h3 className='text-xl font-black text-slate-900 uppercase italic'>Thống kê Giao dịch</h3>
									<p className='text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2'>Tính năng đang được phát triển</p>
								</div>
							)}
						</>
					)}
				</main>
			</div>

			{/* Vendor Info Modal */}
			{isVendorModalOpen && (
				<div className='fixed inset-0 z-[100] flex items-center justify-center p-6'>
					<div
						className='absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300'
						onClick={() => setIsVendorModalOpen(false)}
					></div>
					<div className='relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300'>
						<div className='p-1 bg-orange-500'></div>
						<div className='p-8'>
							<div className='flex justify-between items-center mb-8'>
								<h2 className='text-3xl font-black italic uppercase tracking-tight'>
									THÔNG TIN <span className='text-orange-600'>CHỦ QUÁN</span>
								</h2>
								<button
									onClick={() => setIsVendorModalOpen(false)}
									className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all'
								>
									<X size={20} />
								</button>
							</div>

							{vendorLoading ? (
								<div className='p-10 flex flex-col items-center gap-4 text-slate-400'>
									<div className='w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin'></div>
									<span className='font-black text-[10px] uppercase tracking-widest'>
										Đang truy xuất thông tin...
									</span>
								</div>
							) : selectedVendor ? (
								<div className='space-y-6'>
									<div className='flex items-center gap-5 p-6 bg-slate-50 rounded-4xl border border-slate-100'>
										<div className='w-20 h-20 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-3xl shadow-inner'>
											{selectedVendor.fullName?.charAt(0) || 'V'}
										</div>
										<div>
											<div className='text-2xl font-black text-slate-900 leading-none mb-1'>
												{selectedVendor.fullName}
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
													{selectedVendor.email || 'Chưa cung cấp'}
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
													@{selectedVendor.userName}
												</div>
											</div>
										</div>
									</div>

									<div className='pt-6'>
										<button
											onClick={() => setIsVendorModalOpen(false)}
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
			)}
		</div>
	);
}
