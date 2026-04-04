import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { Loader2, Menu, X, Volume2 } from 'lucide-react';
import audioApi from '../api/audioApi';

import { toast } from 'react-toastify';

import stallApi from '../api/stallApi';
import foodApi from '../api/foodApi';
import type { Stall } from '../types/stall.types';
import type { Food } from '../types/food.types';

// Components
import MapSidebar from '../components/map/MapSidebar';
import MapContent from '../components/map/MapContent';
import MenuModal from '../components/map/MenuModal';
import GpsSimulator from '../components/map/GpsSimulator';
import { Target } from 'lucide-react';

// Icons
const userIcon = L.divIcon({
	html: `<div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-2xl pulse-animation"></div>`,
	className: 'user-marker',
	iconSize: [24, 24],
	iconAnchor: [12, 12],
});

const createStallIcon = (stall: Stall, isActive: boolean = false) => {
	return L.divIcon({
		html: `
      <div class="relative">
        <div class="w-12 h-12 rounded-2xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] ${isActive ? 'border-[3px] border-orange-600 scale-125' : 'border-2 border-orange-400/50'} transition-all duration-300 hover:scale-125 overflow-hidden flex items-center justify-center relative z-10">
          <img src="${stall.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'}" class="flex-1 w-full h-full object-cover rounded-xl" />
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

export default function MapPage() {
	const { t } = useTranslation('map');
	const [searchParams] = useSearchParams();
	const defaultCenter: [number, number] = [10.7601, 106.7042];

	// States
	const [stalls, setStalls] = useState<Stall[]>([]);
	const [loading, setLoading] = useState(true);
	const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
	const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
	const [activeStallId, setActiveStallId] = useState<number | null>(null);
	const [activeAudioId, setActiveAudioId] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('All');
	const [selectedStallForModal, setSelectedStallForModal] =
		useState<Stall | null>(null);
	const [modalMenu, setModalMenu] = useState<Food[]>([]);
	const [modalLoading, setModalLoading] = useState(false);
	const [geoError, setGeoError] = useState('');
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isGpsSimOpen, setIsGpsSimOpen] = useState(false);
	const [isAudioPlaying, setIsAudioPlaying] = useState(false);

	const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const heardStalls = useRef<Set<number>>(new Set());
	const geofenceRadius = 25;
	const voiceTourEnabled = true;

	// Fetch Data
	useEffect(() => {
		const fetchStalls = async () => {
			try {
				const response = await stallApi.getAllActive();
				setStalls(response.result);
			} catch (error) {
				console.error('Error fetching stalls:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchStalls();
	}, []);

	// Search & Filter Memo
	const categories = useMemo(
		() => ['All', ...new Set(stalls.map((s) => s.category))],
		[stalls],
	);
	const filteredStalls = useMemo(() => {
		return stalls.filter((stall) => {
			const matchesSearch = stall.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategory === 'All' || stall.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [stalls, searchQuery, selectedCategory]);

	// Helpers
	const getCoords = useCallback((stall: Stall): [number, number] => {
		return [Number(stall.latitude), Number(stall.longitude)];
	}, []);

	const getDistanceStr = useCallback(
		(coords: [number, number]) => {
			if (!userLoc) return '';
			const d = L.latLng(userLoc).distanceTo(L.latLng(coords));
			return d > 1000 ? `${(d / 1000).toFixed(1)} km` : `${Math.round(d)} m`;
		},
		[userLoc],
	);

	const isInsideGeofence = useCallback(
		(coords: [number, number]) => {
			if (!userLoc) return false;
			const distance = L.latLng(userLoc).distanceTo(L.latLng(coords));
			return distance <= geofenceRadius;
		},
		[userLoc],
	);

	// Handlers
	const locateUser = useCallback(() => {
		if (!navigator.geolocation) {
			setGeoError(t('geo_support_error'));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setUserLoc([latitude, longitude]);
				setMapCenter([latitude, longitude]);
				setGeoError('');
			},
			() => setGeoError(t('geo_permission_error')),
		);
	}, [t]);

	const handleStallClick = useCallback(
		(stall: Stall) => {
			setMapCenter(getCoords(stall));
			setActiveStallId(stall.id);
			// Close sidebar on mobile after clicking a stall
			if (window.innerWidth < 768) {
				setIsSidebarOpen(false);
			}
		},
		[getCoords],
	);

	const handleOpenModal = useCallback(async (stall: Stall) => {
		setSelectedStallForModal(stall);
		setModalLoading(true);
		try {
			const response = await foodApi.getByStallId(stall.id);
			setModalMenu(response.result.filter((item: Food) => item.isAvailable));
		} catch (error) {
			console.error('Error fetching modal menu:', error);
		} finally {
			setModalLoading(false);
		}
	}, []);

	// Geolocation Effect
	useEffect(() => {
		let isMounted = true;
		if (!navigator.geolocation) {
			if (isMounted) setGeoError('Trình duyệt của bạn không hỗ trợ định vị.');
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position) => {
				if (!isMounted) return;
				const { latitude, longitude } = position.coords;
				setUserLoc([latitude, longitude]);
				setGeoError('');
			},
			() => {
				if (isMounted) setGeoError(t('geo_permission_error'));
			},
		);
		return () => {
			isMounted = false;
		};
	}, [t]);

	// URL Query param activation
	useEffect(() => {
		const stallIdFromQuery = searchParams.get('stallId');
		if (stallIdFromQuery && stalls.length > 0) {
			const id = Number(stallIdFromQuery);
			const targetStall = stalls.find((s) => s.id === id);
			if (targetStall) {
				handleStallClick(targetStall);
			}
		}
	}, [searchParams, stalls, handleStallClick]);

	// Voice Tour / Alert Effect
	useEffect(() => {
		if (!userLoc || !voiceTourEnabled || stalls.length === 0) {
			if (activeAudioId !== null) setActiveAudioId(null);
			return;
		}

		const stallInside = stalls.find((s) => isInsideGeofence(getCoords(s)));
		
		if (stallInside) {
			if (activeAudioId !== stallInside.id) {
				setActiveAudioId(stallInside.id);
				
				// Automatically play audio if inside zone and not already heard in this 'visit'
				if (!heardStalls.current.has(stallInside.id)) {
					handlePlayStallAudio(stallInside);
				}
			}
		} else {
			if (activeAudioId !== null) {
				setActiveAudioId(null);
				// Optionally stop audio when leaving zone, but usually we let it finish
			}
		}
	}, [
		userLoc,
		voiceTourEnabled,
		activeAudioId,
		isInsideGeofence,
		stalls,
		getCoords,
	]);

	const handlePlayStallAudio = async (stall: Stall) => {
		try {
			setIsAudioPlaying(true);
			const res = await audioApi.getStallAudio(stall.id);
			
			if (res.result && res.result.audioUrl && res.result.status === 'COMPLETED') {
				if (!audioRef.current) {
					audioRef.current = new Audio();
					audioRef.current.onended = () => {
						setIsAudioPlaying(false);
					};
				}
				
				audioRef.current.src = res.result.audioUrl;
				audioRef.current.play().catch(e => {
					console.warn('Audio auto-play blocked by browser. User interaction needed.', e);
					toast.info('Click để nghe thuyết minh về ' + stall.name);
				});
				
				heardStalls.current.add(stall.id);
			} else {
				toast.info(`Gian hàng ${stall.name} hiện chưa có nội dung audio thuyết minh.`);
				setIsAudioPlaying(false);
			}
		} catch (error) {
			console.error('Failed to play stall audio:', error);
			toast.error('Không thể kết nối đến hệ thống audio. Vui lòng thử lại sau.');
			setIsAudioPlaying(false);
		}
	};
	const handleAudioToggle = useCallback((stall: Stall) => {
		if (isAudioPlaying && activeAudioId === stall.id) {
			if (audioRef.current) {
				audioRef.current.pause();
				setIsAudioPlaying(false);
			}
		} else {
			handlePlayStallAudio(stall);
		}
	}, [isAudioPlaying, activeAudioId]);

	// Markers sync effect
	useEffect(() => {
		if (activeStallId) {
			const activeElement = document.getElementById(
				`stall-card-${activeStallId}`,
			);
			if (activeElement)
				activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			const marker = markerRefs.current[activeStallId];
			if (marker) marker.openPopup();
		}
	}, [activeStallId]);


	if (loading) {
		return (
			<div className='w-full h-screen flex flex-col items-center justify-center bg-slate-900 text-white'>
				<Loader2 className='w-12 h-12 animate-spin text-orange-500 mb-4' />
				<p className='font-black italic uppercase tracking-widest animate-pulse'>
					Initializing Food-Map...
				</p>
			</div>
		);
	}

	return (
		<div className='w-full h-screen relative flex flex-col md:flex-row bg-slate-50 overflow-hidden'>
			{/* Mobile Toggle Button */}
			<button
				onClick={() => setIsSidebarOpen(!isSidebarOpen)}
				className='md:hidden fixed top-24 left-6 z-500 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 active:scale-95 transition-all'
			>
				{isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
			</button>

			<button
				onClick={() => setIsGpsSimOpen(!isGpsSimOpen)}
				className='fixed top-6 right-6 z-500 w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 active:scale-95 transition-all hover:bg-slate-900 group'
				title="GPS Simulator"
			>
				<Target size={24} />
				<div className='absolute right-full mr-4 bg-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 whitespace-nowrap pointer-events-none'>
					Giả lập tọa độ GPS
				</div>
			</button>

			{isAudioPlaying && activeAudioId && (
				<div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-500 bg-slate-950/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-10 duration-500'>
					<div className='w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center animate-pulse'>
						<Volume2 size={24} className='text-white' />
					</div>
					<div>
						<div className='text-[10px] font-black text-orange-400 uppercase tracking-widest mb-0.5'>Đang thuyết minh</div>
						<div className='text-white font-black italic uppercase tracking-tight text-sm'>
							{stalls.find(s => s.id === activeAudioId)?.name}
						</div>
					</div>
					<button 
						onClick={() => {
							if (audioRef.current) {
								audioRef.current.pause();
								setIsAudioPlaying(false);
							}
						}}
						className='ml-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-rose-600 transition-all cursor-pointer'
					>
						<X size={16} />
					</button>
				</div>
			)}

			<div 
				className={`
					fixed inset-0 z-400 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
					${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
				`}
				onClick={() => setIsSidebarOpen(false)}
			/>

			<div className={`
				fixed md:relative inset-y-0 left-0 z-400 w-80 sm:w-100 transition-transform duration-500 ease-in-out
				${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
			`}>
				<MapSidebar
					stalls={stalls}
					filteredStalls={filteredStalls}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					selectedCategory={selectedCategory}
					onCategoryChange={setSelectedCategory}
					categories={categories}
					activeStallId={activeStallId}
					onStallClick={handleStallClick}
					isInsideGeofence={isInsideGeofence}
					getDistanceStr={getDistanceStr}
					getCoords={getCoords}
					locateUser={locateUser}
					geoError={geoError}
					t={t}
				/>
			</div>

			<div className='flex-1 h-full relative'>
				<MapContent
					stalls={stalls}
					filteredStalls={filteredStalls}
					userLoc={userLoc}
					mapCenter={mapCenter}
					activeStallId={activeStallId}
					onStallClick={handleStallClick}
					onMapClick={() => setActiveStallId(null)}
					handleOpenModal={handleOpenModal}
					getCoords={getCoords}
					getDistanceStr={getDistanceStr}
					geofenceRadius={geofenceRadius}
					userIcon={userIcon}
					createStallIcon={createStallIcon}
					markerRefs={markerRefs}
					locateUser={locateUser}
					isAudioPlaying={isAudioPlaying}
					activeAudioId={activeAudioId}
					onAudioToggle={handleAudioToggle}
					t={t}
				/>
				<GpsSimulator 
					userLoc={userLoc}
					onLocChange={(loc) => {
						setUserLoc(loc);
						setMapCenter(loc);
						setGeoError('');
					}}
					stalls={stalls}
					isOpen={isGpsSimOpen}
					onClose={() => setIsGpsSimOpen(false)}
				/>
			</div>

			<MenuModal
				stall={selectedStallForModal}
				menu={modalMenu}
				loading={modalLoading}
				t={t}
				onClose={() => setSelectedStallForModal(null)}
			/>
		</div>
	);
}
