import React from 'react';
import { Crosshair, MapPin, Navigation, Send, X } from 'lucide-react';
import type { Stall } from '../../types/stall.types';

interface GpsSimulatorProps {
	userLoc: [number, number] | null;
	onLocChange: (loc: [number, number]) => void;
	stalls: Stall[];
	isOpen: boolean;
	onClose: () => void;
}

const GpsSimulator: React.FC<GpsSimulatorProps> = ({
	userLoc,
	onLocChange,
	stalls,
	isOpen,
	onClose,
}) => {
	const [lat, setLat] = React.useState(userLoc?.[0].toString() || '');
	const [lng, setLng] = React.useState(userLoc?.[1].toString() || '');

	React.useEffect(() => {
		if (userLoc) {
			setLat(userLoc[0].toFixed(6));
			setLng(userLoc[1].toFixed(6));
		}
	}, [userLoc]);

	if (!isOpen) return null;

	const handleJump = (stall: Stall) => {
		const newLoc: [number, number] = [Number(stall.latitude), Number(stall.longitude)];
		onLocChange(newLoc);
	};

	const handleManualSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newLat = parseFloat(lat);
		const newLng = parseFloat(lng);
		if (!isNaN(newLat) && !isNaN(newLng)) {
			onLocChange([newLat, newLng]);
		}
	};

	return (
		<div className='fixed bottom-24 left-6 z-500 w-80 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300'>
			<div className='p-5 bg-slate-900 text-white flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<div className='p-1.5 bg-orange-500 rounded-lg'>
						<Navigation size={16} className='text-white' />
					</div>
					<span className='font-black uppercase tracking-widest text-xs italic'>
						GPS Simulator
					</span>
				</div>
				<button 
					onClick={onClose}
					className='p-1 hover:bg-white/10 rounded-full transition-colors'
				>
					<X size={18} />
				</button>
			</div>

			<div className='p-5 space-y-5'>
				<form onSubmit={handleManualSubmit} className='space-y-3'>
					<div className='grid grid-cols-2 gap-3'>
						<div className='space-y-1'>
							<label className='text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1'>Latitude</label>
							<input
								type='text'
								value={lat}
								onChange={(e) => setLat(e.target.value)}
								className='w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900'
								placeholder='10.76...'
							/>
						</div>
						<div className='space-y-1'>
							<label className='text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1'>Longitude</label>
							<input
								type='text'
								value={lng}
								onChange={(e) => setLng(e.target.value)}
								className='w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900'
								placeholder='106.70...'
							/>
						</div>
					</div>
					<button
						type='submit'
						className='w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg active:scale-95'
					>
						<Send size={14} /> Teleport Now
					</button>
				</form>

				<div className='space-y-3'>
					<div className='flex items-center justify-between ml-1'>
						<span className='text-[10px] font-black uppercase text-slate-400 tracking-wider'>
							Jump to Stall (POI)
						</span>
						<span className='text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100'>
							{stalls.length} POIs
						</span>
					</div>
					<div className='max-h-52 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar no-scrollbar'>
						{stalls.map((stall) => (
							<button
								key={stall.id}
								onClick={() => handleJump(stall)}
								className='w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-2xl transition-all group'
							>
								<div className='w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-200 shrink-0'>
									<img src={stall.image || ''} className='w-full h-full object-cover' />
								</div>
								<div className='flex-1 text-left'>
									<div className='text-[10px] font-black text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors uppercase italic'>
										{stall.name}
									</div>
									<div className='text-[9px] font-bold text-slate-400'>
										{stall.latitude.slice(0, 7)}, {stall.longitude.slice(0, 7)}
									</div>
								</div>
								<div className='p-2 rounded-lg bg-slate-50 group-hover:bg-orange-50 text-slate-400 group-hover:text-orange-500 transition-all'>
									<MapPin size={14} />
								</div>
							</button>
						))}
					</div>
				</div>
			</div>
			
			<div className='p-4 bg-slate-50 border-t border-slate-200'>
				<button 
					onClick={() => {
						if (navigator.geolocation) {
							navigator.geolocation.getCurrentPosition((pos) => {
								onLocChange([pos.coords.latitude, pos.coords.longitude]);
							});
						}
					}}
					className='w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors'
				>
					<Crosshair size={14} /> Re-sync to Real GPS
				</button>
			</div>
		</div>
	);
};

export default GpsSimulator;
