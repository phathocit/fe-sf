import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import stallApi from '../api/stallApi';
import type { Stall } from '../types/stall.types';
import VendorSidebar from '../components/vendor/VendorSidebar';
import VendorLoading from '../components/vendor/VendorLoading';
import VendorPending from '../components/vendor/VendorPending';
import { useAuth } from '../context/AuthContext';

export default function VendorLayout() {
	const { user: account, logout } = useAuth();
	const [stall, setStall] = useState<Stall | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isPending, setIsPending] = useState(false);
	const location = useLocation();

	useEffect(() => {
		if (account) {
			const fetchData = async () => {
				try {
					const stallRes = await stallApi.getByVendorId(Number(account.id));
					if (stallRes.result) {
						const s = stallRes.result;
						setStall(s);
						if (!s.isActive) {
							setIsPending(true);
						}
					}
				} catch (error) {
					console.error('Failed to fetch vendor stall:', error);
				} finally {
					setIsLoading(false);
				}
			};
			fetchData();
		}
	}, [account]);

	const handleLogout = () => {
		logout();
	};

	if (isLoading) return <VendorLoading />;
	if (isPending) return <VendorPending onLogout={handleLogout} />;
	
	if (!stall) {
		return (
			<div className='h-screen flex flex-col items-center justify-center bg-slate-950 p-10 text-center'>
				<h1 className='text-4xl font-black text-white italic uppercase tracking-tighter mb-4'>
					KHÔNG TÌM THẤY <span className='text-rose-500'>GIAN HÀNG</span>
				</h1>
				<p className='text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8'>
					Tài khoản này chưa được liên kết với bất kỳ gian hàng nào.
				</p>
				<button
					onClick={handleLogout}
					className='px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-2xl shadow-rose-600/20 cursor-pointer'
				>
					Đăng xuất
				</button>
			</div>
		);
	}

	// Xác định activeTab dựa trên pathname
	const getActiveTab = () => {
		if (location.pathname.includes('/vendor/settings')) return 'settings';
		if (location.pathname.includes('/vendor/analytics')) return 'analytics';
		return 'menu';
	};

	return (
		<div className='h-screen bg-slate-50 flex overflow-hidden'>
			<VendorSidebar
				stall={stall}
				account={account}
				activeTab={getActiveTab()}
				onLogout={handleLogout}
			/>

			<div className='flex-1 p-12 overflow-y-auto'>
				<Outlet context={{ stall, setStall }} />
			</div>
		</div>
	);
}
