import React from 'react';
import { Navigation, Plus, Edit, ShieldAlert, Music, Globe, Bot, Play, Square, Loader2 } from 'lucide-react';
import type { Stall } from '../../types/stall.types';
import { toast } from 'react-toastify';
import type { StallTranslation } from '../../api/audioApi';

interface ShopSettingsProps {
	tmpStall: Partial<Stall>;
	onStallChange: (data: Partial<Stall>) => void;
	onSaveStall: (e: React.FormEvent) => void;
	onOpenLocModal: () => void;
	translations: StallTranslation[];
	selectedAudioLang: string;
	onSelectedAudioLangChange: (lang: string) => void;
	onGenerateAudio: () => void;
	isGeneratingAudio: boolean;
	onPlayAudio: (url?: string) => void;
	isPlaying: boolean;
}

export default function ShopSettings({
	tmpStall,
	onStallChange,
	onSaveStall,
	onOpenLocModal,
	translations,
	selectedAudioLang,
	onSelectedAudioLangChange,
	onGenerateAudio,
	isGeneratingAudio,
	onPlayAudio,
	isPlaying,
}: ShopSettingsProps) {
	const handleFileSelect = (file: File) => {
		if (!file.type.startsWith('image/')) {
			toast.error('Vui lòng chọn file hình ảnh!');
			return;
		}

		// Tạo preview URL cục bộ ngay lập tức và lưu file đối tượng
		const localPreview = URL.createObjectURL(file);
		onStallChange({
			...tmpStall,
			image: localPreview,
			imageFile: file,
		});
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='mb-12'>
				<div className='flex items-center gap-3 mb-2'>
					<div className='w-10 h-1 bg-orange-500 rounded-full'></div>
					<span className='text-xs font-black text-orange-500 uppercase tracking-[0.3em]'>
						Profile Setting
					</span>
				</div>
				<h1 className='text-4xl font-black text-slate-900 italic tracking-tight'>
					CÀI ĐẶT GIAN HÀNG
				</h1>
				<p className='text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]'>
					Quản lý thông tin hiển thị và giới thiệu về gian hàng của bạn
				</p>
			</div>

			<div className='bg-white rounded-4xl shadow-2xl shadow-orange-500/5 border border-slate-100 overflow-hidden'>
				<form onSubmit={onSaveStall} className='p-12 space-y-10'>
					<div className='grid grid-cols-2 gap-10'>
						<div className='col-span-2'>
							<label className='block text-xs font-black uppercase tracking-widest text-slate-400 mb-4'>
								Tên Gian Hàng
							</label>
							<input
								required
								type='text'
								value={tmpStall.name || ''}
								onChange={(e) =>
									onStallChange({ ...tmpStall, name: e.target.value })
								}
								className='w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-black text-xl text-slate-900 focus:outline-none focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 transition-all italic tracking-tight'
							/>
						</div>
						<div className='col-span-2'>
							<label className='block text-xs font-black uppercase tracking-widest text-slate-400 mb-4'>
								Danh mục đặc trưng
							</label>
							<input
								type='text'
								value={tmpStall.category || ''}
								onChange={(e) =>
									onStallChange({ ...tmpStall, category: e.target.value })
								}
								className='w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-bold focus:outline-none focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 transition-all'
								placeholder='VD: Ăn vặt, Hải sản, Đồ uống...'
							/>
						</div>
						<div className='col-span-2'>
							<div className='flex justify-between items-end mb-4'>
								<label className='block text-xs font-black uppercase tracking-widest text-slate-400'>
									Vị trí tọa độ (GPS)
								</label>
								<button
									type='button'
									onClick={onOpenLocModal}
									className='flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm cursor-pointer'
								>
									<Navigation size={14} className='rotate-45' /> Xác nhận trên
									Map
								</button>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='relative'>
									<span className='absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase'>
										LAT
									</span>
									<input
										required
										type='text'
										value={tmpStall.latitude || ''}
										onChange={(e) =>
											onStallChange({ ...tmpStall, latitude: e.target.value })
										}
										className='w-full bg-slate-50 border border-slate-100 pl-16 pr-8 py-5 rounded-2xl font-black text-slate-900 focus:outline-none focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 transition-all'
										placeholder='0.000000'
									/>
								</div>
								<div className='relative'>
									<span className='absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase'>
										LNG
									</span>
									<input
										required
										type='text'
										value={tmpStall.longitude || ''}
										onChange={(e) =>
											onStallChange({ ...tmpStall, longitude: e.target.value })
										}
										className='w-full bg-slate-50 border border-slate-100 pl-16 pr-8 py-5 rounded-2xl font-black text-slate-900 focus:outline-none focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 transition-all'
										placeholder='0.000000'
									/>
								</div>
							</div>
						</div>
						<div className='col-span-2'>
							<label className='block text-xs font-black uppercase tracking-widest text-slate-400 mb-4'>
								Giới thiệu về gian hàng
							</label>
							<textarea
								rows={4}
								value={(tmpStall.description as string) || ''}
								onChange={(e) =>
									onStallChange({
										...tmpStall,
										description: e.target.value,
									})
								}
								className='w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-bold focus:outline-none focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none leading-relaxed text-slate-600'
								placeholder='VD: Quán chuyên các món hải sản bình dân vùng biển...'
							/>
						</div>
						<div className='col-span-2'>
							<div className='flex items-center gap-3 mb-4'>
								<label className='block text-xs font-black uppercase tracking-widest text-slate-400'>
									Kịch bản thuyết minh tự động (GPS)
								</label>
								<span className='bg-orange-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter animate-pulse'>
									Mới
								</span>
							</div>
							<textarea
								rows={6}
								value={tmpStall.script || ''}
								onChange={(e) =>
									onStallChange({
										...tmpStall,
										script: e.target.value,
									})
								}
								className='w-full bg-slate-900 border border-slate-800 px-8 py-6 rounded-2xl font-bold focus:outline-none focus:ring-8 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none leading-relaxed text-orange-100 placeholder:text-slate-700'
								placeholder='Nhập nội dung thuyết minh khi khách hàng đến gần shop của bạn. Hệ thống sẽ tự động phát âm nội dung này...'
							/>
							<p className='mt-3 text-[10px] font-bold text-slate-400 italic flex items-center gap-2'>
								<ShieldAlert size={14} className='text-orange-500' /> Nội dung
								này sẽ được phát tự động qua giọng nói AI khi khách hàng đi vào
								gian hàng.
							</p>

							{/* Audio Generation Controls */}
							<div className='mt-8 pt-8 border-t border-slate-100'>
								<div className='flex flex-wrap items-center gap-4 mb-6'>
									<div className='flex-1 min-w-[200px]'>
										<label className='block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2'>
											Ngôn ngữ Audio
										</label>
										<div className='relative'>
											<Globe className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
											<select
												value={selectedAudioLang}
												onChange={(e) => onSelectedAudioLangChange(e.target.value)}
												className='w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-3 rounded-xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none cursor-pointer'
											>
												<option value='vi'>Tiếng Việt (Vietnamese)</option>
												<option value='en'>Tiếng Anh (English)</option>
												<option value='ko'>Tiếng Hàn (Korean)</option>
												<option value='ja'>Tiếng Nhật (Japanese)</option>
												<option value='zh'>Tiếng Trung (Chinese)</option>
											</select>
										</div>
									</div>

									<div className='flex items-end gap-3'>
										<button
											type='button'
											onClick={onGenerateAudio}
											disabled={isGeneratingAudio}
											className='bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer h-[46px]'
										>
											{isGeneratingAudio ? (
												<>
													<Loader2 size={16} className='animate-spin' />
													Đang xử lý...
												</>
											) : (
												<>
													<Bot size={16} />
													Gen Audio
												</>
											)}
										</button>

										<button
											type='button'
											onClick={() => {
												const current = translations.find(t => t.languageCode === selectedAudioLang);
												onPlayAudio(current?.audioUrl);
											}}
											className='bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 cursor-pointer h-[46px]'
										>
											{isPlaying ? (
												<>
													<Square size={16} fill='white' />
													Dừng
												</>
											) : (
												<>
													<Play size={16} fill='white' />
													Nghe thử
												</>
											)}
										</button>
									</div>
								</div>

								{/* Existing Audio List */}
								{translations.length > 0 && (
									<div className='bg-slate-50 rounded-2xl p-6'>
										<div className='flex items-center gap-2 mb-4'>
											<Music size={16} className='text-orange-500' />
											<span className='text-[10px] font-black uppercase tracking-widest text-slate-500'>
												Danh sách Audio hiện có
											</span>
										</div>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
											{translations.map((t) => (
												<div 
													key={t.id}
													className='flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm'
												>
													<div className='flex items-center gap-3'>
														<div className='w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-black text-xs'>
															{t.languageCode.toUpperCase()}
														</div>
														<div>
															<p className='text-[10px] font-black text-slate-900 uppercase'>
																{t.languageCode === 'vi' ? 'Tiếng Việt' : 
																 t.languageCode === 'en' ? 'Tiếng Anh' : 
																 t.languageCode === 'ko' ? 'Tiếng Hàn' : 
																 t.languageCode === 'ja' ? 'Tiếng Nhật' : t.languageCode}
															</p>
															<p className='text-[8px] font-bold text-slate-400'>
																{t.audioStatus === 'COMPLETED' ? 'Đã sẵn sàng' : 'Đang xử lý'}
															</p>
														</div>
													</div>
													<button
														type='button'
														onClick={() => onPlayAudio(t.audioUrl)}
														className='p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-orange-500 transition-colors cursor-pointer'
													>
														<Play size={14} fill='currentColor' />
													</button>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
						<div className='col-span-2'>
							<label className='block text-xs font-black uppercase tracking-widest text-slate-400 mb-4'>
								Ảnh bìa & Hình ảnh gian hàng
							</label>
							<div
								onDragOver={(e) => {
									e.preventDefault();
									e.currentTarget.classList.add(
										'border-orange-500',
										'bg-orange-50/50',
									);
								}}
								onDragLeave={(e) => {
									e.preventDefault();
									e.currentTarget.classList.remove(
										'border-orange-500',
										'bg-orange-50/50',
									);
								}}
								onDrop={(e) => {
									e.preventDefault();
									e.currentTarget.classList.remove(
										'border-orange-500',
										'bg-orange-50/50',
									);
									const file = e.dataTransfer.files[0];
									if (file) {
										handleFileSelect(file);
									}
								}}
								onClick={() =>
									document.getElementById('stallFileInput')?.click()
								}
								className='w-full border-4 border-dashed border-slate-100 rounded-4xl p-10 flex items-center gap-10 bg-slate-50/30 hover:bg-white hover:border-orange-500 transition-all cursor-pointer group shadow-inner relative overflow-hidden'
							>
								{tmpStall.image ? (
									<>
										<div className='w-40 h-40 rounded-3xl overflow-hidden shadow-2xl relative group-hover:rotate-2 transition-transform shrink-0'>
											<img
												src={tmpStall.image}
												alt='Preview'
												className='w-full h-full object-cover'
											/>
										</div>
										<div className='flex-1'>
											<p className='text-xl font-black text-slate-900 uppercase italic tracking-tight'>
												Kéo thả ảnh mới để thay đổi
											</p>
											<p className='text-xs font-bold text-slate-400 uppercase tracking-widest mt-2'>
												Ảnh bìa gian hàng là ấn tượng đầu tiên của khách hàng
											</p>
											<div className='mt-6 flex gap-3'>
												<span className='bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest'>
													{tmpStall.imageFile
														? 'New Selection (Draft)'
														: 'Current Metadata'}
												</span>
											</div>
										</div>
									</>
								) : (
									<div className='w-full flex flex-col items-center justify-center gap-4 py-10'>
										<div className='w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-300'>
											<Plus size={32} />
										</div>
										<p className='font-black text-slate-400 uppercase tracking-widest text-xs'>
											Phóng ảnh bìa của bạn lên đây
										</p>
									</div>
								)}
								<input
									id='stallFileInput'
									type='file'
									accept='image/*'
									className='hidden'
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) {
											handleFileSelect(file);
										}
									}}
								/>
							</div>
						</div>
					</div>

					<div className='pt-6'>
						<button
							type='submit'
							className='w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-orange-900/40 hover:bg-orange-600 transition-all active:scale-95 group relative overflow-hidden cursor-pointer'
						>
							<span className='relative z-10 flex items-center justify-center gap-4'>
								LƯU TẤT CẢ THÔNG TIN <Edit size={20} />
							</span>
							<div className='absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform'></div>
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
