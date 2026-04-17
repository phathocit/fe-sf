import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Utensils, Zap, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import qrCodeApi from '../api/qrCodeApi';

export default function LandingPage() {
	const navigate = useNavigate();
	const [webUrl, setWebUrl] = useState('');

	useEffect(() => {
		const fetchGatewayQR = async () => {
			try {
				const res = await qrCodeApi.getGateway();
				if (res.result) {
					// QR link leads to backend for tracking
					const baseUrl =
						import.meta.env.VITE_API_URL?.replace('/api', '') ||
						'http://localhost:8080';
					console.log(`${baseUrl}/api/qr/scan/${res.result.code}`);
					setWebUrl(`${baseUrl}/api/qr/scan/${res.result.code}`);
				} else {
					setWebUrl(window.location.origin + '/home');
				}
			} catch {
				setWebUrl(window.location.origin + '/home');
			}
		};
		fetchGatewayQR();
	}, []);

	const handleEnter = () => {
		localStorage.setItem('has_entered', 'true');
		navigate('/home');
	};

	return (
		<div className='min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden'>
			{/* Decorative background elements */}
			<div className='absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px]'></div>
			<div className='absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]'></div>

			{/* Main Content Card */}
			<div className='z-10 w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 flex flex-col items-center shadow-2xl animate-in fade-in zoom-in duration-700'>
				{/* Logo/Icon */}
				<div className='w-20 h-20 bg-linear-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 mb-8 rotate-6 hover:rotate-0 transition-transform duration-500'>
					<Utensils size={38} />
				</div>

				{/* Header */}
				<div className='text-center mb-10'>
					<h1 className='text-4xl font-black text-white italic tracking-tight uppercase mb-3'>
						Smart{' '}
						<span className='text-orange-500 not-italic'>Food Street</span>
					</h1>
					<p className='text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]'>
						Trải nghiệm ẩm thực thông minh
					</p>
				</div>

				{/* QR Code Section */}
				<div className='relative group mb-10'>
					<div className='absolute -inset-4 bg-linear-to-r from-orange-500 to-indigo-600 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000'></div>
					<div className='relative bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center'>
						{webUrl && (
							<QRCodeSVG
								value={webUrl}
								size={220}
								level='H'
								includeMargin={true}
								imageSettings={{
									src: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
									x: undefined,
									y: undefined,
									height: 40,
									width: 40,
									excavate: true,
								}}
							/>
						)}
						<div className='mt-4 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl'>
							<Zap size={14} className='text-orange-500 animate-pulse' />
							<span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
								Quét mã để bắt đầu
							</span>
						</div>
					</div>
				</div>

				{/* Info Badges */}
				<div className='grid grid-cols-2 gap-4 w-full mb-10'>
					<div className='bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2'>
						<MapPin size={18} className='text-orange-500' />
						<span className='text-[9px] font-black text-white uppercase tracking-wider'>
							Vị trí chuẩn
						</span>
					</div>
					<div className='bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2'>
						<Sparkles size={18} className='text-indigo-400' />
						<span className='text-[9px] font-black text-white uppercase tracking-wider'>
							Âm thanh mở
						</span>
					</div>
				</div>

				{/* Enter Button (for mobile or direct access) */}
				<button
					onClick={handleEnter}
					className='w-full py-6 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 group'
				>
					Vào Website Ngay
					<ChevronRight
						size={18}
						className='group-hover:translate-x-1 transition-transform'
					/>
				</button>
			</div>

			{/* Footer */}
			<div className='absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]'>
				Powered by SFS Engine v2.0
			</div>
		</div>
	);
}
