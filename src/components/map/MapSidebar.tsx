import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Search, Filter } from 'lucide-react';
import StallCard from './StallCard';
import type { Stall } from '../../types/stall.types';

interface MapSidebarProps {
	stalls: Stall[];
	filteredStalls: Stall[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
	categories: string[];
	activeStallId: number | null;
	onStallClick: (stall: Stall) => void;
	isInsideGeofence: (coords: [number, number]) => boolean;
	getDistanceStr: (coords: [number, number]) => string;
	getCoords: (stall: Stall) => [number, number];
	locateUser: () => void;
	geoError: string;
	t: (key: string, options?: any) => string;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
	filteredStalls,
	searchQuery,
	onSearchChange,
	selectedCategory,
	onCategoryChange,
	categories,
	activeStallId,
	onStallClick,
	isInsideGeofence,
	getDistanceStr,
	getCoords,
	locateUser,
	geoError,
	t,
}) => {
	return (
		<div className='w-full md:w-100 bg-white shadow-2xl z-1000 flex flex-col h-full relative'>
			<div className='p-8 bg-slate-900 text-white shadow-xl relative overflow-hidden shrink-0'>
				<div className='absolute -top-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-20'></div>

				<Link
					to='/'
					className='cursor-pointer inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors font-black uppercase tracking-widest text-[10px] sm:text-xs mb-6 w-max relative z-10'
				>
					<ArrowLeft size={16} /> {t('back_home')}
				</Link>

				<h2 className='text-3xl font-black flex items-center gap-3 mb-2 tracking-tighter italic uppercase relative z-10'>
					<MapPin size={28} className='text-orange-500 shrink-0' /> FOOD-MAP
					VIP
				</h2>
				<p className='text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 relative z-10'>
					{t('discover_street_food')}
				</p>

				<button
					onClick={locateUser}
					className='cursor-pointer w-full bg-white text-slate-900 font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 text-sm uppercase tracking-widest'
				>
					<Navigation size={18} /> {t('your_location')}
				</button>

				{geoError && (
					<p className='text-xs text-red-400 mt-4 text-center font-medium bg-red-400/10 py-2 rounded-lg'>
						{geoError}
					</p>
				)}
			</div>

			<div className='flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative z-10 no-scrollbar'>
				<div className='space-y-4'>
					<div className='relative group'>
						<Search
							className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors'
							size={18}
						/>
						<input
							type='text'
							placeholder={t('search_placeholder')}
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className='w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm group-hover:shadow-md'
						/>
					</div>

					<div className='flex gap-2 overflow-x-auto no-scrollbar pb-1 items-center'>
						<div className='shrink-0 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400'>
							<Filter size={16} />
						</div>
						{categories.map((cat) => (
							<button
								key={cat}
								onClick={() => onCategoryChange(cat)}
								className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
									selectedCategory === cat
										? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
										: 'bg-white text-slate-500 border border-slate-200 hover:border-orange-500 hover:text-orange-500 shadow-sm'
								}`}
							>
								{cat === 'All' ? t('all_categories') : cat}
							</button>
						))}
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<div className='w-2 h-6 bg-orange-500 rounded-full'></div>
					<div className='text-sm font-black text-slate-800 uppercase tracking-widest'>
						{filteredStalls.length > 0
							? t('nearby_stalls', { count: filteredStalls.length })
							: t('no_results')}
					</div>
				</div>
				{filteredStalls.map((stall) => (
					<StallCard
						key={stall.id}
						stall={stall}
						isActive={activeStallId === stall.id}
						isInside={isInsideGeofence(getCoords(stall))}
						distanceStr={getDistanceStr(getCoords(stall))}
						t={t}
						onClick={() => onStallClick(stall)}
					/>
				))}
			</div>
		</div>
	);
};

export default MapSidebar;
