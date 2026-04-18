import { useState, useEffect } from 'react';
import { Users, Volume2, Navigation, Activity } from 'lucide-react';
import visitApi from '../../api/visitApi';

interface AnalyticsProps {
	stallId: number;
}

export default function Analytics({ stallId }: AnalyticsProps) {
	const [stats, setStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [days, setDays] = useState(7);

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);
			try {
				const res = await visitApi.getVendorStats(stallId, days);
				if (res.result) {
					setStats(res.result);
				}
			} catch (error) {
				console.error('Failed to fetch vendor stats:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, [stallId, days]);

	if (loading || !stats) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin'></div>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto pb-20'>
			<div className='flex justify-between items-end mb-12'>
				<div>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-10 h-1 bg-orange-500 rounded-full'></div>
						<span className='text-xs font-black text-orange-500 uppercase tracking-[0.3em]'>
							Insight & Data
						</span>
					</div>
					<h1 className='text-4xl font-black text-slate-900 italic tracking-tight uppercase'>
						THỐNG KÊ GIAN HÀNG
					</h1>
					<p className='text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]'>
						Hiệu quả truyền thông audio và lượt quét QR trực tiếp
					</p>
				</div>
				<div className='flex items-center gap-4'>
					<select 
						value={days}
						onChange={(e) => setDays(Number(e.target.value))}
						className='bg-white border border-slate-100 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer shadow-sm hover:border-orange-200 transition-colors'
					>
						<option value={7}>7 Ngày qua</option>
						<option value={30}>30 Ngày qua</option>
					</select>
					<div className='bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4'>
						<div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
						<span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
							Dữ liệu cập nhật mới nhất
						</span>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
				{/* Total Visits Card */}
				<div className='bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/5 transition-all group overflow-hidden relative'>
					<div className='absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity'>
						<Users size={80} />
					</div>
					<div className='relative z-10'>
						<div className='w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6'>
							<Users size={24} />
						</div>
						<h3 className='text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1'>
							Lượt tiếp cận (GPS)
						</h3>
						<div className='flex items-end gap-3'>
							<span className='text-4xl font-black text-slate-900 italic tracking-tight'>
								{stats.totalVisits.toLocaleString()}
							</span>
						</div>
						<p className='text-slate-400 text-[9px] font-bold mt-4 uppercase tracking-[0.1em]'>
							Khách đi vào vùng nhận diện
						</p>
					</div>
				</div>

				{/* Audio Stats Card */}
				<div className='bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative'>
					<div className='absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity'>
						<Volume2 size={80} />
					</div>
					<div className='relative z-10'>
						<div className='w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6'>
							<Volume2 size={24} />
						</div>
						<h3 className='text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1'>
							Lượt nghe hết Audio
						</h3>
						<div className='flex items-end gap-3'>
							<span className='text-4xl font-black text-slate-900 italic tracking-tight'>
								{stats.audioCompletes.toLocaleString()}
							</span>
							<span className='bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md mb-2 uppercase'>
								Hiệu quả
							</span>
						</div>
						<p className='text-slate-400 text-[9px] font-bold mt-4 uppercase tracking-[0.1em]'>
							Tỉ lệ giữ chân qua âm thanh
						</p>
					</div>
				</div>

				{/* QR Scan Card */}
				<div className='bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group overflow-hidden relative'>
					<div className='absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity'>
						<Activity size={80} />
					</div>
					<div className='relative z-10'>
						<div className='w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6'>
							<Activity size={24} />
						</div>
						<h3 className='text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1'>
							Lượt quét mã QR
						</h3>
						<div className='flex items-end gap-3'>
							<span className='text-4xl font-black text-slate-900 italic tracking-tight'>
								{stats.qrScans.toLocaleString()}
							</span>
						</div>
						<p className='text-slate-400 text-[9px] font-bold mt-4 uppercase tracking-[0.1em]'>
							Quét trực tiếp tại gian hàng
						</p>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-8'>
				<div className='bg-slate-900 rounded-4xl shadow-2xl p-10 text-white relative overflow-hidden group'>
					<div className='absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl -mr-32 -mt-32'></div>
					<div className='relative z-10 h-full flex flex-col'>
						<h3 className='font-black italic uppercase tracking-tight mb-8'>
							Phân tích nguồn khách
						</h3>

						<div className='space-y-8 flex-1'>
							<div>
								<div className='flex justify-between text-[10px] font-black uppercase tracking-widest mb-3'>
									<span>Quét QR tại chỗ</span>
									<span className='text-orange-500'>
										{stats.totalVisits > 0 ? Math.round((stats.qrScans / stats.totalVisits) * 100) : 0}%
									</span>
								</div>
								<div className='h-2 bg-white/10 rounded-full overflow-hidden'>
									<div 
										style={{ width: `${stats.totalVisits > 0 ? Math.round((stats.qrScans / stats.totalVisits) * 100) : 0}%` }}
										className='h-full bg-orange-600 transition-all duration-1000'
									></div>
								</div>
							</div>
							<div>
								<div className='flex justify-between text-[10px] font-black uppercase tracking-widest mb-3'>
									<span>Tương tác Audio</span>
									<span className='text-indigo-400'>
										{stats.totalVisits > 0 ? Math.round((stats.audioCompletes / stats.totalVisits) * 100) : 0}%
									</span>
								</div>
								<div className='h-2 bg-white/10 rounded-full overflow-hidden'>
									<div 
										style={{ width: `${stats.totalVisits > 0 ? Math.round((stats.audioCompletes / stats.totalVisits) * 100) : 0}%` }}
										className='h-full bg-indigo-500 transition-all duration-1000'
									></div>
								</div>
							</div>
						</div>

						<div className='mt-10 pt-10 border-t border-white/10 italic'>
							<p className='text-[10px] text-slate-400 font-bold leading-relaxed'>
								* Dữ liệu thời gian thực giúp bạn tối ưu hóa nội dung audio và vị trí đặt mã QR.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
