import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar, { type AdminTab } from '../components/admin/AdminSidebar';
import { Search, QrCode } from 'lucide-react';

interface AdminLayoutProps {
	children: ReactNode;
	title: string;
	subtitle: string;
	searchPlaceholder: string;
	searchValue: string;
	onSearchChange: (value: string) => void;
	showCreateQR?: boolean;
	onCreateQR?: () => void;
}

export default function AdminLayout({
	children,
	title,
	subtitle,
	searchPlaceholder,
	searchValue,
	onSearchChange,
	showCreateQR,
	onCreateQR,
}: AdminLayoutProps) {
	const { logout } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const activeTab = (location.pathname.split('/').pop() ||
		'stalls') as AdminTab;

	const handleTabChange = (tab: AdminTab) => {
		navigate(`/admin/${tab}`);
	};

	return (
		<div className='h-screen bg-slate-50 flex overflow-hidden'>
			<AdminSidebar
				activeTab={activeTab}
				onTabChange={handleTabChange}
				onLogout={logout}
			/>

			{/* Main Content */}
			<div className='flex-1 flex flex-col h-full overflow-hidden'>
				{/* Top Header */}
				<header className='bg-white border-b border-slate-200 px-10 py-6 flex justify-between items-center shrink-0'>
					<div>
						<h1 className='text-3xl font-black text-slate-900 italic tracking-tight uppercase'>
							{title}
						</h1>
						<p className='text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1'>
							{subtitle}
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
								placeholder={searchPlaceholder}
								className='bg-slate-100 border-none px-12 py-3 rounded-2xl text-sm font-bold w-64 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none'
								value={searchValue}
								onChange={(e) => onSearchChange(e.target.value)}
							/>
						</div>
						{showCreateQR && (
							<button
								onClick={onCreateQR}
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
					{children}
				</main>
			</div>
		</div>
	);
}
