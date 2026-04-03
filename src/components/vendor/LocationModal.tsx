import React, { useState, useEffect } from 'react';
import { X, MapPin, Search, Check, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Stall } from '../../types/stall.types';

interface LocationModalProps {
	tmpStall: Partial<Stall>;
	onClose: () => void;
	onStallChange: (data: Partial<Stall>) => void;
}

const pickerIcon = L.divIcon({
	html: `<div class="w-10 h-10 bg-orange-600 border-4 border-white rounded-full shadow-2xl flex items-center justify-center text-white font-bold animate-bounce">📍</div>`,
	className: 'picker-marker',
	iconSize: [40, 40],
	iconAnchor: [20, 20],
});

function LocationMarker({
	coords,
	onChange,
}: {
	coords: [number, number];
	onChange: (lat: number, lng: number) => void;
}) {
	useMapEvents({
		click(e) {
			onChange(e.latlng.lat, e.latlng.lng);
		},
	});
	return coords ? <Marker position={coords} icon={pickerIcon} /> : null;
}

function RecenterMapHandler({ coords }: { coords: [number, number] }) {
	const map = useMap();
	useEffect(() => {
		map.setView(coords, 17);
	}, [coords, map]);
	return null;
}

export default function LocationModal({
	tmpStall,
	onClose,
	onStallChange,
}: LocationModalProps) {
	const [initialCoords] = useState<[number, number]>(tmpStall.coordinates as [number, number]);
	const [searchQuery, setSearchQuery] = useState('');
	const [suggestions, setSuggestions] = useState<any[]>([]);
	const [isGeocoding, setIsGeocoding] = useState(false);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchQuery.length >= 3) {
				fetchSuggestions(searchQuery);
			} else {
				setSuggestions([]);
			}
		}, 1000); // 1 second debounce

		return () => clearTimeout(delayDebounceFn);
	}, [searchQuery]);

	const fetchSuggestions = async (query: string) => {
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					query,
				)}&limit=5&addressdetails=1&countrycodes=vn`,
				{
					headers: {
						'Accept-Language': 'vi',
					},
				},
			);
			if (res.status === 429) {
				console.warn('Nominatim rate limit hit');
				return;
			}
			const data = await res.json();
			setSuggestions(data);
		} catch (err) {
			console.error(err);
		}
	};

	const handleReset = () => {
		onStallChange({ ...tmpStall, coordinates: initialCoords });
	};

	const handleReverseGeocode = async () => {
		setIsGeocoding(true);
		try {
			const [lat, lng] = tmpStall.coordinates as [number, number];
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
			);
			const data = await res.json();
			if (data.display_name) {
				onStallChange({ ...tmpStall, address: data.display_name } as any);
			}
		} catch (error) {
			console.error('Geocoding error', error);
		} finally {
			setIsGeocoding(false);
		}
	};

	return (
		<div className='fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10'>
			<div className='absolute inset-0 bg-slate-950/80 backdrop-blur-md'></div>
			<div className='relative bg-white w-full max-w-6xl h-full max-h-[850px] rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 border border-white/20'>
				
				{/* Left Side: Map UI */}
				<div className='flex-1 relative order-2 md:order-1 h-2/3 md:h-full min-h-[300px]'>
					<MapContainer
						center={tmpStall.coordinates as [number, number]}
						zoom={17}
						className='w-full h-full'
					>
						<TileLayer url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' />
						<LocationMarker
							coords={tmpStall.coordinates as [number, number]}
							onChange={(lat, lng) => onStallChange({ ...tmpStall, coordinates: [lat, lng] })}
						/>
						<RecenterMapHandler coords={tmpStall.coordinates as [number, number]} />
					</MapContainer>

					{/* Search Overlay */}
					<div className='absolute top-6 left-6 right-6 z-[7000] md:w-[400px]'>
						<div className='bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-200 focus-within:border-orange-500 transition-all'>
							<Search className='text-slate-400 ml-3' size={20} />
							<input
								type='text'
								placeholder='Tìm kiếm địa chỉ nhanh...'
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									fetchSuggestions(e.target.value);
								}}
								className='flex-1 bg-transparent border-none py-3 pr-4 outline-none text-sm font-bold text-slate-800'
							/>
						</div>

						{suggestions.length > 0 && (
							<div className='mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'>
								{suggestions.map((s, idx) => (
									<button
										key={idx}
										className='w-full text-left px-6 py-4 hover:bg-orange-50 border-b border-slate-50 last:border-none transition-colors group cursor-pointer'
										onClick={() => {
											onStallChange({
												...tmpStall,
												coordinates: [parseFloat(s.lat), parseFloat(s.lon)],
											});
											setSuggestions([]);
											setSearchQuery('');
										}}
									>
										<div className='flex items-center gap-2 mb-1'>
											<span className='text-[10px] font-black uppercase text-orange-600 bg-orange-100 px-2 py-0.5 rounded'>
												{s.type || 'Địa điểm'}
											</span>
										</div>
										<p className='text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed'>
											{s.display_name}
										</p>
									</button>
								))}
							</div>
						)}
					</div>
					
					{/* Map Attribution Placeholder or Legend */}
					<div className='absolute bottom-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white text-[10px] font-bold text-slate-500 pointer-events-none'>
						Click bất kỳ đâu trên bản đồ để chọn vị trí mới
					</div>
				</div>

				{/* Right Side: Details & Confirm */}
				<div className='w-full md:w-[400px] bg-slate-50 border-l border-slate-100 flex flex-col order-1 md:order-2 p-8'>
					<div className='flex justify-between items-start mb-8'>
						<div>
							<div className='flex items-center gap-2 mb-2'>
								<div className='w-2 h-2 bg-orange-500 rounded-full animate-pulse'></div>
								<span className='text-[10px] font-black text-orange-500 uppercase tracking-widest'>
									Map Confirmation
								</span>
							</div>
							<h2 className='text-2xl font-black italic text-slate-900 uppercase tracking-tighter'>
								XÁC NHẬN <span className='text-orange-600'>VỊ TRÍ</span>
							</h2>
						</div>
						<div className='flex gap-2 shrink-0'>
							<button
								onClick={handleReset}
								className='bg-orange-50 text-orange-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm cursor-pointer'
							>
								Reset 🔄
							</button>
							<button
								onClick={onClose}
								className='w-10 h-10 rounded-full bg-white border border-slate-200 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm'
							>
								<X size={20} />
							</button>
						</div>
					</div>

					<div className='flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar'>
						<div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100'>
							<label className='block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4'>
								Tên hiển thị hiện tại
							</label>
							<p className='font-black text-slate-900 text-lg italic'>
								{tmpStall.name || 'Gian hàng chưa đặt tên'}
							</p>
						</div>

						<div className='bg-orange-500 p-6 rounded-3xl shadow-xl shadow-orange-500/20 text-white relative overflow-hidden group'>
							<div className='absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform'>
								<MapPin size={120} />
							</div>
							<label className='block text-[10px] font-black uppercase tracking-widest text-orange-200 mb-4'>
								Tọa độ GPS hiện tại
							</label>
							<div className='flex gap-6'>
								<div>
									<p className='text-[10px] font-bold text-orange-200 uppercase mb-1'>Latitude</p>
									<p className='text-xl font-black tabular-nums'>
										{tmpStall.coordinates ? tmpStall.coordinates[0].toFixed(6) : '0.000000'}
									</p>
								</div>
								<div className='w-px h-10 bg-white/20'></div>
								<div>
									<p className='text-[10px] font-bold text-orange-200 uppercase mb-1'>Longitude</p>
									<p className='text-xl font-black tabular-nums'>
										{tmpStall.coordinates ? tmpStall.coordinates[1].toFixed(6) : '0.000000'}
									</p>
								</div>
							</div>
						</div>

						<div className='space-y-4'>
							<div className='flex justify-between items-center px-2'>
								<label className='block text-[10px] font-black uppercase tracking-widest text-slate-400'>
									Địa chỉ chi tiết
								</label>
								<button 
									onClick={handleReverseGeocode}
									disabled={isGeocoding}
									className='text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 uppercase transition-all disabled:opacity-50'
								>
									{isGeocoding ? 'Đang lấy...' : 'Lấy từ GPS 📍'}
								</button>
							</div>
							<textarea
								className='w-full bg-white border border-slate-200 p-5 rounded-3xl text-sm font-bold text-slate-600 leading-relaxed min-h-[120px] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all'
								value={(tmpStall as any).address || ''}
								onChange={(e) => onStallChange({ ...tmpStall, address: e.target.value } as any)}
								placeholder='Địa chỉ hiển thị trên bản đồ...'
							/>
						</div>
						
						<div className='flex items-start gap-4 p-5 bg-orange-50 rounded-2xl border border-orange-100'>
							<Info className='text-orange-500 shrink-0' size={20} />
							<p className='text-[10px] font-bold text-orange-700 leading-relaxed uppercase'>
								Ghim vị trí chính xác sẽ giúp khách hàng dễ dàng tìm thấy gian hàng của bạn hơn trên bản đồ chung.
							</p>
						</div>
					</div>

					<button
						onClick={onClose}
						className='w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-3 mt-8 cursor-pointer group'
					>
						XÁC NHẬN VÀ LƯU <Check size={20} className='group-hover:scale-125 transition-transform' />
					</button>
				</div>
			</div>
		</div>
	);
}
