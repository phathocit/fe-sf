import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import { QrCode, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ScanPage() {
	const navigate = useNavigate();

	useEffect(() => {
		const scanner = new Html5QrcodeScanner(
			'reader',
			{
				fps: 10,
				qrbox: { width: 250, height: 250 },
				aspectRatio: 1.0,
			},
			false,
		);

		scanner.render(
			(decodedText) => {
				console.log('Scanned:', decodedText);
				// Redirect to BE which will handle logic and redirect back to FE
				window.location.href = decodedText;
			},
			() => {
				// Silent errors for scanning frames
			},
		);

		return () => {
			scanner.clear().catch((error) => {
				console.error('Failed to clear scanner:', error);
			});
		};
	}, []);

	return (
		<div className='min-h-screen bg-slate-950 flex flex-col text-white font-sans relative overflow-hidden'>
			{/* Decorative background elements */}
			<div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px]'></div>
			<div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]'></div>

			{/* Header */}
			<header className='p-6 flex items-center justify-between z-10'>
				<button
					onClick={() => navigate(-1)}
					className='w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 cursor-pointer'
				>
					<ArrowLeft size={24} />
				</button>
				<div className='text-center'>
					<h1 className='text-sm font-black uppercase tracking-[0.3em] text-orange-500'>
						Scan & Eat
					</h1>
					<p className='text-[10px] text-slate-400 font-bold uppercase mt-1'>
						Quét mã để gọi món
					</p>
				</div>
				<div className='w-12'></div>
			</header>

			{/* Main Content */}
			<main className='flex-1 flex flex-col items-center justify-center p-6 z-10'>
				<div className='relative w-full max-w-sm aspect-square'>
					{/* Scanner Square Overlay Corners */}
					<div className='absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-500 rounded-tl-3xl z-20'></div>
					<div className='absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-500 rounded-tr-3xl z-20'></div>
					<div className='absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-orange-500 rounded-bl-3xl z-20'></div>
					<div className='absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-orange-500 rounded-br-3xl z-20'></div>

					{/* Loading State Animation */}
					<div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
						<div className='w-full h-0.5 bg-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,1)] animate-[scan_2s_infinite_ease-in-out] z-20'></div>
					</div>

					<div
						id='reader'
						className='w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl'
					>
						{/* html5-qrcode will render here */}
					</div>
				</div>

				<div className='mt-12 text-center space-y-6 max-w-xs'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 mb-2'>
						<QrCode size={32} className='text-orange-500' />
					</div>
					<h2 className='text-2xl font-black italic uppercase tracking-tight'>
						Dưới <span className='text-orange-500'>Khung Hình</span>
					</h2>
					<p className='text-slate-400 text-sm font-medium leading-relaxed italic border-l-2 border-orange-500/30 pl-4'>
						Vui lòng căn chỉnh mã QR vào chính giữa khung hình. Hệ thống sẽ tự
						động chuyển hướng bạn đến thư đơn của gian hàng.
					</p>
				</div>
			</main>

			{/* Footer / Status */}
			<footer className='p-10 flex justify-center z-10'>
				<div className='bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-3'>
					<ShieldCheck size={20} className='text-emerald-500' />
					<span className='text-[10px] font-black uppercase tracking-widest text-slate-300'>
						Kết nối an toàn & bảo mật
					</span>
				</div>
			</footer>

			<style>{`
				@keyframes scan {
					0%, 100% { transform: translateY(-125px); opacity: 0; }
					50% { transform: translateY(125px); opacity: 1; }
				}
				#reader { border: none !important; }
				#reader__status_span { display: none !important; }
				#reader video { 
					object-fit: cover !important;
					width: 100% !important;
					height: 100% !important;
				}
				#reader__dashboard { background: transparent !important; }
				#reader__camera_selection {
					background: rgba(255,255,255,0.05) !important;
					border: 1px solid rgba(255,255,255,0.1) !important;
					color: white !important;
					padding: 8px !important;
					border-radius: 8px !important;
					font-size: 12px !important;
					margin-bottom: 10px !important;
				}
				#reader__dashboard_section_csr button {
					background: #f97316 !important;
					color: white !important;
					border: none !important;
					padding: 10px 20px !important;
					border-radius: 12px !important;
					font-weight: 900 !important;
					text-transform: uppercase !important;
					font-size: 10px !important;
					letter-spacing: 0.1em !important;
					cursor: pointer !important;
				}
			`}</style>
		</div>
	);
}

export default ScanPage;
