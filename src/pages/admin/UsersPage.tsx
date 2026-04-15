import { useState, useEffect, useMemo } from 'react';
import { Eye, CheckCircle2, Trash2 } from 'lucide-react';
import accountApi from '../../api/accountApi';
import { type Account } from '../../types/auth.types';
import { toast } from 'react-toastify';
import AdminLayout from '../../layouts/AdminLayout';
import VendorInfoModal from '../../components/admin/modals/VendorInfoModal';

export default function UsersPage() {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
	const [selectedVendor, setSelectedVendor] = useState<Account | null>(null);
	const [vendorLoading, setVendorLoading] = useState(false);

	useEffect(() => {
		fetchAccounts();
	}, []);

	const fetchAccounts = async () => {
		setLoading(true);
		try {
			const res = await accountApi.getAll();
			// Filter out admins
			setAccounts(
				res.result.filter(
					(a: Account) => !a.roles.some((r) => r.name === 'ADMIN'),
				),
			);
		} catch {
			toast.error('Không thể tải danh sách tài khoản');
		} finally {
			setLoading(false);
		}
	};

	const filteredData = useMemo(() => {
		const q = searchQuery.toLowerCase();
		return accounts.filter(
			(a) =>
				a.fullName.toLowerCase().includes(q) ||
				a.userName.toLowerCase().includes(q) ||
				a.email.toLowerCase().includes(q),
		);
	}, [accounts, searchQuery]);

	const handleToggleActive = async (account: Account) => {
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
				toast.success('Thao tác thành công!');
			}
		} catch {
			toast.error('Thao tác thất bại!');
		}
	};

	const handleViewVendor = async (vendorId: number) => {
		setVendorLoading(true);
		setIsVendorModalOpen(true);
		try {
			const res = await accountApi.getById(vendorId);
			setSelectedVendor(res.result);
		} catch {
			toast.error('Không thể lấy thông tin');
			setIsVendorModalOpen(false);
		} finally {
			setVendorLoading(false);
		}
	};

	return (
		<AdminLayout
			title='Quản Lý Tài Khoản'
			subtitle={`Tổng cộng ${accounts.length} người dùng hệ thống`}
			searchPlaceholder='Tìm kiếm người dùng...'
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
							{loading ? (
								<tr>
									<td colSpan={6} className='p-20 text-center'>
										<div className='inline-block w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin'></div>
									</td>
								</tr>
							) : filteredData.length === 0 ? (
								<tr>
									<td colSpan={6} className='p-20 text-center text-slate-400'>
										<p className='font-black uppercase tracking-widest text-xs'>
											Không tìm thấy người dùng
										</p>
									</td>
								</tr>
							) : (
								filteredData.map((account) => (
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
													onClick={() => handleViewVendor(Number(account.id))}
													className='cursor-pointer w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center'
												>
													<Eye size={16} />
												</button>
												<button
													onClick={() => handleToggleActive(account)}
													className={`cursor-pointer w-9 h-9 rounded-xl transition-all flex items-center justify-center ${account.isActive ? 'bg-rose-50 text-rose-500 hover:bg-rose-600' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-600'}`}
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
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			<VendorInfoModal
				vendor={selectedVendor}
				loading={vendorLoading}
				isOpen={isVendorModalOpen}
				onClose={() => setIsVendorModalOpen(false)}
			/>
		</AdminLayout>
	);
}
