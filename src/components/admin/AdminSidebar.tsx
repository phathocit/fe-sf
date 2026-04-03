import { Store, Clock, Users, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type AdminTab = 'stalls' | 'pending' | 'users' | 'analytics';

interface AdminSidebarProps {
	activeTab: AdminTab;
	onTabChange?: (tab: AdminTab) => void;
	onLogout: () => void;
}

export default function AdminSidebar({
	activeTab,
	onTabChange,
	onLogout,
}: AdminSidebarProps) {
	const navigate = useNavigate();

	const handleTabClick = (tab: AdminTab) => {
		if (onTabChange) {
			onTabChange(tab);
		} else {
			navigate(`/admin/${tab}`);
		}
	};

	return (
		<div className='w-72 bg-slate-950 text-white flex flex-col py-8 px-6 shadow-2xl z-20 shrink-0'>
			<div className='mb-10 px-2'>
				<div className='w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/40 mb-4 rotate-3'>
					SF
				</div>
				<div className='text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-1'>
					Quản Trị Hệ Thống
				</div>
				<h2 className='text-2xl font-black italic tracking-tight'>
					Admin <span className='text-orange-500'>Panel</span>
				</h2>
			</div>

			<nav className='flex-1 space-y-1.5'>
				<button
					onClick={() => handleTabClick('stalls')}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${
						activeTab === 'stalls'
							? 'bg-white/10 border border-white/10 text-white shadow-xl'
							: 'text-slate-400 hover:text-white hover:bg-white/5'
					}`}
				>
					<Store
						size={20}
						className={activeTab === 'stalls' ? 'text-orange-500' : ''}
					/>{' '}
					Quản lý Gian hàng
				</button>
				<button
					onClick={() => handleTabClick('pending')}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${
						activeTab === 'pending'
							? 'bg-white/10 border border-white/10 text-white shadow-xl'
							: 'text-slate-400 hover:text-white hover:bg-white/5'
					}`}
				>
					<Clock
						size={20}
						className={activeTab === 'pending' ? 'text-orange-500' : ''}
					/>{' '}
					Duyệt gian hàng mới
				</button>
				<button
					onClick={() => handleTabClick('users')}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${
						activeTab === 'users'
							? 'bg-white/10 border border-white/10 text-white shadow-xl'
							: 'text-slate-400 hover:text-white hover:bg-white/5'
					}`}
				>
					<Users
						size={20}
						className={activeTab === 'users' ? 'text-orange-500' : ''}
					/>{' '}
					Quản lý Người dùng
				</button>
				<button
					onClick={() => handleTabClick('analytics')}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${
						activeTab === 'analytics'
							? 'bg-white/10 border border-white/10 text-white shadow-xl'
							: 'text-slate-400 hover:text-white hover:bg-white/5'
					}`}
				>
					<Activity
						size={20}
						className={activeTab === 'analytics' ? 'text-orange-500' : ''}
					/>{' '}
					Thống kê Giao dịch
				</button>
			</nav>

			<div className='mt-auto pt-6 border-t border-white/10'>
				<button
					onClick={onLogout}
					className='w-full flex items-center gap-3 px-5 py-4 bg-white/5 text-slate-300 hover:bg-rose-600 hover:text-white transition-all font-black uppercase tracking-widest text-xs border border-white/5 rounded-2xl shadow-lg cursor-pointer'
				>
					<LogOut size={20} /> Đăng xuất
				</button>
			</div>
		</div>
	);
}
