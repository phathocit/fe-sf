import { useState, useEffect } from "react";
import stallApi from "../../api/stallApi";
import foodApi from "../../api/foodApi";
import type { Stall } from "../../types/stall.types";
import type { Food } from "../../types/food.types";
import cloudinaryApi from "../../api/cloudinaryApi";

// Components
import VendorSidebar from "../../components/vendor/VendorSidebar";
import MenuManager from "../../components/vendor/MenuManager";
import Analytics from "../../components/vendor/Analytics";
import ShopSettings from "../../components/vendor/ShopSettings";
import MenuModal from "../../components/vendor/MenuModal";
import LocationModal from "../../components/vendor/LocationModal";
import VendorPending from "../../components/vendor/VendorPending";
import VendorLoading from "../../components/vendor/VendorLoading";

import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import type { StallTranslation } from "../../api/audioApi";

export default function VendorDashboard() {
  const { user: account, logout } = useAuth();
  const [stall, setStall] = useState<Stall | null>(null);
  const [menu, setMenu] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "settings" | "analytics">(
    "menu",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Food> | null>(null);
  const [tmpStall, setTmpStall] = useState<Partial<Stall>>({});
  const [translations, setTranslations] = useState<StallTranslation[]>([]);
  const [selectedAudioLang, setSelectedAudioLang] = useState("vi");
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (account) {
      const fetchData = async () => {
        try {
          const stallRes = await stallApi.getByVendorId(Number(account.id));
          if (stallRes.result) {
            const s = stallRes.result;
            setStall(s);

            if (!s.isActive) {
              setIsPending(true);
            } else {
              const foodRes = await foodApi.getByStallId(Number(s.id));
              if (foodRes.result) {
                setMenu(foodRes.result);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch vendor data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [account]);

  const handleLogout = () => {
    logout();
  };

  const handleOpenModal = (item?: Food) => {
    if (item) {
      setCurrentItem({ ...item });
    } else {
      setCurrentItem({
        name: "",
        price: 0,
        image: "",
        description: "",
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
        // Sử dụng currentItem.id làm publicId nếu đang cập nhật món cũ
        const uploadRes = await cloudinaryApi.upload(
          currentItem.imageFile,
          "food",
          currentItem.id?.toString(),
        );
        if (uploadRes.result) {
          finalItem.image = uploadRes.result.url;
        }
      }

      // Đảm bảo không gửi blob URL lên server nếu upload thất bại hoặc không có file
      if (finalItem.image?.startsWith("blob:")) {
        finalItem.image = "";
      }

      if (finalItem.id) {
        // Update
        const res = await foodApi.update(finalItem.id, finalItem as Food);
        if (res.result) {
          setMenu(menu.map((m) => (m.id === finalItem.id ? res.result : m)));
          toast.success("Cập nhật món ăn thành công!");
        }
      } else {
        // Create
        const res = await foodApi.create({
          ...(finalItem as Food),
          stallId: stall.id.toString(),
        });
        if (res.result) {
          setMenu([...menu, res.result]);
          toast.success("Thêm món ăn mới thành công!");
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save menu item:", error);
      toast.error("Có lỗi xảy ra khi lưu món ăn!");
    }
  };

  const handleSaveStall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stall || !tmpStall) return;

    try {
      const finalStall = { ...tmpStall };

      // Nếu có file mới, upload lên Cloudinary trước
      if (tmpStall.imageFile) {
        // Sử dụng stall.id làm publicId
        const uploadRes = await cloudinaryApi.upload(
          tmpStall.imageFile,
          "stall",
          stall.id.toString(),
        );
        if (uploadRes.result) {
          finalStall.image = uploadRes.result.url;
        }
      }

      // Đảm bảo không gửi blob URL lên server
      if (finalStall.image?.startsWith("blob:")) {
        finalStall.image = stall.image || ""; // Fallback về ảnh cũ
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
        toast.success("Thông tin gian hàng đã được cập nhật thành công!");
        setActiveTab("menu");
      }
    } catch (error) {
      console.error("Failed to update stall info:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin gian hàng!");
    }
  };

  const handlePlayAudio = (url?: string) => {
    if (!url) {
      toast.warning("Không tìm thấy đường dẫn âm thanh");
      return;
    }

    const audio = new Audio(url);
    setIsPlaying(true);

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      toast.error("Không thể phát âm thanh này");
    };
    audio.play();
  };

  const handleGenerateAudio = async () => {
    if (!stall?.id) return;
    try {
      setIsGeneratingAudio(true);
      // Giả sử bạn gọi API ở đây:
      // await audioApi.generate(stall.id, selectedAudioLang);
      toast.info("Yêu cầu tạo âm thanh đang được xử lý...");
    } catch (error) {
      console.error("Failed to generate audio:", error);
      toast.error("Có lỗi xảy ra khi tạo âm thanh!");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  if (isLoading) return <VendorLoading />;
  if (isPending) return <VendorPending onLogout={handleLogout} />;

  if (!stall) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 p-10 text-center">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
          KHÔNG TÌM THẤY <span className="text-rose-500">GIAN HÀNG</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">
          Tài khoản này chưa được liên kết với bất kỳ gian hàng nào.
        </p>
        <button
          onClick={handleLogout}
          className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-2xl shadow-rose-600/20 cursor-pointer"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <VendorSidebar
        stall={stall}
        account={account}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "settings") {
            setTmpStall({
              ...stall,
              coordinates: [
                Number(stall.latitude) || 10.7601,
                Number(stall.longitude) || 106.7042,
              ],
            });
          }
          setActiveTab(tab);
        }}
        onLogout={handleLogout}
      />

      <div className="flex-1 p-12 overflow-y-auto">
        {activeTab === "menu" && (
          <MenuManager
            menu={menu}
            onAddItem={() => handleOpenModal()}
            onEditItem={handleOpenModal}
          />
        )}

        {activeTab === "analytics" && <Analytics stallId={stall.id} />}

        {activeTab === "settings" && (
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
        )}
      </div>

      {isModalOpen && currentItem && (
        <MenuModal
          currentItem={currentItem}
          onClose={() => setIsModalOpen(false)}
          onChange={setCurrentItem}
          onSave={handleSaveMenu}
        />
      )}

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
