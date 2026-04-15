import { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Edit2, ShieldAlert, Navigation, Settings2 } from 'lucide-react';
import stallApi from '../../api/stallApi';
import { type Stall } from '../../types/stall.types';
import { toast } from 'react-toastify';
import AdminLayout from '../../layouts/AdminLayout';

export default function POIPage() {
	const [stalls, setStalls] = useState<Stall[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		fetchPOIs();
	}, []);

	const fetchPOIs = async () => {
		setLoading(true);
		try {
			const res = await stallApi.getAll();
			setStalls(res.result || []);
		} catch (error) {
			console.error(error);
			toast.error('Không thể tải danh sách POI');
		} finally {
			setLoading(false);
		}
	};

	const filteredData = useMemo(() => {
		const q = searchQuery.toLowerCase();
		return stalls.filter(
			(s) => s.name.toLowerCase().includes(q) || s.id.toString().includes(q),
		);
	}, [stalls, searchQuery]);

	return (
		<AdminLayout
			title='Quản Lý POI'
			subtitle={`Quản lý vị trí và cấu hình kích hoạt cho ${stalls.length} điểm bản đồ`}
			searchPlaceholder='Tìm kiếm POI theo tên hoặc ID...'
			searchValue={searchQuery}
			onSearchChange={setSearchQuery}
		>
			<div className='flex-1 min-h-0 bg-white border border-slate-200 rounded-4xl shadow-sm flex flex-col overflow-hidden'>
				<div className='flex-1 overflow-auto no-scrollbar'>
					<table className='w-full text-left border-separate border-spacing-0'>
						<thead className='sticky top-0 z-10'>
							<tr className='bg-slate-50'>
								<th className='p-6 pl-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									ID
								</th>
								<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									Điểm POI (Gian Hàng)
								</th>
								<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									Tọa Độ (Lat, Lng)
								</th>
								<th className='p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									Bán Kính (M)
								</th>
								<th className='p-6 text-right pr-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
									Hành động
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-50 font-medium text-slate-700'>
							{loading ? (
								<tr>
									<td colSpan={5} className='p-20 text-center'>
										<div className='inline-block w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin'></div>
									</td>
								</tr>
							) : filteredData.length === 0 ? (
								<tr>
									<td colSpan={5} className='p-20 text-center text-slate-400'>
										<ShieldAlert
											size={48}
											className='mx-auto mb-4 opacity-20'
										/>
										<p className='font-black uppercase tracking-widest text-xs'>
											Không tìm thấy POI nào
										</p>
									</td>
								</tr>
							) : (
								filteredData.map((stall) => (
									<tr
										key={stall.id}
										className='hover:bg-slate-50/50 transition-colors group'
									>
										<td className='p-6 pl-10'>
											<span className='font-black text-slate-400 text-xs tracking-tighter'>
												#{stall.id}
											</span>
										</td>
										<td className='p-6'>
											<div className='flex items-center gap-4'>
												<div className='w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm'>
													<MapPin size={24} />
												</div>
												<div className='min-w-0'>
													<div className='font-black text-slate-900 text-base italic uppercase tracking-tight truncate uppercase font-bold decoration-orange-500/30 underline-offset-4 decoration-2'>
														{stall.name}
													</div>
													<div className='text-[10px] text-slate-400 font-bold uppercase mt-0.5 line-clamp-1'>
														{stall.category}
													</div>
												</div>
											</div>
										</td>
										<td className='p-6'>
											<div className='flex flex-col gap-1'>
												<div className='flex items-center gap-2 text-xs font-bold font-mono text-slate-500'>
													<span className='bg-slate-100 px-2 py-0.5 rounded text-slate-400'>LAT</span> {stall.latitude}
												</div>
												<div className='flex items-center gap-2 text-xs font-bold font-mono text-slate-500'>
													<span className='bg-slate-100 px-2 py-0.5 rounded text-slate-400'>LNG</span> {stall.longitude}
												</div>
											</div>
										</td>
										<td className='p-6'>
											<div className='flex items-center gap-2'>
												<span className='bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[11px] font-black tracking-widest border border-indigo-100'>
													{stall.radius || 30} m
												</span>
											</div>
										</td>
										<td className='p-6 text-right pr-10'>
											<div className='flex justify-end gap-2'>
												<button
													onClick={() => window.open(`https://www.google.com/maps?q=${stall.latitude},${stall.longitude}`, '_blank')}
													className='cursor-pointer w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm'
													title='Xem trên bản đồ'
												>
													<Navigation size={18} />
												</button>
												<button
													onClick={() => toast.info('Tính năng cập nhật tọa độ sắp ra mắt')}
													className='cursor-pointer w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm'
													title='Chỉnh sửa POI'
												>
													<Edit2 size={18} />
												</button>
												<button
													onClick={() => toast.info('Cấu hình âm thanh trigger')}
													className='cursor-pointer w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all shadow-sm'
													title='Cấu hình trigger'
												>
													<Settings2 size={18} />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</AdminLayout>
	);
}
