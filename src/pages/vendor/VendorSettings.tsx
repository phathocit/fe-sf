import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import stallApi from '../../api/stallApi';
import type { Stall } from '../../types/stall.types';
import ShopSettings from '../../components/vendor/ShopSettings';
import LocationModal from '../../components/vendor/LocationModal';
import { toast } from 'react-toastify';
import cloudinaryApi from '../../api/cloudinaryApi';

export default function VendorSettings() {
	const { stall, setStall } = useOutletContext<{ 
		stall: Stall, 
		setStall: (s: Stall) => void 
	}>();
	const [tmpStall, setTmpStall] = useState<Partial<Stall>>({});
	const [isLocModalOpen, setIsLocModalOpen] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (stall) {
			setTmpStall({
				...stall,
				coordinates: [Number(stall.latitude) || 10.7601, Number(stall.longitude) || 106.7042],
			});
		}
	}, [stall]);

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
					stall.id.toString()
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
				latitude: finalStall.latitude || (finalStall.coordinates ? finalStall.coordinates[0].toString() : stall.latitude),
				longitude: finalStall.longitude || (finalStall.coordinates ? finalStall.coordinates[1].toString() : stall.longitude),
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
		<>
			<ShopSettings
				tmpStall={tmpStall}
				onStallChange={setTmpStall}
				onSaveStall={handleSaveStall}
				onOpenLocModal={() => setIsLocModalOpen(true)}
			/>

			{isLocModalOpen && (
				<LocationModal
					tmpStall={tmpStall}
					onClose={() => setIsLocModalOpen(false)}
					onStallChange={setTmpStall}
				/>
			)}
		</>
	);
}
