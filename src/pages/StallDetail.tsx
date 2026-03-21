import { useParams, Link } from 'react-router-dom';
import { stallsData } from '../data/mockData';
import { MapPin, Star, ChevronLeft, ImageOff, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StallDetail() {
	const { t } = useTranslation('stall');
	const { id } = useParams();
	const stall = stallsData.find((s) => s.id === id);

	if (!stall) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50'>
				<div className='w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6'>
					<ImageOff size={48} />
				</div>
				<h2 className='text-3xl md:text-5xl font-black text-slate-800 mb-4 italic tracking-tighter'>
					{t('error_404')}
				</h2>
				<p className='text-slate-500 font-bold mb-8'>{t('not_found')}</p>
				<Link
					to='/'
					className='cursor-pointer inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-orange-500 hover:-translate-y-1 shadow-xl shadow-orange-500/30 transition-all active:scale-95 group'
				>
					<ChevronLeft
						size={20}
						className='group-hover:-translate-x-1 transition-transform'
					/>{' '}
					{t('back_home')}
				</Link>
			</div>
		);
	}

	return (
		<div className='min-h-[calc(100vh-64px)] bg-gray-50 pb-20'>
			{/* Hero Header */}
			<div className='relative w-full h-80 sm:h-96 md:h-100'>
				<img
					src={stall.image}
					alt={stall.name}
					className='w-full h-full object-cover'
				/>
				<div className='absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent'></div>

				{/* Nút Back To Home nổi bần bật */}
				<div className='absolute top-6 left-6 md:top-10 md:left-10 z-20'>
					<Link
						to='/'
						className='cursor-pointer inline-flex items-center gap-2 bg-white text-slate-900 font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-full shadow-[0_10px_40px_-5px_rgba(0,0,0,0.5)] border border-white/50 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all active:scale-95 group'
					>
						<ChevronLeft
							size={18}
							className='group-hover:-translate-x-1 transition-transform'
						/>
						<span className='hidden sm:inline'>{t('back_home')}</span>
					</Link>
				</div>

				<div className='absolute bottom-0 left-0 w-full p-6 md:p-10 max-w-7xl mx-auto'>
					<div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
						<div>
							<div className='inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-3'>
								{stall.category}
							</div>
							<h1 className='text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg mb-2'>
								{stall.name}
							</h1>
							<div className='flex flex-col gap-1.5 mt-3'>
								<p className='text-white/90 text-sm md:text-base font-medium max-w-2xl flex items-start sm:items-center gap-2 m-0 bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm'>
									<MapPin
										size={16}
										className='text-orange-400 shrink-0 mt-0.5 sm:mt-0'
									/>{' '}
									{stall.address}
								</p>
								<p className='text-white/90 text-sm md:text-base font-medium max-w-2xl flex items-center gap-2 m-0 bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm'>
									<Clock size={16} className='text-yellow-400 shrink-0' />{' '}
									{t('opening_hours', { hours: stall.operatingHours })}
								</p>
							</div>
						</div>
						<div className='flex flex-col sm:flex-row items-stretch gap-3 mt-4 md:mt-0 w-full md:w-auto h-full'>
							<Link
								to={`/map?stallId=${stall.id}`}
								className='cursor-pointer bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/30 px-5 py-4 rounded-2xl flex items-center justify-center sm:justify-start gap-3 transition-all active:scale-95 border border-orange-400/50 group flex-1'
							>
								<div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0'>
									<MapPin size={24} className='text-white' />
								</div>
								<div className='text-left flex flex-col justify-center'>
									<div className='text-2xl font-black leading-none tracking-tight'>
										{t('map_btn')}
									</div>
									<div className='text-white/80 text-[10px] sm:text-xs font-medium uppercase mt-1'>
										{t('map_subtitle')}
									</div>
								</div>
							</Link>

							<div className='bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-4 rounded-2xl flex items-center justify-center sm:justify-start gap-3 text-white flex-1'>
								<div className='w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shrink-0'>
									<Star size={24} fill='currentColor' />
								</div>
								<div className='text-left flex flex-col justify-center'>
									<div className='text-3xl font-black leading-none'>
										{stall.rating}
									</div>
									<div className='text-white/60 text-[10px] sm:text-xs font-medium uppercase mt-1'>
										{t('rating_title')}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className='max-w-7xl mx-auto px-6 py-10 mt-[-2rem] relative z-10'>
				<div className='bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 mb-10'>
					<h3 className='text-xl font-black text-gray-800 mb-3 flex items-center gap-2'>
						<span className='w-2 h-8 bg-orange-500 rounded-full block'></span>
						{t('description_title')}
					</h3>
					<p className='text-gray-600 leading-relaxed text-lg'>
						{stall.description}
					</p>
				</div>

				<h3 className='text-3xl font-black text-gray-900 mb-8 flex items-center gap-3'>
					{t('menu_title')}
					<span className='bg-orange-100 text-orange-600 text-sm font-bold px-3 py-1 rounded-full'>
						{t('menu_count', { count: stall.menu.length })}
					</span>
				</h3>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{stall.menu.map((item) => (
						<div
							key={item.id}
							className='bg-white rounded-2xl flex overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 group'
						>
							<div className='w-1/3 min-w-[120px] bg-gray-100 overflow-hidden relative'>
								{item.image ? (
									<img
										src={item.image}
										alt={item.name}
										className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
									/>
								) : (
									<div className='w-full h-full flex items-center justify-center text-gray-300'>
										<ImageOff size={32} />
									</div>
								)}
							</div>
							<div className='p-5 flex-1 flex flex-col justify-center'>
								<h4 className='font-bold text-lg text-gray-800 mb-1 group-hover:text-orange-600 transition-colors'>
									{item.name}
								</h4>
								{item.description && (
									<p className='text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed'>
										{item.description}
									</p>
								)}
								<div className='mt-auto font-black text-orange-600 text-xl flex items-end'>
									{item.price.toLocaleString('vi-VN')}{' '}
									<span className='text-sm font-bold ml-1 text-gray-400 mb-1'>
										{t('currency')}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
