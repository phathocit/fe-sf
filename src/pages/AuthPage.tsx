import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
	ArrowLeft,
	Mail,
	Lock,
	User,
	Store,
	ShieldCheck,
	Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import authApi from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
	const { t } = useTranslation('auth');
	const { login } = useAuth();
	const [isLogin, setIsLogin] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		try {
			if (isLogin) {
				const response = await authApi.loginEmail({ email, password });
				if (response.code === 0) {
					login(response.result.token, response.result.account);

					const isAdmin = response.result.account.roles.some(
						(role) => role.name === 'ADMIN',
					);
					if (isAdmin) {
						navigate('/admin');
					} else {
						navigate('/vendor');
					}
				}
			} else {
				const ownerName = formData.get('ownerName') as string;
				const stallName = formData.get('stallName') as string;

				await authApi.registerVendor({
					ownerName,
					stallName,
					email,
					password,
				});
				toast.success(
					'Đăng ký thành công! Vui lòng đợi Admin phê duyệt gian hàng.',
					{
						icon: <span>⏳</span>,
					},
				);
				setIsLogin(true);
				setError(null);
			}
		} catch (err: unknown) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const errorObj = err as any;
			const status = errorObj.response?.status;
			const code = errorObj.response?.data?.code;
			const message =
				errorObj.response?.data?.message || (err as Error).message;

			if (code === 3003 || status === 403) {
				toast.error(message, {
					icon: <span>🔒</span>,
				});
				setError(null);
			} else {
				setError(message || 'An error occurred. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='h-screen bg-slate-950 text-white flex overflow-hidden font-sans'>
			{/* Nửa bên trái - Nội dung cho đối tác */}
			<div className='hidden lg:flex w-1/2 relative flex-col justify-end p-16'>
				<div className='absolute inset-0 z-0'>
					<img
						src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000'
						alt='Chef preparing food'
						className='w-full h-full object-cover opacity-50'
					/>
					<div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent'></div>
				</div>
				<div className='relative z-10 max-w-lg'>
					<div className='inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full mb-6'>
						<ShieldCheck size={16} className='text-orange-500' />
						<span className='text-[10px] font-black uppercase tracking-widest text-orange-500'>
							{t('partner_area')}
						</span>
					</div>
					<h2 className='text-5xl font-black italic uppercase tracking-tighter mb-6 leading-tight'>
						{t('hero_title').split(' ').slice(0, 3).join(' ')} <br />
						{t('hero_title').split(' ').slice(3, 5).join(' ')}{' '}
						<span className='text-orange-500 text-6xl block'>
							{t('hero_title').split(' ').slice(5).join(' ')}
						</span>
					</h2>
					<p className='text-slate-300 font-bold text-lg mb-8 leading-relaxed'>
						{t('hero_description')}
					</p>
				</div>
			</div>

			{/* Nửa bên phải Form Đăng nhập/Đăng ký */}
			<div className='w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-10 lg:p-12 xl:p-16 relative z-10 bg-slate-950'>
				<div className='absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none'></div>

				<div className='max-w-md w-full mx-auto flex flex-col justify-between h-[90vh] py-4'>
					<div>
						<Link
							to='/'
							className='cursor-pointer inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors font-black uppercase tracking-widest text-xs mb-8 w-max'
						>
							<ArrowLeft size={16} /> {t('back_home')}
						</Link>

						<div className='mb-6'>
							<div className='w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/30 mb-4 transform -rotate-6'>
								SF
							</div>
							<h1 className='text-3xl sm:text-4xl font-black italic tracking-tighter mb-2 uppercase'>
								{isLogin ? t('login_title') : t('register_title')}
							</h1>
							<p className='text-slate-400 font-bold text-sm'>
								{isLogin ? t('login_description') : t('register_description')}
							</p>
						</div>

						<div className='flex bg-slate-900 rounded-xl p-1 mb-6 shadow-inner'>
							<button
								onClick={() => setIsLogin(true)}
								className={`cursor-pointer flex-1 py-3 font-black text-xs uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
							>
								{t('tab_login')}
							</button>
							<button
								onClick={() => setIsLogin(false)}
								className={`cursor-pointer flex-1 py-3 font-black text-xs uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
							>
								{t('tab_register')}
							</button>
						</div>

						<form className='space-y-4' onSubmit={handleSubmit}>
							{error && (
								<div className='bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200'>
									{error}
								</div>
							)}
							{!isLogin && (
								<>
									<div className='space-y-1.5'>
										<label className='text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2'>
											{t('label_owner_name')}
										</label>
										<div className='relative'>
											<User
												className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500'
												size={18}
											/>
											<input
												name='ownerName'
												type='text'
												placeholder={t('placeholder_owner_name')}
												className='w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-sm'
												required
											/>
										</div>
									</div>
									<div className='space-y-1.5'>
										<label className='text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2'>
											{t('label_stall_name')}
										</label>
										<div className='relative'>
											<Store
												className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500'
												size={18}
											/>
											<input
												name='stallName'
												type='text'
												placeholder={t('placeholder_stall_name')}
												className='w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-sm'
												required
											/>
										</div>
									</div>
								</>
							)}

							<div className='space-y-1.5'>
								<label className='text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2'>
									{t('label_email')}
								</label>
								<div className='relative'>
									<Mail
										className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500'
										size={18}
									/>
									<input
										name='email'
										type='text'
										placeholder={t('placeholder_email')}
										className='w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-sm'
										// required
									/>
								</div>
							</div>

							<div className='space-y-1.5'>
								<div className='flex justify-between pl-2'>
									<label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
										{t('label_password')}
									</label>
									{isLogin && (
										<a
											href='#'
											className='cursor-pointer text-[10px] font-black text-orange-500 hover:underline hover:text-orange-400'
										>
											{t('forgot_password')}
										</a>
									)}
								</div>
								<div className='relative'>
									<Lock
										className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500'
										size={18}
									/>
									<input
										name='password'
										type='password'
										placeholder={t('placeholder_password')}
										className='w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-lg tracking-widest'
										required
									/>
								</div>
							</div>

							<button
								type='submit'
								disabled={isLoading}
								className='cursor-pointer w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all active:translate-y-0 mt-3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0'
							>
								{isLoading ? (
									<Loader2 size={18} className='animate-spin' />
								) : isLogin ? (
									t('btn_login')
								) : (
									t('btn_register')
								)}
							</button>
						</form>
					</div>

					<div className='mt-8 pt-6 border-t border-slate-900'>
						<p className='text-slate-500 text-[10px] font-bold text-center leading-relaxed'>
							{t('footer_terms')}
							<a href='#' className='text-slate-400 underline'>
								{t('footer_tos')}
							</a>
							{t('footer_and')}
							<a href='#' className='text-slate-400 underline'>
								{t('footer_privacy')}
							</a>
							{t('footer_suffix')}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
