import React from 'react';
import type { Stall } from '../../types/stall.types';

interface MapOverlayProps {
	stall: Stall | null;
	t: (key: string, options?: any) => string;
	onAction: (stall: Stall) => void;
}

const MapOverlay: React.FC<MapOverlayProps> = ({ stall, t, onAction }) => {
	if (!stall) return null;

	return (
		<div className='absolute bottom-10 left-1/2 -translate-x-1/2 z-[4000] w-max max-w-sm px-4'>
			<div className='bg-slate-900 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl animate-in fade-in zoom-in duration-300'>
				<div className='w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 border-orange-500'>
					<img
						src={
							stall.image ||
							'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'
						}
						className='w-full h-full object-cover'
						alt=''
					/>
				</div>
				<div className='flex-1'>
					<p className='text-[10px] font-black uppercase text-orange-400 tracking-widest mb-0.5'>
						Nearby POI 📍
					</p>
					<h5 className='font-bold text-sm leading-tight'>
						{t('geofence_alert', { name: stall.name })}
					</h5>
				</div>
				<button
					onClick={() => onAction(stall)}
					className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all'
				>
					{t('geofence_hint')}
				</button>
			</div>
		</div>
	);
};

export default MapOverlay;
