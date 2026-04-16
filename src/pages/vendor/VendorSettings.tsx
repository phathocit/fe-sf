import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import stallApi from '../../api/stallApi';
import type { Stall } from '../../types/stall.types';
import ShopSettings from '../../components/vendor/ShopSettings';
import LocationModal from '../../components/vendor/LocationModal';
import { toast } from 'react-toastify';
import cloudinaryApi from '../../api/cloudinaryApi';
import audioApi, { type StallTranslation } from '../../api/audioApi';

export default function VendorSettings() {
	const { stall, setStall } = useOutletContext<{
		stall: Stall;
		setStall: (s: Stall) => void;
	}>();
	const [tmpStall, setTmpStall] = useState<Partial<Stall>>(() => {
		if (stall) {
			return {
				...stall,
				coordinates: [
					Number(stall.latitude) || 10.7601,
					Number(stall.longitude) || 106.7042,
				],
			};
		}
		return {};
	});
	const [isLocModalOpen, setIsLocModalOpen] = useState(false);
	const [translations, setTranslations] = useState<StallTranslation[]>([]);
	const [selectedAudioLang, setSelectedAudioLang] = useState('vi');
	const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const navigate = useNavigate();

	const fetchTranslations = useCallback(async () => {
		if (!stall) return;
		try {
			const res = await audioApi.getTranslationsByStall(stall.id);
			if (res.result) {
				setTranslations(res.result);
			}
		} catch (error) {
			console.error('Failed to fetch translations:', error);
		}
	}, [stall]);

	useEffect(() => {
		fetchTranslations();
	}, [fetchTranslations]);

	const handlePlayAudio = (url?: string) => {
		if (!url) {
			toast.error('Không tìm thấy file audio!');
			return;
		}

		if (isPlaying) {
			audioRef.current?.pause();
			setIsPlaying(false);
		} else {
			if (!audioRef.current) {
				console.log('>>>>>>>>>>>.', url);
				audioRef.current = new Audio(url);
				audioRef.current.onended = () => setIsPlaying(false);
			} else {
				audioRef.current.src = url;
			}
			audioRef.current.play();
			setIsPlaying(true);
		}
	};

	const handleGenerateAudio = async () => {
		if (!stall || !tmpStall.script) {
			toast.warning('Vui lòng nhập kịch bản trước khi gen audio!');
			return;
		}

		setIsGeneratingAudio(true);
		try {
			// Đầu tiên, lưu lại kịch bản (để cập nhật bản dịch tiếng Việt gốc trong DB)
			// Điều này đảm bảo các bản dịch ngôn ngữ khác sẽ dịch từ nội dung mới nhất
			const updateData = {
				...tmpStall,
				streetId: stall.streetId,
				vendorId: stall.vendorId,
			};
			await stallApi.update(stall.id, updateData as Stall);

			// Gọi API lấy audio (API này sẽ tự kích hoạt tiến trình xử lý AI nếu cần)
			let status = 'PROCESSING';
			let attempts = 0;
			const maxAttempts = 2;

			while (
				(status === 'PROCESSING' || status === 'PENDING') &&
				attempts < maxAttempts
			) {
				const res = await audioApi.getStallAudio(stall.id, selectedAudioLang);
				status = res.result?.status || 'ERROR';

				if (status === 'COMPLETED') {
					toast.success('Audio đã được tạo thành công!');
					break;
				}
				if (status === 'ERROR') {
					throw new Error('Backend failed to process audio');
				}

				await new Promise((resolve) => setTimeout(resolve, 3000));
				attempts++;
			}

			if (status !== 'COMPLETED') {
				toast.error('Hệ thống đang bận, vui lòng kiểm tra lại sau ít phút!');
			}

			await fetchTranslations();
		} catch (error) {
			console.error('Audio generation failed:', error);
			toast.error('Có lỗi xảy ra khi tạo hoặc đồng bộ audio!');
		} finally {
			setIsGeneratingAudio(false);
		}
	};

	const handleSaveStall = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!stall || !tmpStall) return;

		try {
			const finalStall = { ...tmpStall };

			// Nếu có file mới, upload lên Cloudinary trước
			if (tmpStall.imageFile) {
				const uploadRes = await cloudinaryApi.upload(
					tmpStall.imageFile,
					'stall',
					stall.id.toString(),
				);
				if (uploadRes.result) {
					finalStall.image = uploadRes.result.url;
				}
			}

			// Đảm bảo không gửi blob URL lên server
			if (finalStall.image?.startsWith('blob:')) {
				finalStall.image = stall.image || '';
			}

			const updateData = {
				...finalStall,
				streetId: stall.streetId,
				vendorId: stall.vendorId,
				latitude:
					finalStall.latitude ||
					(finalStall.coordinates
						? finalStall.coordinates[0].toString()
						: stall.latitude),
				longitude:
					finalStall.longitude ||
					(finalStall.coordinates
						? finalStall.coordinates[1].toString()
						: stall.longitude),
			};

			const res = await stallApi.update(stall.id, updateData as Stall);
			if (res.result) {
				setStall(res.result);
				toast.success('Thông tin gian hàng đã được cập nhật thành công!');
				navigate('/vendor/menu');
			}
		} catch (error) {
			console.error('Failed to update stall info:', error);
			toast.error('Có lỗi xảy ra khi cập nhật thông tin gian hàng!');
		}
	};

	return (
		<div key={stall?.id}>
			<ShopSettings
				tmpStall={tmpStall}
				onStallChange={setTmpStall}
				onSaveStall={handleSaveStall}
				onOpenLocModal={() => setIsLocModalOpen(true)}
				translations={translations}
				selectedAudioLang={selectedAudioLang}
				onSelectedAudioLangChange={setSelectedAudioLang}
				onGenerateAudio={handleGenerateAudio}
				isGeneratingAudio={isGeneratingAudio}
				onPlayAudio={handlePlayAudio}
				isPlaying={isPlaying}
			/>

			{isLocModalOpen && (
				<LocationModal
					tmpStall={tmpStall}
					onClose={() => setIsLocModalOpen(false)}
					onStallChange={setTmpStall}
				/>
			)}
		</div>
	);
}
