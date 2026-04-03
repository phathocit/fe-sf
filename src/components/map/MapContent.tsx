import React from 'react';
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Circle,
	useMap,
	useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Utensils } from 'lucide-react';
import type { Stall } from '../../types/stall.types';

interface MapContentProps {
	stalls: Stall[];
	filteredStalls: Stall[];
	userLoc: [number, number] | null;
	mapCenter: [number, number];
	activeStallId: number | null;
	onStallClick: (stall: Stall) => void;
	onMapClick: () => void;
	handleOpenModal: (stall: Stall) => void;
	getCoords: (stall: Stall) => [number, number];
	getDistanceStr: (coords: [number, number]) => string;
	geofenceRadius: number;
	userIcon: L.DivIcon;
	createStallIcon: (stall: Stall, isActive: boolean) => L.DivIcon;
	markerRefs: React.MutableRefObject<{ [key: string]: L.Marker | null }>;
	locateUser: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	t: (key: string, options?: any) => string;
}

function MapController({ center }: { center: [number, number] }) {
	const map = useMap();
	React.useEffect(() => {
		map.flyTo(center, 17, { animate: true, duration: 1.5 });
	}, [center, map]);
	return null;
}

function MapEvents({ onMapClick }: { onMapClick: () => void }) {
	useMapEvents({
		click: () => {
			onMapClick();
		},
	});
	return null;
}

const MapContent: React.FC<MapContentProps> = ({
	filteredStalls,
	userLoc,
	mapCenter,
	activeStallId,
	onStallClick,
	onMapClick,
	handleOpenModal,
	getCoords,
	getDistanceStr,
	geofenceRadius,
	userIcon,
	createStallIcon,
	markerRefs,
	locateUser,
	t,
}) => {
	const currentUserLoc = userLoc;

	return (
		<div className='flex-1 h-full z-0 relative overflow-hidden bg-slate-100'>
			<button
				onClick={locateUser}
				className='md:hidden fixed top-24 right-6 z-500 w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-200 active:scale-95 transition-all'
			>
				<Navigation size={24} className='text-orange-600' />
			</button>
			<MapContainer
				center={mapCenter}
				zoom={16}
				className='w-full h-full'
				zoomControl={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://carto.com/">Carto</a>'
					url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
				/>
				<MapController center={mapCenter} />
				<MapEvents onMapClick={onMapClick} />

				{currentUserLoc && (
					<>
						<Circle
							center={currentUserLoc}
							radius={geofenceRadius}
							pathOptions={{
								fillColor: '#3b82f6',
								fillOpacity: 0.1,
								color: '#3b82f6',
								weight: 1,
								dashArray: '5, 10',
							}}
						/>
						<Marker position={currentUserLoc} icon={userIcon}>
							<Popup className='custom-popup'>
								<div className='font-black tracking-widest text-[10px] text-slate-900 uppercase py-2 px-4'>
									{t('you_are_here')}
								</div>
							</Popup>
						</Marker>
					</>
				)}

				{filteredStalls.map((stall) => {
					const distanceStr = getDistanceStr(getCoords(stall));
					return (
						<Marker
							key={stall.id}
							ref={(el) => {
								markerRefs.current[stall.id] = el;
							}}
							position={getCoords(stall)}
							icon={createStallIcon(stall, activeStallId === stall.id)}
							zIndexOffset={activeStallId === stall.id ? 1000 : 0}
							eventHandlers={{
								click: () => onStallClick(stall),
							}}
						>
							<Popup className='custom-popup rounded-[30px] overflow-hidden p-0 shadow-2xl border-4 border-white'>
								<div className='w-72 sm:w-80 overflow-hidden bg-white flex flex-col'>
									<div className='relative h-36 sm:h-40'>
										<img
											src={
												stall.image ||
												'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'
											}
											className='w-full h-full object-cover'
											alt={stall.name}
										/>
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
												<div className='flex justify-center items-center gap-1 mt-2.5 text-slate-500 text-sm font-bold bg-slate-100 px-3 py-1 rounded-xl w-max mx-auto shadow-inner mb-3 border border-slate-200/50'>
													<Navigation size={14} className='inline rotate-45' />{' '}
													{t('distance_away', { distance: distanceStr })}
												</div>
											)}
										</div>
										<div className='flex gap-2 font-bold'>
											<button
												onClick={() => handleOpenModal(stall)}
												className='flex-1 cursor-pointer bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider py-3.5 rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95'
											>
												<Utensils size={14} /> {t('view_menu')}
											</button>
										</div>
									</div>
								</div>
							</Popup>
						</Marker>
					);
				})}
			</MapContainer>

			<style
				dangerouslySetInnerHTML={{
					__html: `
          .leaflet-container { font-family: inherit; }
          .custom-popup .leaflet-popup-content-wrapper { padding: 0; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); background: transparent; }
          .custom-popup .leaflet-popup-content { margin: 0; width: auto !important; }
          .custom-popup .leaflet-popup-tip-container { display: none; }
          
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
	);
};

export default MapContent;
