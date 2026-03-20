import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
	ArrowLeft,
	Mail,
	Lock,
	User,
	Store,
	Phone,
	ShieldCheck,
} from 'lucide-react';

export default function AuthPage() {
	const { t } = useTranslation('auth');
	const [isLogin, setIsLogin] = useState(true);
	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isLogin) {
			const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
			if (email.includes('admin')) {
				navigate('/admin');
			} else {
				navigate('/vendor');
			}
		} else {
			navigate('/vendor');
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
						<span className='text-orange-500 text-6xl block'>{t('hero_title').split(' ').slice(5).join(' ')}</span>
					</h2>
					<p className='text-slate-300 font-bold text-lg mb-8 leading-relaxed'>
						{t('hero_description')}
					</p>
					<div className='flex items-center gap-8'>
						<div>
							<div className='text-3xl font-black text-white italic'>50+</div>
							<div className='text-[10px] uppercase font-black tracking-widest text-slate-500'>
								{t('stat_stalls')}
							</div>
						</div>
						<div className='w-px h-8 bg-slate-800'></div>
						<div>
							<div className='text-3xl font-black text-white italic'>10K+</div>
							<div className='text-[10px] uppercase font-black tracking-widest text-slate-500'>
								{t('stat_foodies')}
							</div>
						</div>
					</div>
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
								{isLogin
									? t('login_description')
									: t('register_description')}
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
							{!isLogin && (
								<>
									<div className='grid grid-cols-2 gap-4'>
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
													type='text'
													placeholder={t('placeholder_owner_name')}
													className='w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-sm'
													required
												/>
											</div>
										</div>
										<div className='space-y-1.5'>
											<label className='text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2'>
												{t('label_phone')}
											</label>
											<div className='relative'>
												<Phone
													className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500'
													size={18}
												/>
												<input
													type='tel'
													placeholder={t('placeholder_phone')}
													className='w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-sm'
													required
												/>
											</div>
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
										type='email'
										placeholder={t('placeholder_email')}
										className='w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-sm'
										required
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
										type='password'
										placeholder={t('placeholder_password')}
										className='w-full bg-slate-900 border-2 border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:bg-slate-800 transition-all font-bold placeholder:text-slate-600 text-lg tracking-widest'
										required
									/>
								</div>
							</div>

							<button
								type='submit'
								className='cursor-pointer w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all active:translate-y-0 mt-3'
							>
								{isLogin ? t('btn_login') : t('btn_register')}
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
