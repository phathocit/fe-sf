import { useState, useEffect, useMemo } from 'react';
import {
	CheckCircle2,
	XCircle,
	Search,
	Mail,
	User,
	ShieldAlert,
	X,
	Eye,
	Utensils,
	MapPin,
	Info,
	Volume2,
	Trash2,
	QrCode,
	ExternalLink,
	Power,
	RefreshCcw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import stallApi from '../../api/stallApi';
import accountApi from '../../api/accountApi';
import foodApi from '../../api/foodApi';
import qrCodeApi from '../../api/qrCodeApi';
import type { Stall } from '../../types/stall.types';
import type { Account } from '../../types/auth.types';
import type { Food } from '../../types/food.types';
import type { QRCode } from '../../types/qrcode.types';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

import AdminSidebar from '../../components/admin/AdminSidebar';
import type { AdminTab } from '../../components/admin/AdminSidebar';

export default function AdminDashboard() {
	const { logout } = useAuth();
	const [activeTab, setActiveTab] = useState<AdminTab>('stalls');
	const [stalls, setStalls] = useState<Stall[]>([]);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	const [isQRModalOpen, setIsQRModalOpen] = useState(false);
	const [qrFormLoading, setQrFormLoading] = useState(false);
	const [newQR, setNewQR] = useState({
		name: '',
		stallId: 0,
	});

	const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
	const [selectedVendor, setSelectedVendor] = useState<Account | null>(null);
	const [vendorLoading, setVendorLoading] = useState(false);

	const [isStallDetailOpen, setIsStallDetailOpen] = useState(false);
	const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
	const [stallMenu, setStallMenu] = useState<Food[]>([]);
	const [stallMenuLoading, setStallMenuLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [stallRes, accountRes, qrRes] = await Promise.all([
					stallApi.getAll(),
					accountApi.getAll(),
					qrCodeApi.getAll(),
				]);

				setStalls(stallRes.result);
				setAccounts(accountRes.result);
				setQrCodes(qrRes.result);
			} catch (error) {
				console.error('Failed to fetch admin data:', error);
				toast.error('Không thể tải danh sách dữ liệu');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const filteredData = useMemo(() => {
		const q = searchQuery.toLowerCase();

		if (activeTab === 'stalls' || activeTab === 'pending') {
			return stalls.filter((s) => {
				const matchesTab = activeTab === 'stalls' ? s.isActive : !s.isActive;
				return (
					matchesTab &&
					(s.name.toLowerCase().includes(q) || s.id.toString().includes(q))
				);
			});
		}

		if (activeTab === 'users') {
			return accounts.filter((a) => {
				const isAdmin = a.roles.some((r) => r.name === 'ADMIN');
				if (isAdmin) return false;

				return (
					a.fullName.toLowerCase().includes(q) ||
					a.userName.toLowerCase().includes(q) ||
					a.email.toLowerCase().includes(q)
				);
			});
		}

		if (activeTab === 'qrcodes') {
			return qrCodes.filter(
				(qr) =>
					qr.name.toLowerCase().includes(q) ||
					qr.code.toLowerCase().includes(q) ||
					qr.stallName.toLowerCase().includes(q),
			);
		}

		return [];
	}, [stalls, accounts, qrCodes, searchQuery, activeTab]);

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

	const handleViewStallDetails = async (stall: Stall) => {
		setSelectedStall(stall);
		setIsStallDetailOpen(true);
		setStallMenuLoading(true);

		try {
			// Fetch menu for this stall
			const foodRes = await foodApi.getByStallId(stall.id);
			setStallMenu(foodRes.result || []);

			// If vendor is not loaded yet, load brief info
			if (!selectedVendor || Number(selectedVendor.id) !== stall.vendorId) {
				const accRes = await accountApi.getById(stall.vendorId);
				setSelectedVendor(accRes.result);
			}
		} catch (error) {
			console.error('Failed to fetch stall details:', error);
			toast.error('Không thể lấy đầy đủ thông tin gian hàng');
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

	const handleToggleUserActive = async (account: Account) => {
		const action = account.isActive ? 'ngừng hoạt động' : 'kích hoạt lại';
		if (!window.confirm(`Xác nhận ${action} tài khoản ${account.userName}?`))
			return;

		try {
			const res = await accountApi.update(account.id, {
				isActive: !account.isActive,
			});
			if (res.result) {
				setAccounts(
					accounts.map((a) => (a.id === account.id ? res.result : a)),
				);
				toast.success(
					`${account.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} thành công!`,
				);
			}
		} catch {
			toast.error('Thao tác người dùng thất bại!');
		}
	};

	const handleSendWarning = (stall: Stall) => {
		toast.info(`Đã gửi cảnh báo đến gian hàng ${stall.name}`);
	};

	const handleToggleQRActive = async (qr: QRCode) => {
		try {
			const res = await qrCodeApi.toggle(qr.id);
			if (res.result) {
				setQrCodes(qrCodes.map((q) => (q.id === qr.id ? res.result : q)));
				toast.success(
					`QR Code ${res.result.isActive ? 'đã được kích hoạt' : 'đã được tạm dừng'} thành công!`,
				);
			}
		} catch {
			toast.error('Không thể thay đổi trạng thái QR Code');
		}
	};

	const handleCreateQR = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newQR.name || !newQR.stallId) {
			toast.warn('Vui lòng điền đầy đủ thông tin');
			return;
		}

		setQrFormLoading(true);
		try {
			const res = await qrCodeApi.create({
				name: newQR.name,
				stallId: newQR.stallId,
				code: '', // Let backend generate UUID
			});
			if (res.result) {
				setQrCodes([...qrCodes, res.result]);
				setIsQRModalOpen(false);
				setNewQR({ name: '', stallId: 0 });
				toast.success('Tạo mã QR UUID thành công!');
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Tạo mã QR thất bại!');
		} finally {
			setQrFormLoading(false);
		}
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
								: activeTab === 'pending'
									? 'Duyệt Gian Hàng Mới'
									: activeTab === 'users'
										? 'Quản Lý Tài Khoản'
										: 'Quản Lý QR Code'}
						</h1>
						<p className='text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1'>
							{activeTab === 'stalls'
								? `Hệ thống ghi nhận ${stalls.length} gian hàng`
								: activeTab === 'pending'
									? 'Đang xem xét hồ sơ các đối tác mới'
									: activeTab === 'users'
										? `Tổng cộng ${accounts.length} người dùng`
										: `Tổng cộng ${qrCodes.length} mã QR đang lưu trữ`}
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
								placeholder={
									activeTab === 'stalls' || activeTab === 'pending'
										? 'Tìm kiếm gian hàng...'
										: activeTab === 'users'
											? 'Tìm kiếm người dùng...'
											: 'Tìm mã QR, gian hàng...'
								}
								className='bg-slate-100 border-none px-12 py-3 rounded-2xl text-sm font-bold w-64 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						{activeTab === 'qrcodes' && (
							<button
								onClick={() => setIsQRModalOpen(true)}
								className='cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95'
							>
								<QrCode size={16} /> Tạo QR mới
							</button>
						)}
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
														Hành động
													</th>
												</tr>
											</thead>
											<tbody className='divide-y divide-slate-50 font-medium text-slate-700'>
												{(filteredData as Stall[]).map((stall) => (
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
																		onClick={() =>
																			handleViewStallDetails(stall)
																		}
																		title='Xem chi tiết gian hàng'
																		className='cursor-pointer w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm'
																	>
																		<Eye size={18} />
																	</button>

																	<button
																		onClick={() =>
																			handleViewVendor(stall.vendorId)
																		}
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
																		onClick={() =>
																			handleViewStallDetails(stall)
																		}
																		title='Xem hồ sơ gian hàng'
																		className='cursor-pointer px-4 h-10 rounded-xl bg-white border-2 border-slate-100 text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-xs shadow-sm'
																	>
																		<Eye size={16} /> Chi tiết
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
									{filteredData.length === 0 &&
										(activeTab === 'stalls' || activeTab === 'pending') && (
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
								<div className='flex-1 min-h-0 bg-white border border-slate-200 rounded-4xl shadow-sm flex flex-col'>
									<div className='flex-1 overflow-auto no-scrollbar'>
										<table className='w-full text-left border-separate border-spacing-0'>
											<thead className='sticky top-0 z-10'>
												<tr className='bg-slate-50'>
													<th className='p-6 pl-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
														ID
													</th>
													<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
														Họ tên
													</th>
													<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
														Email
													</th>
													<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
														Vai trò
													</th>
													<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
														Trạng thái
													</th>
													<th className='p-6 text-right pr-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
														Quản lý
													</th>
												</tr>
											</thead>
											<tbody className='divide-y divide-slate-50 font-medium text-slate-700'>
												{(filteredData as Account[]).map((account) => (
													<tr
														key={account.id}
														className='hover:bg-slate-50/50 transition-colors group'
													>
														<td className='p-6 pl-10'>
															<span className='font-black text-slate-400 text-xs tracking-tighter'>
																#{account.id}
															</span>
														</td>
														<td className='p-6'>
															<div className='flex items-center gap-3'>
																<div className='w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black'>
																	{account.fullName.charAt(0)}
																</div>
																<div>
																	<div className='font-black text-slate-900 uppercase italic tracking-tight'>
																		{account.fullName}
																	</div>
																	<div className='text-[10px] text-slate-400 font-bold'>
																		@{account.userName}
																	</div>
																</div>
															</div>
														</td>
														<td className='p-6'>
															<div className='text-xs font-bold text-slate-600'>
																{account.email}
															</div>
														</td>
														<td className='p-6'>
															<div className='flex gap-1 flex-wrap'>
																{account.roles.map((r) => (
																	<span
																		key={r.name}
																		className='px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase tracking-widest text-slate-600 border border-slate-200'
																	>
																		{r.name}
																	</span>
																))}
															</div>
														</td>
														<td className='p-6'>
															<div className='flex items-center gap-2'>
																<div
																	className={`w-2 h-2 rounded-full ${account.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
																></div>
																<span
																	className={`text-[10px] font-black uppercase tracking-widest ${account.isActive ? 'text-emerald-500' : 'text-rose-500'}`}
																>
																	{account.isActive ? 'Hoạt động' : 'Bị khóa'}
																</span>
															</div>
														</td>
														<td className='p-6 text-right pr-10'>
															<div className='flex justify-end gap-2'>
																<button
																	onClick={() =>
																		handleViewVendor(Number(account.id))
																	}
																	className='cursor-pointer w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center'
																>
																	<Eye size={16} />
																</button>
																<button
																	onClick={() =>
																		handleToggleUserActive(account)
																	}
																	className={`cursor-pointer w-9 h-9 rounded-xl transition-all flex items-center justify-center ${account.isActive ? 'bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-600 hover:text-white'}`}
																>
																	{account.isActive ? (
																		<Trash2 size={16} />
																	) : (
																		<CheckCircle2 size={16} />
																	)}
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							)}

							{activeTab === 'qrcodes' && (
								<div className='flex-1 min-h-0 bg-white border border-slate-200 rounded-4xl shadow-sm flex flex-col'>
									<div className='flex-1 overflow-auto no-scrollbar'>
										<table className='w-full text-left border-separate border-spacing-0'>
											<thead className='sticky top-0 z-10'>
												<tr className='bg-slate-50'>
													<th className='p-6 pl-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
														ID
													</th>
													<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
														Tên Mã QR
													</th>
													<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
														Gian Hàng
													</th>
													<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] border-l border-slate-50'>
														Lượt quét
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
												{(filteredData as QRCode[]).map((qr) => (
													<tr
														key={qr.id}
														className='hover:bg-slate-50/50 transition-colors group'
													>
														<td className='p-6 pl-10'>
															<span className='font-black text-slate-400 text-xs tracking-tighter'>
																#{qr.id}
															</span>
														</td>
														<td className='p-6'>
															<div className='flex items-center gap-5'>
																<div className='w-16 h-16 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform'>
																	<QRCodeSVG
																		value={`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/qr/scan/${qr.code}`}
																		size={48}
																		level='H'
																	/>
																</div>
																<div>
																	<div className='font-black text-slate-900 uppercase italic tracking-tight'>
																		{qr.name}
																	</div>
																	<div className='text-[10px] font-mono text-indigo-400 font-bold'>
																		{qr.code.substring(0, 8)}...
																	</div>
																</div>
															</div>
														</td>
														<td className='p-6'>
															<div className='flex flex-col'>
																<div className='font-black text-slate-700 text-xs italic uppercase tracking-tight'>
																	{qr.stallName}
																</div>
																<button
																	onClick={() => {
																		const stall = stalls.find(
																			(s) => s.id === qr.stallId,
																		);
																		if (stall) handleViewStallDetails(stall);
																	}}
																	className='text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1 flex items-center gap-1 hover:text-indigo-700 cursor-pointer'
																>
																	<ExternalLink size={10} /> Chi tiết gian hàng
																</button>
															</div>
														</td>
														<td className='p-6 border-l border-slate-50'>
															<div className='inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full'>
																<RefreshCcw
																	size={10}
																	className='text-slate-400'
																/>
																<span className='font-black text-slate-600 text-[10px]'>
																	{qr.scanCount} Lượt
																</span>
															</div>
														</td>
														<td className='p-6'>
															<div className='flex items-center gap-2'>
																<div
																	className={`w-2 h-2 rounded-full ${qr.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse'}`}
																></div>
																<span
																	className={`text-[10px] font-black uppercase tracking-widest ${qr.isActive ? 'text-emerald-500' : 'text-rose-500'}`}
																>
																	{qr.isActive ? 'Đang chạy' : 'Đã ngắt'}
																</span>
															</div>
														</td>
														<td className='p-6 text-right pr-10'>
															<div className='flex justify-end gap-2'>
																<button
																	onClick={() => handleToggleQRActive(qr)}
																	className={`cursor-pointer w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm ${qr.isActive ? 'bg-slate-900 text-white hover:bg-rose-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
																	title={
																		qr.isActive
																			? 'Ngắt kết nối mã QR'
																			: 'Kích hoạt lại mã QR'
																	}
																>
																	<Power size={18} />
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							)}
						</>
					)}
				</main>
			</div>

			{isStallDetailOpen && selectedStall && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-6'>
					<div
						className='absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300'
						onClick={() => setIsStallDetailOpen(false)}
					></div>
					<div className='relative bg-white w-full max-w-5xl h-[85vh] rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col'>
						<div className='p-1 bg-indigo-600'></div>

						{/* Header */}
						<div className='p-8 pb-4 flex justify-between items-start border-b border-slate-50'>
							<div className='flex gap-6'>
								<div className='w-24 h-24 rounded-4xl overflow-hidden shadow-2xl rotate-3 shrink-0'>
									<img
										src={selectedStall.image}
										alt=''
										className='w-full h-full object-cover'
									/>
								</div>
								<div>
									<div className='flex items-center gap-3 mb-2'>
										<span className='bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100'>
											{selectedStall.category}
										</span>
										<span
											className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${selectedStall.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}
										>
											{selectedStall.isActive ? 'Kích hoạt' : 'Tạm khóa'}
										</span>
									</div>
									<h2 className='text-4xl font-black italic uppercase tracking-tighter text-slate-900'>
										{selectedStall.name}
									</h2>
									<div className='flex items-center gap-4 mt-2 text-slate-400 font-bold text-xs uppercase tracking-widest'>
										<span className='flex items-center gap-1.5'>
											<MapPin size={14} className='text-rose-500' />{' '}
											{selectedStall.latitude}, {selectedStall.longitude}
										</span>
										<span className='flex items-center gap-1.5'>
											<User size={14} className='text-orange-500' /> Chủ quán:{' '}
											{selectedVendor?.fullName || '...'}
										</span>
									</div>
								</div>
							</div>
							<button
								onClick={() => setIsStallDetailOpen(false)}
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
										{selectedStall.description ||
											'Không có mô tả cho gian hàng này.'}
									</div>
								</section>

								<section>
									<h3 className='font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-3 mb-4'>
										<Volume2 className='text-orange-500' /> Kịch bản audio
										thuyết minh
									</h3>
									<div className='bg-orange-50/50 p-6 rounded-4xl border border-orange-100 text-slate-700 font-medium leading-relaxed italic'>
										“{' '}
										{selectedStall.script ||
											'Chưa được thiết lập kịch bản audio.'}{' '}
										”
									</div>
								</section>
							</div>

							{/* Right: Menu List */}
							<section className='flex flex-col h-full'>
								<h3 className='font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-3 mb-4 shrink-0'>
									<Utensils className='text-emerald-500' /> Danh sách thực đơn (
									{stallMenu.length})
								</h3>
								<div className='flex-1 overflow-y-auto pr-2 no-scrollbar'>
									{stallMenuLoading ? (
										<div className='h-32 flex flex-col items-center justify-center gap-3 text-slate-400'>
											<div className='w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin'></div>
											<span className='font-black text-[9px] uppercase tracking-widest'>
												Đang tải menu...
											</span>
										</div>
									) : stallMenu.length === 0 ? (
										<div className='h-32 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-4xl text-slate-400 font-bold'>
											<p className='text-xs uppercase tracking-widest'>
												Gian hàng chưa có thực đơn
											</p>
										</div>
									) : (
										<div className='space-y-4'>
											{stallMenu.map((item) => (
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
									onClick={() => handleToggleActive(selectedStall)}
									className={`flex-1 ${selectedStall.isActive ? 'bg-rose-600' : 'bg-emerald-600'} text-white py-5 rounded-4xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer`}
								>
									{selectedStall.isActive
										? 'Hủy kích hoạt gian hàng'
										: 'Kích hoạt gian hàng'}
								</button>
								<button
									onClick={() => setIsStallDetailOpen(false)}
									className='px-10 bg-slate-900 text-white rounded-4xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all text-xs cursor-pointer'
								>
									Đóng
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Create QR Modal */}
			{isQRModalOpen && (
				<div className='fixed inset-0 z-100 flex items-center justify-center p-6'>
					<div
						className='absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300'
						onClick={() => setIsQRModalOpen(false)}
					></div>
					<div className='relative bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col'>
						<div className='p-1 bg-slate-900'></div>
						<div className='p-10'>
							<div className='flex justify-between items-center mb-8'>
								<h2 className='text-3xl font-black italic uppercase tracking-tight'>
									TẠO <span className='text-orange-600'>QR CODE</span> MỚI
								</h2>
								<button
									onClick={() => setIsQRModalOpen(false)}
									className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all'
								>
									<X size={20} />
								</button>
							</div>

							<form onSubmit={handleCreateQR} className='space-y-6'>
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
										onChange={(e) =>
											setNewQR({ ...newQR, name: e.target.value })
										}
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
										Hệ thống sẽ tự động tạo một mã UUID ngẫu nhiên để đảm bảo
										tính duy nhất cho QR Code này.
									</p>
								</div>

								<button
									type='submit'
									disabled={qrFormLoading}
									className='cursor-pointer w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50'
								>
									{qrFormLoading ? (
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
			)}

			{/* Vendor Info Modal */}
			{isVendorModalOpen && (
				<div className='fixed inset-0 z-100 flex items-center justify-center p-6'>
					<div
						className='absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300'
						onClick={() => setIsVendorModalOpen(false)}
					></div>
					<div className='relative bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300'>
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
