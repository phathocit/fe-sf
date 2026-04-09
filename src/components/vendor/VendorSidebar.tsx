import { PackageSearch, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Stall } from '../../types/stall.types';
import type { Account } from '../../types/auth.types';

interface VendorSidebarProps {
	stall: Stall;
	account: Account | null;
	activeTab: 'menu' | 'settings' | 'analytics';
	onTabChange?: (tab: 'menu' | 'settings' | 'analytics') => void;
	onLogout: () => void;
}

export default function VendorSidebar({
	stall,
	account,
	activeTab,
	onTabChange,
	onLogout,
}: VendorSidebarProps) {
	const navigate = useNavigate();

	const handleTabClick = (tab: 'menu' | 'settings') => {
		if (onTabChange) {
			onTabChange(tab);
		} else {
			navigate(`/vendor/${tab}`);
		}
	};

	return (
		<div className='w-80 bg-orange-600 text-white flex flex-col py-10 px-6 shadow-2xl relative z-20 overflow-hidden shrink-0'>
			<div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32'></div>

			<div className='px-2 mb-10 flex items-center gap-4 relative z-10'>
				<div className='w-16 h-16 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl rotate-3 shrink-0'>
					<img
						src={
							stall.image ||
							'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'
						}
						alt={stall.name}
						className='w-full h-full object-cover'
					/>
				</div>
				<div>
					<h2 className='text-xl font-black italic tracking-tight line-clamp-1'>
						{stall.name}
					</h2>
					<div className='text-[10px] font-black text-orange-200 uppercase tracking-widest mt-1 bg-black/10 px-2 py-0.5 rounded-md w-fit'>
						Chủ quán: {account?.fullName || 'N/A'}
					</div>
				</div>
			</div>

			<nav className='flex-1 space-y-2 relative z-10'>
				<button
					onClick={() => handleTabClick('menu')}
					className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs cursor-pointer ${
						activeTab === 'menu'
							? 'bg-white text-orange-600 shadow-xl scale-105'
							: 'text-white/70 hover:text-white hover:bg-white/10'
					}`}
				>
					<PackageSearch size={20} /> Quản lý Thực đơn
				</button>
				<button
					onClick={() => handleTabClick('settings')}
					className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs mt-4 cursor-pointer ${
						activeTab === 'settings'
							? 'bg-white text-orange-600 shadow-xl scale-105'
							: 'text-white/70 hover:text-white hover:bg-white/10'
					}`}
				>
					<Settings size={20} /> Cài đặt shop
				</button>
			</nav>

			<button
				onClick={onLogout}
				className='mt-auto w-full flex items-center gap-3 px-5 py-4 bg-black/20 text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs border border-white/10 rounded-2xl shadow-lg cursor-pointer'
			>
				<LogOut size={20} /> Đăng xuất
			</button>
		</div>
	);
}
