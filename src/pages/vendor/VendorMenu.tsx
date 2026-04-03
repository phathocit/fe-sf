import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import foodApi from '../../api/foodApi';
import type { Food } from '../../types/food.types';
import type { Stall } from '../../types/stall.types';
import MenuManager from '../../components/vendor/MenuManager';
import MenuModal from '../../components/vendor/MenuModal';
import { toast } from 'react-toastify';
import cloudinaryApi from '../../api/cloudinaryApi';

export default function VendorMenu() {
	const { stall } = useOutletContext<{ stall: Stall }>();
	const [menu, setMenu] = useState<Food[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentItem, setCurrentItem] = useState<Partial<Food> | null>(null);

	useEffect(() => {
		if (stall) {
			const fetchMenu = async () => {
				const foodRes = await foodApi.getByStallId(Number(stall.id));
				if (foodRes.result) {
					setMenu(foodRes.result);
				}
			};
			fetchMenu();
		}
	}, [stall]);

	const handleOpenModal = (item?: Food) => {
		if (item) {
			setCurrentItem({ ...item });
		} else {
			setCurrentItem({
				name: '',
				price: 0,
				image: '',
				description: '',
				isAvailable: true,
			});
		}
		setIsModalOpen(true);
	};

	const handleSaveMenu = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentItem || !stall) return;

		try {
			const finalItem = { ...currentItem };

			// Nếu có file mới, upload lên Cloudinary trước
			if (currentItem.imageFile) {
				const uploadRes = await cloudinaryApi.upload(
					currentItem.imageFile, 
					'food', 
					currentItem.id?.toString()
				);
				if (uploadRes.result) {
					finalItem.image = uploadRes.result.url;
				}
			}

			// Đảm bảo không gửi blob URL lên server
			if (finalItem.image?.startsWith('blob:')) {
				finalItem.image = ''; 
			}

			if (finalItem.id) {
				const res = await foodApi.update(finalItem.id, finalItem as Food);
				if (res.result) {
					setMenu(menu.map((m) => (m.id === finalItem.id ? res.result : m)));
					toast.success('Cập nhật món ăn thành công!');
				}
			} else {
				const res = await foodApi.create({
					...(finalItem as Food),
					stallId: stall.id.toString(),
				});
				if (res.result) {
					setMenu([...menu, res.result]);
					toast.success('Thêm món ăn mới thành công!');
				}
			}
			setIsModalOpen(false);
		} catch (error) {
			console.error('Failed to save menu item:', error);
			toast.error('Có lỗi xảy ra khi lưu món ăn!');
		}
	};

	return (
		<>
			<MenuManager
				menu={menu}
				onAddItem={() => handleOpenModal()}
				onEditItem={handleOpenModal}
			/>

			{isModalOpen && currentItem && (
				<MenuModal
					currentItem={currentItem}
					onClose={() => setIsModalOpen(false)}
					onChange={setCurrentItem}
					onSave={handleSaveMenu}
				/>
			)}
		</>
	);
}
