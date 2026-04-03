import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapIcon, ShieldAlert, StoreIcon, HomeIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
	const { t, i18n } = useTranslation('common');
	const { user, isAuthenticated, logout } = useAuth();
	const location = useLocation();

	const toggleLanguage = () => {
		i18n.changeLanguage(i18n.language.startsWith('en') ? 'vi' : 'en');
	};

	const isAdmin = user?.roles?.some((r) => r.name === 'ADMIN');
	const isVendor = user?.roles?.some((r) => r.name === 'VENDOR');

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col font-sans'>
			<header className='fixed w-full top-0 z-[100] px-4 py-4 md:px-8'>
				<div className='max-w-7xl mx-auto rounded-full bg-slate-950/95 backdrop-blur-2xl px-6 md:px-8 py-3 md:py-4 shadow-[0_20px_50px_-15px_rgba(234,88,12,0.4)] border border-white/10 flex justify-between items-center transition-all duration-300'>
					<Link to='/' className='cursor-pointer flex items-center gap-3 group'>
						<div className='w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/40 group-hover:scale-105 group-active:scale-95 transition-all -rotate-6 group-hover:rotate-0'>
							SF
						</div>
						<div className='flex flex-col'>
							<span className='font-black text-2xl leading-none italic uppercase tracking-tighter text-white group-hover:text-orange-500 transition-colors'>
								Street
								<span className='text-orange-500 group-hover:text-white'>
									Food
								</span>
							</span>
							<span className='text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1 hidden sm:block'>
								Vĩnh Khánh
							</span>
						</div>
					</Link>

					<nav className='hidden md:flex items-center gap-2 bg-slate-900 p-1.5 rounded-full border border-slate-800'>
						<Link
							to='/'
							className={`cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 font-bold uppercase tracking-widest text-xs ${location.pathname === '/' ? 'bg-orange-600 text-white shadow-md scale-105' : 'text-slate-400 hover:text-white'}`}
						>
							<HomeIcon size={16} /> {t('home')}
						</Link>
						<Link
							to='/map'
							className={`cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 font-bold uppercase tracking-widest text-xs ${location.pathname === '/map' ? 'bg-orange-600 text-white shadow-md scale-105' : 'text-slate-400 hover:text-white'}`}
						>
							<MapIcon size={16} /> {t('map')}
						</Link>
					</nav>

					<div className='flex items-center gap-4'>
						<div className='hidden lg:flex items-center gap-4 mr-4'>
							{isVendor && (
								<Link
									to='/vendor'
									className='cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-1.5'
								>
									<StoreIcon size={14} /> {t('for_vendor')}
								</Link>
							)}
							{isAdmin && (
								<Link
									to='/admin'
									className='cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5'
								>
									<ShieldAlert size={14} /> {t('admin')}
								</Link>
							)}
						</div>

						{isAuthenticated && (
							<div className='flex items-center gap-2'>
								<div className='w-10 h-10 rounded-full bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-xs shadow-lg'>
									{user?.fullName?.charAt(0) || 'U'}
								</div>
								<button
									onClick={logout}
									className='text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer'
								>
									Logout
								</button>
							</div>
						)}

						<button
							onClick={toggleLanguage}
							className='cursor-pointer w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-orange-600 transition-all font-black text-xs uppercase tracking-widest shadow-inner'
							title={i18n.language === 'vi' ? 'English' : 'Tiếng Việt'}
						>
							{t('switch_lang')}
						</button>
					</div>
				</div>
			</header>
			<div className='h-28 md:h-32'></div> {/* Spacer for fixed header */}
			<main className='flex-1 w-full relative'>
				<Outlet />
			</main>
			<footer className='relative bg-slate-950 text-white mt-auto overflow-hidden'>
				{/* Background Glow */}
				<div className='absolute top-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl'></div>
				<div className='absolute bottom-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl'></div>

				<div className='relative z-10 max-w-7xl mx-auto px-6 py-16 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-10'>
					<div className='flex-1'>
						<h2 className='text-3xl font-black italic uppercase tracking-tighter mb-4 flex items-center justify-center lg:justify-start gap-2'>
							<span className='text-orange-500'>Street</span>Food VIP
						</h2>
						<p className='text-slate-400 text-sm font-bold max-w-sm mx-auto lg:mx-0'>
							{t('footer_tagline')}
						</p>
					</div>

					<div className='flex gap-6 justify-center uppercase tracking-[0.2em] text-[10px] font-black'>
						<Link
							to='/'
							className='text-slate-300 hover:text-orange-500 transition-colors'
						>
							{t('home')}
						</Link>
						<Link
							to='/map'
							className='text-slate-300 hover:text-orange-500 transition-colors'
						>
							{t('map')}
						</Link>
						<Link
							to='/vendor'
							className='text-orange-600 hover:text-orange-400 transition-colors'
						>
							{t('for_vendor')}
						</Link>
						<Link
							to='/admin'
							className='text-red-500 hover:text-red-400 transition-colors'
						>
							{t('admin')}
						</Link>
					</div>

					<div className='flex-1 text-center lg:text-right'>
						<p className='text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]'>
							{t('copyright')}
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
