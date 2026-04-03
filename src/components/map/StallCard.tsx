import React from 'react';
import type { Stall } from '../../types/stall.types';
import { Navigation } from 'lucide-react';

interface StallCardProps {
	stall: Stall;
	isActive: boolean;
	isInside: boolean;
	distanceStr: string;
	t: (key: string, options?: any) => string;
	onClick: () => void;
}

const StallCard: React.FC<StallCardProps> = ({
	stall,
	isActive,
	isInside,
	distanceStr,
	t,
	onClick,
}) => (
	<div
		id={`stall-card-${stall.id}`}
		onClick={onClick}
		className={`p-5 rounded-3xl shadow-sm cursor-pointer transition-all flex gap-5 pr-12 relative group ${isActive ? 'bg-orange-50 bg-opacity-50 border-2 border-orange-500 scale-[1.02]' : isInside ? 'bg-green-50/50 border-2 border-green-400 shadow-lg' : 'bg-white border border-slate-100 hover:border-orange-500 hover:shadow-xl'}`}
	>
		<div
			className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform ${isActive ? 'ring-4 ring-orange-500/30' : ''}`}
		>
			<img
				src={
					stall.image ||
					'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'
				}
				className='w-full h-full object-cover'
				alt=''
			/>
		</div>
		<div className='flex-1 flex flex-col justify-center text-left'>
			<div
				className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-orange-600' : isInside ? 'text-green-600' : 'text-slate-500 group-hover:text-orange-600'}`}
			>
				{stall.category} {isInside && '📍 NEARBY'}
			</div>
			<h4 className='font-bold text-slate-900 leading-tight text-base group-hover:text-orange-600 transition-colors uppercase italic tracking-tight'>
				{stall.name}
			</h4>
			{distanceStr && (
				<div className='flex items-center gap-1 mt-1.5 text-slate-400 text-xs font-semibold'>
					<Navigation size={12} className='inline rotate-45' />{' '}
					{t('away_from_you', { distance: distanceStr })}
				</div>
			)}
		</div>
		<div
			className={`absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${isActive ? 'bg-orange-500 text-white' : isInside ? 'bg-green-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-500 group-hover:text-white'}`}
		>
			<Navigation size={18} />
		</div>
	</div>
);

export default React.memo(StallCard);
