import { useEffect, useState, useRef } from 'react';
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMap,
	Polyline,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { stallsData, type Stall } from '../data/mockData';
import L from 'leaflet';
import {
	Navigation,
	MapPin,
	ArrowLeft,
	X,
	Utensils,
	Car,
	Bike,
	Footprints,
	Search,
	Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom User Icon
const userIcon = L.divIcon({
	html: `<div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-2xl pulse-animation"></div>`,
	className: 'user-marker',
	iconSize: [24, 24],
	iconAnchor: [12, 12],
});

// Shop Icon generator
const createStallIcon = (stall: Stall, isActive: boolean = false) => {
	return L.divIcon({
		html: `
      <div class="relative">
        <div class="w-12 h-12 rounded-2xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] ${isActive ? 'border-[3px] border-orange-600 scale-125' : 'border-2 border-orange-400/50'} p-1 transition-all duration-300 hover:scale-125 overflow-hidden flex items-center justify-center relative z-10">
          <img src="${stall.image}" class="w-full h-full object-cover rounded-xl" />
        </div>
        ${isActive ? `<div class="absolute -top-2 -right-2 w-6 h-6 bg-orange-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg animate-bounce z-20 font-black text-[10px]">📍</div>` : ''}
      </div>
    `,
		className: `shop-marker ${isActive ? 'active-marker' : ''}`,
		iconSize: [48, 48],
		iconAnchor: [24, 24],
		popupAnchor: [0, -20],
	});
};

function MapController({ center }: { center: [number, number] }) {
	const map = useMap();
	useEffect(() => {
		map.flyTo(center, 17, { animate: true, duration: 1.5 });
	}, [center, map]);
	return null;
}

export default function MapPage() {
	const defaultCenter: [number, number] = [10.7601, 106.7042]; // Center of Vĩnh Khánh, District 4
	const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
	const [geoError, setGeoError] = useState('');
	const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
	const [activeStallId, setActiveStallId] = useState<string | null>(null);
	const [selectedStallForModal, setSelectedStallForModal] =
		useState<Stall | null>(null);
	const [activeRoute, setActiveRoute] = useState<[number, number][] | null>(
		null,
	);
	const [travelMode, setTravelMode] = useState<'car' | 'bike' | 'walk'>('bike');
	const [routeInfo, setRouteInfo] = useState<{
		distance: number;
		duration: number;
	} | null>(null);
	const [isRouting, setIsRouting] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('All');
	const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

	const categories = ['All', ...new Set(stallsData.map((s) => s.category))];

	const filteredStalls = stallsData.filter((stall) => {
		const matchesSearch = stall.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategory === 'All' || stall.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const getDistanceStr = (coords: [number, number]) => {
		if (!userLoc) return '';
		const d = L.latLng(userLoc).distanceTo(L.latLng(coords));
		return d > 1000 ? `${(d / 1000).toFixed(1)} km` : `${Math.round(d)} m`;
	};

	const fetchRoute = async (
		start: [number, number],
		end: [number, number],
		mode: 'car' | 'bike' | 'walk',
	) => {
		setIsRouting(true);
		try {
			// OSRM profiles: car, bicycle, foot
			// In HCMC/District 4, motorbikes usually follow car routes but are faster in traffic
			const profile = mode === 'car' ? 'car' : mode === 'bike' ? 'car' : 'foot';
			const url = `https://router.project-osrm.org/route/v1/${profile}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

			const response = await fetch(url);
			const data = await response.json();

			if (data.routes && data.routes.length > 0) {
				const route = data.routes[0];
				const coords = route.geometry.coordinates.map((c: [number, number]) => [
					c[1],
					c[0],
				]);

				// Traffic & Base Time adjustment for District 4, HCMC
				let duration = route.duration; // seconds
				if (mode === 'car') {
					duration = duration * 1.5 + 300; // 1.5x traffic + 5 mins parking
				} else if (mode === 'bike') {
					duration = duration * 1.1 + 180; // 1.1x traffic + 3 mins parking
				} else if (mode === 'walk') {
					duration = duration * 1.05; // walking speed is stable
				}

				setActiveRoute(coords);
				setRouteInfo({
					distance: route.distance, // meters
					duration: duration,
				});
			}
		} catch (error) {
			console.error('Routing error:', error);
			// Fallback to straight line
			setActiveRoute([start, end]);
		} finally {
			setIsRouting(false);
		}
	};

	const locateUser = () => {
		if (!navigator.geolocation) {
			setGeoError('Trình duyệt của bạn không hỗ trợ định vị.');
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setUserLoc([latitude, longitude]);
				setMapCenter([latitude, longitude]);
				setGeoError('');
			},
			() => {
				setGeoError('Không thể lấy vị trí. Vui lòng cấp quyền định vị GPS.');
			},
		);
	};

	useEffect(() => {
		let isMounted = true;
		if (!navigator.geolocation) {
			setTimeout(() => {
				if (isMounted) setGeoError('Trình duyệt của bạn không hỗ trợ định vị.');
			}, 0);
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position) => {
				if (!isMounted) return;
				const { latitude, longitude } = position.coords;
				setUserLoc([latitude, longitude]);
				setMapCenter([latitude, longitude]);
				setGeoError('');
			},
			() => {
				if (isMounted) {
					setGeoError('Không thể lấy vị trí. Vui lòng cấp quyền định vị GPS.');
				}
			},
		);
		return () => {
			isMounted = false;
		};
	}, []);

	// Auto-scroll sidebar AND Open Marker Popup when active stall changes
	useEffect(() => {
		if (activeStallId) {
			// Scroll sidebar
			const activeElement = document.getElementById(
				`stall-card-${activeStallId}`,
			);
			if (activeElement) {
				activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}

			// Open Map Popup
			const marker = markerRefs.current[activeStallId];
			if (marker) {
				marker.openPopup();
			}
		} else {
			setTimeout(() => {
				setActiveRoute(null);
				setRouteInfo(null);
			}, 0);
		}
	}, [activeStallId]);

	return (
		<div className='w-full h-screen relative flex flex-col md:flex-row bg-slate-50'>
			{/* Sidebar Info */}
			<div className='w-full md:w-100 bg-white shadow-2xl z-1000 flex flex-col h-full relative'>
				<div className='p-8 bg-slate-900 text-white shadow-xl relative overflow-hidden shrink-0'>
					<div className='absolute -top-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-20'></div>

					<Link
						to='/'
						className='cursor-pointer inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors font-black uppercase tracking-widest text-[10px] sm:text-xs mb-6 w-max relative z-10'
					>
						<ArrowLeft size={16} /> Trang chủ
					</Link>

					<h2 className='text-3xl font-black flex items-center gap-3 mb-2 tracking-tighter italic uppercase relative z-10'>
						<MapPin size={28} className='text-orange-500 shrink-0' /> FOOD-MAP
						VIP
					</h2>
					<p className='text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 relative z-10'>
						Khám phá Ẩm thực Đường phố
					</p>

					<button
						onClick={locateUser}
						className='cursor-pointer w-full bg-white text-slate-900 font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 text-sm uppercase tracking-widest'
					>
						<Navigation size={18} /> Vị trí của bạn
					</button>
					{geoError && (
						<p className='text-xs text-red-400 mt-4 text-center font-medium bg-red-400/10 py-2 rounded-lg'>
							{geoError}
						</p>
					)}
				</div>

				<div className='flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative z-10 no-scrollbar'>
					{/* Search & Filter Section */}
					<div className='space-y-4'>
						<div className='relative group'>
							<Search
								className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors'
								size={18}
							/>
							<input
								type='text'
								placeholder='Tìm kiếm gian hàng...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
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
									onClick={() => setSelectedCategory(cat)}
									className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
										selectedCategory === cat
											? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
											: 'bg-white text-slate-500 border border-slate-200 hover:border-orange-500 hover:text-orange-500 shadow-sm'
									}`}
								>
									{cat === 'All' ? 'Tất cả' : cat}
								</button>
							))}
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<div className='w-2 h-6 bg-orange-500 rounded-full'></div>
						<div className='text-sm font-black text-slate-800 uppercase tracking-widest'>
							{filteredStalls.length > 0
								? `Gian hàng lân cận (${filteredStalls.length})`
								: 'Không tìm thấy kết quả'}
						</div>
					</div>
					{filteredStalls.map((stall) => {
						const isActive = activeStallId === stall.id;
						const distanceStr = getDistanceStr(
							stall.coordinates as [number, number],
						);
						return (
							<div
								key={stall.id}
								id={`stall-card-${stall.id}`}
								onClick={() => {
									setMapCenter(stall.coordinates as [number, number]);
									setActiveStallId(stall.id);
								}}
								className={`p-5 rounded-[24px] shadow-sm cursor-pointer transition-all flex gap-5 pr-12 relative group ${isActive ? 'bg-orange-50 bg-opacity-50 border-2 border-orange-500 scale-[1.02]' : 'bg-white border border-slate-100 hover:border-orange-500 hover:shadow-xl'}`}
							>
								<div
									className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform ${isActive ? 'ring-4 ring-orange-500/30' : ''}`}
								>
									<img
										src={stall.image}
										className='w-full h-full object-cover'
										alt=''
									/>
								</div>
								<div className='flex-1 flex flex-col justify-center text-left'>
									<div
										className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-orange-600' : 'text-slate-500 group-hover:text-orange-600'}`}
									>
										{stall.category}
									</div>
									<h4 className='font-bold text-slate-900 leading-tight text-base group-hover:text-orange-600 transition-colors uppercase italic tracking-tight'>
										{stall.name}
									</h4>
									{distanceStr && (
										<div className='flex items-center gap-1 mt-1.5 text-slate-400 text-xs font-semibold'>
											<Navigation size={12} className='inline rotate-45' /> Cách
											bạn {distanceStr}
										</div>
									)}
								</div>
								<div
									className={`absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-500 group-hover:text-white'}`}
								>
									<Navigation size={18} />
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Map Content */}
			<div className='flex-1 h-full z-0 relative overflow-hidden bg-slate-100'>
				<MapContainer
					center={defaultCenter}
					zoom={16}
					className='w-full h-full'
					zoomControl={false}
				>
					{/* CartoDB Light BaseMap (Sạch sẽ, đẹp và hiện đại hơn) */}
					<TileLayer
						attribution='&copy; <a href="https://carto.com/">Carto</a>'
						url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
					/>
					<MapController center={mapCenter} />

					{userLoc && (
						<Marker position={userLoc} icon={userIcon}>
							<Popup className='custom-popup'>
								<div className='font-black tracking-widest text-[10px] text-slate-900 uppercase py-2 px-4'>
									📍 Bạn ở đây
								</div>
							</Popup>
						</Marker>
					)}

					{activeRoute && (
						<Polyline
							positions={activeRoute}
							color='#f97316'
							weight={6}
							opacity={0.8}
							dashArray='12, 12'
							lineCap='round'
						/>
					)}

					{filteredStalls.map((stall) => {
						const distanceStr = getDistanceStr(
							stall.coordinates as [number, number],
						);
						return (
							<Marker
								key={stall.id}
								ref={(el) => {
									markerRefs.current[stall.id] = el;
								}}
								position={stall.coordinates as [number, number]}
								icon={createStallIcon(stall, activeStallId === stall.id)}
								zIndexOffset={activeStallId === stall.id ? 1000 : 0}
								eventHandlers={{
									click: () => {
										setActiveStallId(stall.id);
										setMapCenter(stall.coordinates as [number, number]);
									},
								}}
							>
								<Popup className='custom-popup rounded-[30px] overflow-hidden p-0 shadow-2xl border-4 border-white'>
									<div className='w-72 sm:w-80 overflow-hidden bg-white flex flex-col'>
										<div className='relative h-36 sm:h-40'>
											<img
												src={stall.image}
												className='w-full h-full object-cover'
												alt={stall.name}
											/>
											<div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-sm font-black text-yellow-500 flex items-center gap-1 shadow-sm'>
												⭐ {stall.rating}
											</div>
										</div>
										<div className='p-6 text-center flex-1 flex flex-col justify-between'>
											<div>
												<div className='text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-orange-500 mb-1.5'>
													{stall.category}
												</div>
												<h4 className='font-black text-xl sm:text-2xl text-slate-900 italic tracking-tight leading-tight'>
													{stall.name}
												</h4>
												{distanceStr && (
													<div className='flex justify-center items-center gap-1 mt-2.5 text-slate-500 text-sm font-bold bg-slate-100 px-3 py-1 rounded-xl w-max mx-auto shadow-inner border border-slate-200/50'>
														<Navigation
															size={14}
															className='inline rotate-45'
														/>{' '}
														Vị trí cách {distanceStr}
													</div>
												)}
											</div>
											<div className='flex flex-col gap-3 mt-4'>
												<div className='flex gap-2 p-1 bg-slate-100 rounded-xl'>
													{[
														{ id: 'car', icon: Car, label: 'Ô tô' },
														{ id: 'bike', icon: Bike, label: 'Xe máy' },
														{ id: 'walk', icon: Footprints, label: 'Đi bộ' },
													].map((m) => (
														<button
															key={m.id}
															onClick={(e) => {
																e.stopPropagation();
																const mode = m.id as 'car' | 'bike' | 'walk';
																setTravelMode(mode);
																if (userLoc)
																	fetchRoute(
																		userLoc,
																		stall.coordinates as [number, number],
																		mode,
																	);
															}}
															className={`cursor-pointer flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${travelMode === m.id ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
														>
															<m.icon size={16} />
															<span className='text-[8px] font-black uppercase'>
																{m.label}
															</span>
														</button>
													))}
												</div>

												{routeInfo && activeStallId === stall.id && (
													<div className='text-[10px] font-bold text-slate-600 bg-orange-50 py-2 px-3 rounded-xl animate-in fade-in slide-in-from-top-1 border border-orange-100 flex items-center justify-between'>
														<div className='flex items-center gap-1.5'>
															<span className='text-orange-500 text-xs'>
																⏱️
															</span>
															<span>
																Dự kiến:{' '}
																<span className='text-orange-600 font-black'>
																	{Math.ceil(routeInfo.duration / 60)} phút
																</span>
															</span>
														</div>
														<div className='text-slate-400 font-medium'>
															{(routeInfo.distance / 1000).toFixed(1)} km
														</div>
													</div>
												)}

												<div className='flex gap-2'>
													<button
														onClick={(e) => {
															e.stopPropagation();
															setSelectedStallForModal(stall);
														}}
														className='flex-1 cursor-pointer bg-slate-900 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider py-3 rounded-xl hover:bg-orange-500 transition-all flex items-center justify-center gap-1.5'
													>
														<Utensils size={13} /> Menu
													</button>
													<button
														disabled={isRouting}
														onClick={(e) => {
															e.stopPropagation();
															if (userLoc) {
																fetchRoute(
																	userLoc,
																	stall.coordinates as [number, number],
																	travelMode,
																);
																// Fly to user location
																setMapCenter(userLoc);
															} else {
																alert('Vui lòng bật định vị để chỉ đường!');
															}
														}}
														className={`flex-1 cursor-pointer bg-orange-500 text-white! text-[9px] sm:text-[10px] font-black uppercase tracking-wider py-3 rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5 ${isRouting ? 'opacity-50 animate-pulse' : ''}`}
													>
														<Navigation size={13} className='rotate-45' />{' '}
														{isRouting ? 'Đang tính...' : 'Chỉ đường'}
													</button>
												</div>
											</div>
										</div>
									</div>
								</Popup>
							</Marker>
						);
					})}
				</MapContainer>

				{/* Custom CSS overrides for Leaflet elements inside this component */}
				<style
					dangerouslySetInnerHTML={{
						__html: `
          .leaflet-container { font-family: inherit; }
          .custom-popup .leaflet-popup-content-wrapper { padding: 0; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); background: transparent; }
          .custom-popup .leaflet-popup-content { margin: 0; width: auto !important; }
          .custom-popup .leaflet-popup-tip-container { display: none; }
          
          /* Custom Close Button for Leaflet Popup */
          .custom-popup .leaflet-popup-close-button {
            width: 32px !important;
            height: 32px !important;
            top: 12px !important;
            right: 12px !important;
            background-color: rgba(0, 0, 0, 0.5) !important;
            border-radius: 50% !important;
            color: white !important;
            font-size: 24px !important;
            line-height: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            transition: all 0.2s ease !important;
            z-index: 50;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2) !important;
          }
          .custom-popup .leaflet-popup-close-button:hover {
            background-color: #f97316 !important;
            transform: scale(1.15) !important;
          }

          .pulse-animation { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
          @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
            70% { box-shadow: 0 0 0 20px rgba(37, 99, 235, 0); }
            100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `,
					}}
				/>
			</div>

			{/* Menu Modal */}
			{selectedStallForModal && (
				<div className='absolute inset-0 z-[5000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4'>
					<div className='bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200'>
						<button
							onClick={() => setSelectedStallForModal(null)}
							className='cursor-pointer absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg z-20'
						>
							<X size={24} strokeWidth={3} />
						</button>
						<div className='relative h-40 shrink-0'>
							<img
								src={selectedStallForModal.image}
								alt={selectedStallForModal.name}
								className='w-full h-full object-cover'
							/>
							<div className='absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent'></div>
							<div className='absolute bottom-4 left-5 text-white'>
								<div className='text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1'>
									{selectedStallForModal.category}
								</div>
								<h3 className='text-2xl font-black italic tracking-tight'>
									{selectedStallForModal.name}
								</h3>
							</div>
						</div>
						<div className='p-6 flex-1 flex flex-col'>
							<h4 className='font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0'>
								<Utensils size={16} className='text-orange-500' /> Món tiêu biểu
							</h4>
							<div className='space-y-3 mb-6 shrink-0'>
								{selectedStallForModal.menu.slice(0, 3).map((item) => (
									<div
										key={item.id}
										className='flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100'
									>
										<div className='flex-1 pr-4'>
											<div className='font-bold text-sm text-slate-900 leading-tight'>
												{item.name}
											</div>
										</div>
										<div className='font-black text-orange-600 text-sm whitespace-nowrap'>
											{item.price.toLocaleString('vi-VN')}{' '}
											<span className='text-[9px] font-bold text-slate-400'>
												VNĐ
											</span>
										</div>
									</div>
								))}
							</div>
							<div className='mt-auto shrink-0'>
								<Link
									to={`/stall/${selectedStallForModal.id}`}
									className='cursor-pointer block text-center w-full bg-linear-to-r from-orange-500 to-red-600 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:to-red-700 transition-all active:scale-95'
								>
									Xem chi tiết 🚀
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
