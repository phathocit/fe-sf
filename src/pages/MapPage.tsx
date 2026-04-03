import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { Loader2, Menu, X } from 'lucide-react';

import stallApi from '../api/stallApi';
import foodApi from '../api/foodApi';
import type { Stall } from '../types/stall.types';
import type { Food } from '../types/food.types';

// Components
import MapSidebar from '../components/map/MapSidebar';
import MapContent from '../components/map/MapContent';
import MenuModal from '../components/map/MenuModal';
import MapOverlay from '../components/map/MapOverlay';

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

	const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});
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
		if (stallInside && activeAudioId !== stallInside.id) {
			setActiveAudioId(stallInside.id);
			console.log(`UI Toggle: Playing intro for ${stallInside.name}`);
		}
	}, [
		userLoc,
		voiceTourEnabled,
		activeAudioId,
		isInsideGeofence,
		stalls,
		getCoords,
	]);

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

	// Nearby Alert Memo
	const nearbyStall = useMemo(() => {
		return stalls.find((s) => isInsideGeofence(getCoords(s))) || null;
	}, [stalls, isInsideGeofence, getCoords]);

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
					t={t}
				/>
			</div>

			<MenuModal
				stall={selectedStallForModal}
				menu={modalMenu}
				loading={modalLoading}
				t={t}
				onClose={() => setSelectedStallForModal(null)}
			/>

			<MapOverlay stall={nearbyStall} t={t} onAction={handleStallClick} />
		</div>
	);
}
