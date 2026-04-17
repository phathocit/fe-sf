import { useState, useEffect, useMemo, useRef } from 'react';
import {
	X,
	MapPin,
	Save,
	Crosshair,
	Navigation,
	Layers,
	Maximize,
	Target,
} from 'lucide-react';
import {
	MapContainer,
	TileLayer,
	Marker,
	Circle,
	useMapEvents,
	useMap,
	LayersControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Stall } from '../../../types/stall.types';
import triggerApi from '../../../api/triggerApi';
import { toast } from 'react-toastify';

const { BaseLayer } = LayersControl;

// Fix Leaflet icon issue
const icon = L.icon({
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

interface POIModalProps {
	stall: Stall | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (id: number, data: Partial<Stall>) => void;
	mode: 'edit' | 'view';
}

function MapUpdater({ center }: { center: [number, number] }) {
	const map = useMap();
	useEffect(() => {
		map.setView(center);
	}, [center, map]);
	return null;
}

function LocationPicker({
	onLocationSelect,
	isEnabled,
}: {
	onLocationSelect: (lat: number, lng: number) => void;
	isEnabled: boolean;
}) {
	useMapEvents({
		click(e) {
			if (isEnabled) {
				onLocationSelect(e.latlng.lat, e.latlng.lng);
			}
		},
	});
	return null;
}

export default function POIModal({
	stall,
	isOpen,
	onClose,
	onSave,
	mode,
}: POIModalProps) {
	const [lat, setLat] = useState<number>(10.762622);
	const [lng, setLng] = useState<number>(106.660172);
	const [radius, setRadius] = useState<number>(30);
	const [config, setConfig] = useState<any>(null);
	const markerRef = useRef<any>(null);

	useEffect(() => {
		if (stall) {
			setLat(parseFloat(stall.latitude));
			setLng(parseFloat(stall.longitude));

			const fetchConfig = async () => {
				try {
					const res = await triggerApi.getByStallId(stall.id);
					if (res.result) {
						setConfig(res.result);
						setRadius(res.result.radius || 30);
					} else {
						setRadius(stall.radius || 30);
					}
				} catch {
					setRadius(stall.radius || 30);
				}
			};
			fetchConfig();
		}
	}, [stall]);

	const eventHandlers = useMemo(
		() => ({
			dragend() {
				const marker = markerRef.current;
				if (marker != null) {
					const newPos = marker.getLatLng();
					setLat(newPos.lat);
					setLng(newPos.lng);
				}
			},
		}),
		[],
	);

	if (!isOpen || !stall) return null;

	const handleSave = async () => {
		try {
			await onSave(stall.id, {
				latitude: lat.toString(),
				longitude: lng.toString(),
			});

			await triggerApi.save({
				stallId: stall.id,
				triggerType: config?.triggerType || 'GEOFENCE',
				radius: radius,
				triggerDistance: config?.triggerDistance || 10,
				cooldownSeconds: config?.cooldownSeconds || 60,
				priority: config?.priority || 1,
			});

			toast.success('Cập nhật POI thành công');
			onClose();
		} catch (error) {
			console.error(error);
			toast.error('Có lỗi xảy ra khi lưu');
		}
	};

	const isEdit = mode === 'edit';

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500'>
			<div className='bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] border border-white/20'>
				{/* Left Side: Form Controls */}
				<div className='w-full md:w-[380px] p-10 flex flex-col bg-slate-50/50 border-r border-slate-100 overflow-y-auto no-scrollbar'>
					<div className='flex items-center justify-between mb-10'>
						<div className='w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 rotate-3 group hover:rotate-0 transition-transform'>
							<MapPin size={28} />
						</div>
						<button
							onClick={onClose}
							className='hover:bg-rose-50 hover:text-rose-500 p-3 rounded-2xl transition-all text-slate-400 active:scale-90 bg-white shadow-sm border border-slate-100'
						>
							<X size={20} />
						</button>
					</div>

					<div className='mb-10'>
						<h2 className='text-3xl font-black text-slate-900 uppercase italic leading-tight tracking-tight'>
							{isEdit ? 'Cấu hình' : 'Thông tin'}{' '}
							<span className='text-orange-500 not-italic block'>
								Vị Trí POI
							</span>
						</h2>
						<div className='flex items-center gap-2 mt-4'>
							<span className='bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest'>
								ID #{stall.id}
							</span>
							<p className='text-slate-500 font-bold uppercase tracking-widest text-[10px] truncate max-w-[150px]'>
								{stall.name}
							</p>
						</div>
					</div>

					<div className='space-y-8 flex-1'>
						<div className='grid grid-cols-1 gap-6'>
							<div className='space-y-3'>
								<label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
									<Target size={12} className='text-orange-500' /> Tọa độ Vĩ độ
								</label>
								<div className='relative'>
									<input
										type='number'
										value={lat.toFixed(6)}
										onChange={(e) => setLat(parseFloat(e.target.value))}
										disabled={!isEdit}
										className='w-full bg-white border border-slate-100 px-6 py-4 rounded-2xl font-mono text-sm font-bold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-100 cursor-default'
									/>
									<div className='absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase'>
										Lat
									</div>
								</div>
							</div>
							<div className='space-y-3'>
								<label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
									<Target size={12} className='text-indigo-500' /> Tọa độ Kinh
									độ
								</label>
								<div className='relative'>
									<input
										type='number'
										value={lng.toFixed(6)}
										onChange={(e) => setLng(parseFloat(e.target.value))}
										disabled={!isEdit}
										className='w-full bg-white border border-slate-100 px-6 py-4 rounded-2xl font-mono text-sm font-bold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-100 cursor-default'
									/>
									<div className='absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase'>
										Lng
									</div>
								</div>
							</div>
						</div>

						<div className='p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-5'>
							<div className='flex items-center justify-between'>
								<label className='text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2'>
									<Layers size={14} className='text-orange-500' /> Bán kính
									Trigger
								</label>
								<span className='bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black'>
									{radius}m
								</span>
							</div>
							<input
								type='range'
								min='5'
								max='200'
								step='5'
								value={radius}
								onChange={(e) => setRadius(parseInt(e.target.value))}
								disabled={!isEdit}
								className='w-full accent-orange-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer disabled:opacity-30'
							/>
							<div className='flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-tighter'>
								<span>5m</span>
								<span>100m</span>
								<span>200m</span>
							</div>
						</div>
					</div>

					<div className='mt-10 flex flex-col gap-4'>
						{isEdit ? (
							<button
								onClick={handleSave}
								className='w-full py-5 bg-slate-900 hover:bg-orange-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 active:scale-95 transition-all group'
							>
								<Save
									size={18}
									className='group-hover:rotate-12 transition-transform'
								/>{' '}
								Lưu cấu hình POI
							</button>
						) : (
							<button
								onClick={() =>
									window.open(
										`https://www.google.com/maps?q=${lat},${lng}`,
										'_blank',
									)
								}
								className='w-full py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all group'
							>
								<Navigation
									size={18}
									className='group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'
								/>{' '}
								Điều hướng Google Maps
							</button>
						)}
					</div>
				</div>

				{/* Right Side: Map Canvas */}
				<div className='flex-1 relative bg-slate-200 overflow-hidden'>
					{/* Custom Map UI Overlay */}
					<div className='absolute top-8 left-8 z-[1000] flex flex-col gap-4 max-w-[300px]'>
						<div className='bg-white/95 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] shadow-2xl border border-white/50 animate-in slide-in-from-left duration-700'>
							<div className='flex items-center gap-4'>
								<div className='relative'>
									<div className='w-10 h-10 bg-orange-100 rounded-full animate-ping absolute top-0 left-0 opacity-20'></div>
									<div className='w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg relative z-10'>
										<Maximize size={20} />
									</div>
								</div>
								<div>
									<h4 className='text-[11px] font-black text-slate-900 uppercase'>
										Chế độ chuẩn xác
									</h4>
									<p className='text-[9px] font-bold text-slate-500 uppercase tracking-wide opacity-70'>
										Tọa độ thời gian thực (WGS84)
									</p>
								</div>
							</div>
						</div>

						{isEdit && (
							<div className='bg-indigo-600 text-white px-6 py-4 rounded-[1.5rem] shadow-2xl border border-indigo-400/30 flex items-center gap-4 animate-bounce-slow'>
								<Crosshair size={22} className='shrink-0' />
								<p className='text-[10px] font-black uppercase leading-relaxed tracking-wider'>
									Nhấp chuột hoặc kéo Marker để thay đổi vị trí trung tâm POI
								</p>
							</div>
						)}
					</div>

					{/* Map Instance */}
					<div className='h-full w-full'>
						<MapContainer
							center={[lat, lng]}
							zoom={19}
							style={{ height: '100%', width: '100%' }}
							zoomControl={true}
						>
							<LayersControl position='topright'>
								<BaseLayer checked name='Bản đồ đường (OSM)'>
									<TileLayer
										url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
										attribution='&copy; OpenStreetMap'
									/>
								</BaseLayer>
								<BaseLayer name='Bản đồ vệ tinh (Satellite)'>
									<TileLayer
										url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
										attribution='Esri World Imagery'
									/>
								</BaseLayer>
							</LayersControl>

							<Marker
								draggable={isEdit}
								eventHandlers={eventHandlers}
								position={[lat, lng]}
								icon={icon}
								ref={markerRef}
							/>

							<Circle
								center={[lat, lng]}
								radius={radius}
								pathOptions={{
									color: '#f97316',
									fillColor: '#f97316',
									fillOpacity: 0.15,
									weight: 3,
									dashArray: '8, 12',
								}}
							/>

							<MapUpdater center={[lat, lng]} />
							<LocationPicker
								onLocationSelect={(newLat, newLng) => {
									setLat(newLat);
									setLng(newLng);
								}}
								isEnabled={isEdit}
							/>
						</MapContainer>
					</div>

					{/* Footer Badge */}
					<div className='absolute bottom-8 right-8 z-[1000]'>
						<div className='bg-slate-900 text-white px-5 py-2 rounded-full shadow-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3'>
							<Activity size={12} className='text-emerald-500' />
							Leaflet Engine v1.9.4
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Helper icons missing in imports
const Activity = ({
	className,
	size,
}: {
	className?: string;
	size?: number;
}) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width={size || 24}
		height={size || 24}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}
	>
		<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
	</svg>
);
