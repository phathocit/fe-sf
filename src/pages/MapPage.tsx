import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import { Loader2, Menu, X, Volume2 } from "lucide-react";
import audioApi from "../api/audioApi";

import { toast } from "react-toastify";

import stallApi from "../api/stallApi";
import foodApi from "../api/foodApi";
import type { Stall } from "../types/stall.types";
import type { Food } from "../types/food.types";

// Components
import MapSidebar from "../components/map/MapSidebar";
import MapContent from "../components/map/MapContent";
import MenuModal from "../components/map/MenuModal";
import GpsSimulator from "../components/map/GpsSimulator";
import { Target } from "lucide-react";

// Icons
const userIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-2xl pulse-animation"></div>`,
  className: "user-marker",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const createStallIcon = (stall: Stall, isActive: boolean = false) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-12 h-12 rounded-2xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] ${isActive ? "border-[3px] border-orange-600 scale-125" : "border-2 border-orange-400/50"} transition-all duration-300 hover:scale-125 overflow-hidden flex items-center justify-center relative z-10">
          <img src="${stall.image || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800"}" class="flex-1 w-full h-full object-cover rounded-xl" />
        </div>
        ${isActive ? `<div class="absolute -top-2 -right-2 w-6 h-6 bg-orange-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg animate-bounce z-20 font-black text-[10px]">📍</div>` : ""}
      </div>
    `,
    className: `shop-marker ${isActive ? "active-marker" : ""}`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -20],
  });
};

export default function MapPage() {
  const { t } = useTranslation("map");
  const [searchParams] = useSearchParams();
  const defaultCenter: [number, number] = [10.7601, 106.7042];

  // States
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [activeStallId, setActiveStallId] = useState<number | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStallForModal, setSelectedStallForModal] =
    useState<Stall | null>(null);
  const [modalMenu, setModalMenu] = useState<Food[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGpsSimOpen, setIsGpsSimOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heardStalls = useRef<Set<number>>(new Set());
  const geofenceRadius = 25;
  const voiceTourEnabled = true;

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Lắng nghe sự kiện thay đổi trạng thái mạng
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Đã khôi phục kết nối mạng! Đang đồng bộ dữ liệu...");
      // Khi có mạng lại, có thể gọi lại hàm fetchStalls() để cập nhật dữ liệu mới nhất
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warn("Bạn đang ở chế độ ngoại tuyến. Dữ liệu có thể cũ hơn thực tế.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Dọn dẹp listener khi component bị hủy
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Data
  // Tìm hàm fetchStalls cũ và thay bằng đoạn này:
  useEffect(() => {
      const fetchStalls = async () => {
          try {
              const response = await stallApi.getAllActive();
              const data = response.result;
              
              setStalls(data);
              
              // Cất dữ liệu vào "ngăn kéo" LocalStorage
              localStorage.setItem('offline_stalls_data', JSON.stringify(data));

              // --- CHẠY NGẦM VIỆC TẢI TRƯỚC ---
              prefetchAllAudios(data); // Tải audio (đã làm ở bước trước)
              prefetchAllMenus(data);  // Tải menu món ăn (mới thêm)
        // ----------------------
              
          } catch (error) {
              console.error('Error fetching stalls:', error);
              
              // Nếu lỗi (thường là do mất mạng), hãy kiểm tra ngăn kéo
              const savedData = localStorage.getItem('offline_stalls_data');
              if (savedData) {
                  setStalls(JSON.parse(savedData));
                  toast.info("Bạn đang xem ở chế độ ngoại tuyến.");
              } else {
                  toast.error("Không có dữ liệu offline. Vui lòng kết nối mạng lần đầu.");
              }
          } finally {
              setLoading(false);
          }
      };
      fetchStalls();
  }, []);

  // Search & Filter Memo
  const categories = useMemo(
    () => ["All", ...new Set(stalls.map((s) => s.category))],
    [stalls],
  );
  const filteredStalls = useMemo(() => {
    return stalls.filter((stall) => {
      const matchesSearch = stall.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || stall.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stalls, searchQuery, selectedCategory]);

  // Helpers
  const getCoords = useCallback((stall: Stall): [number, number] => {
    return [Number(stall.latitude), Number(stall.longitude)];
  }, []);

  const getDistanceStr = useCallback(
    (coords: [number, number]) => {
      if (!userLoc) return "";
      const d = L.latLng(userLoc).distanceTo(L.latLng(coords));
      return d > 1000 ? `${(d / 1000).toFixed(1)} km` : `${Math.round(d)} m`;
    },
    [userLoc],
  );

  const isInsideGeofence = useCallback(
    (coords: [number, number]) => {
      if (!userLoc) return false;
      const distance = L.latLng(userLoc).distanceTo(L.latLng(coords));
      return distance <= geofenceRadius;
    },
    [userLoc],
  );

  // Handlers
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError(t("geo_support_error"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLoc([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setGeoError("");
      },
      () => setGeoError(t("geo_permission_error")),
    );
  }, [t]);

  const handleStallClick = useCallback(
    (stall: Stall) => {
      setMapCenter(getCoords(stall));
      setActiveStallId(stall.id);
      // Close sidebar on mobile after clicking a stall
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    },
    [getCoords],
  );

  const handleOpenModal = useCallback(async (stall: Stall) => {
    setSelectedStallForModal(stall);
    setModalLoading(true);
    
    try {
      // 1. Thử lấy menu mới nhất từ API
      const response = await foodApi.getByStallId(stall.id);
      const menuData = response.result.filter((item: Food) => item.isAvailable);
      
      setModalMenu(menuData);

      // 2. Cập nhật bản sao vào kho offline
      const savedMenus = JSON.parse(localStorage.getItem('offline_menus_data') || '{}');
      savedMenus[stall.id] = menuData;
      localStorage.setItem('offline_menus_data', JSON.stringify(savedMenus));

    } catch (error) {
      console.error('Error fetching modal menu:', error);
      
      // 3. Nếu mất mạng, lục trong kho offline xem có menu của quán này chưa
      const savedMenus = JSON.parse(localStorage.getItem('offline_menus_data') || '{}');
      if (savedMenus[stall.id]) {
        setModalMenu(savedMenus[stall.id]);
        toast.info("Hiển thị menu offline.");
      } else {
        toast.error("Không có dữ liệu menu offline cho quán này.");
      }
    } finally {
      setModalLoading(false);
    }
  }, []);

  // Geolocation Effect
  useEffect(() => {
    let isMounted = true;
    if (!navigator.geolocation) {
      if (isMounted) setGeoError("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted) return;
        const { latitude, longitude } = position.coords;
        setUserLoc([latitude, longitude]);
        setGeoError("");
      },
      () => {
        if (isMounted) setGeoError(t("geo_permission_error"));
      },
    );
    return () => {
      isMounted = false;
    };
  }, [t]);

  // URL Query param activation
  useEffect(() => {
    const stallIdFromQuery = searchParams.get("stallId");
    if (stallIdFromQuery && stalls.length > 0) {
      const id = Number(stallIdFromQuery);
      const targetStall = stalls.find((s) => s.id === id);
      if (targetStall) {
        handleStallClick(targetStall);
      }
    }
  }, [searchParams, stalls, handleStallClick]);

  // Voice Tour / Alert Effect
  useEffect(() => {
    if (!userLoc || !voiceTourEnabled || stalls.length === 0) {
      if (activeAudioId !== null) setActiveAudioId(null);
      return;
    }

    const stallInside = stalls.find((s) => isInsideGeofence(getCoords(s)));

    if (stallInside) {
      if (activeAudioId !== stallInside.id) {
        setActiveAudioId(stallInside.id);

        // Automatically play audio if inside zone and not already heard in this 'visit'
        if (!heardStalls.current.has(stallInside.id)) {
          handlePlayStallAudio(stallInside);
        }
      }
    } else {
      if (activeAudioId !== null) {
        setActiveAudioId(null);
        // Optionally stop audio when leaving zone, but usually we let it finish
      }
    }
  }, [
    userLoc,
    voiceTourEnabled,
    activeAudioId,
    isInsideGeofence,
    stalls,
    getCoords,
  ]);

  // Hàm tự động tải trước toàn bộ Audio của các quán
  const prefetchAllAudios = async (stallsToCache: Stall[]) => {
    // Chỉ chạy nếu trình duyệt hỗ trợ Cache và đang có mạng
    if (!('caches' in window) || !navigator.onLine) return;

    console.log("Bắt đầu tải trước toàn bộ audio thuyết minh...");
    const cache = await caches.open('stall-audio-cache');

    for (const stall of stallsToCache) {
      try {
        // 1. Gọi API lấy URL audio (giống như lúc nhấn nút)
        const res = await audioApi.getStallAudio(stall.id);
        
        if (res.result && res.result.audioUrl && res.result.status === "COMPLETED") {
          const audioUrl = res.result.audioUrl;

          // 2. Kiểm tra xem trong kho đã có chưa
          const match = await cache.match(audioUrl);
          if (!match) {
            // 3. Nếu chưa có thì âm thầm tải về cất đi
            await cache.add(audioUrl);
            console.log(`--- Đã tải xong audio: ${stall.name}`);
          }
        }
      } catch (err) {
        // Nếu lỗi 1 file thì bỏ qua để tải tiếp file sau
        console.warn(`Không thể tải trước audio cho quán ${stall.name}`, err);
      }
    }
    console.log("Hoàn tất việc tải trước audio!");
  };

  // Hàm tự động tải trước toàn bộ Menu của các quán
  const prefetchAllMenus = async (stallsToCache: Stall[]) => {
    if (!navigator.onLine) return;

    console.log("Đang kiểm tra và đồng bộ thực đơn mới nhất...");
    const savedMenus = JSON.parse(localStorage.getItem('offline_menus_data') || '{}');

    for (const stall of stallsToCache) {
      try {
        // Thay vì kiểm tra 'if (!savedMenus[stall.id])', 
        // chúng ta cứ tải lại để đảm bảo giá cả luôn mới nhất
        const response = await foodApi.getByStallId(stall.id);
        savedMenus[stall.id] = response.result.filter((item: Food) => item.isAvailable);
      } catch (err) {
        console.warn(`Lỗi đồng bộ menu quán ${stall.id}`, err);
      }
    }
    
    localStorage.setItem('offline_menus_data', JSON.stringify(savedMenus));
    console.log("Đã đồng bộ xong toàn bộ dữ liệu thực đơn!");
  };

  const handlePlayStallAudio = async (stall: Stall) => {
    try {
      setIsAudioPlaying(true);
      const res = await audioApi.getStallAudio(stall.id);

      if (
        res.result &&
        res.result.audioUrl &&
        res.result.status === "COMPLETED"
      ) {
        const audioUrl = res.result.audioUrl;

        // --- BẮT ĐẦU LOGIC OFFLINE CHO AUDIO ---
        // Khi người dùng nhấn nghe, trình duyệt sẽ tự động tải file này 
        // và cất vào một "kho riêng" tên là 'stall-audio-cache'
        if ('caches' in window) {
          try {
            const cache = await caches.open('stall-audio-cache');
            // Kiểm tra xem file này đã có trong kho chưa
            const response = await cache.match(audioUrl);
            if (!response) {
              // Nếu chưa có thì mới tải về và cất đi
              await cache.add(audioUrl);
              console.log(`Đã lưu offline audio cho: ${stall.name}`);
            }
          } catch (cacheError) {
            // Nếu lưu vào kho lỗi (do bộ nhớ đầy chẳng hạn) thì vẫn cho phát audio bình thường
            console.warn("Không thể lưu audio vào kho offline:", cacheError);
          }
        }
        // --- KẾT THÚC LOGIC OFFLINE ---

        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.onended = () => {
            setIsAudioPlaying(false);
          };
        }

        audioRef.current.src = audioUrl;
        audioRef.current.play().catch((e) => {
          console.warn(
            "Audio auto-play blocked by browser. User interaction needed.",
            e,
          );
          toast.info("Click để nghe thuyết minh về " + stall.name);
        });

        heardStalls.current.add(stall.id);
      } else {
        toast.info(
          `Gian hàng ${stall.name} hiện chưa có nội dung audio thuyết minh.`,
        );
        setIsAudioPlaying(false);
      }
    } catch (error) {
      console.error("Failed to play stall audio:", error);
      
      // Nếu mất mạng hoàn toàn, trình duyệt sẽ tự động tìm trong 'stall-audio-cache' 
      // nhờ vào Service Worker mà chúng ta đã cấu hình ở các bước trước.
      toast.error(
        "Không thể kết nối đến hệ thống audio. Vui lòng kiểm tra mạng.",
      );
      setIsAudioPlaying(false);
    }
  };
  const handleAudioToggle = useCallback(
    (stall: Stall) => {
      if (isAudioPlaying && activeAudioId === stall.id) {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsAudioPlaying(false);
        }
      } else {
        handlePlayStallAudio(stall);
      }
    },
    [isAudioPlaying, activeAudioId],
  );

  // Markers sync effect
  useEffect(() => {
    if (activeStallId) {
      const activeElement = document.getElementById(
        `stall-card-${activeStallId}`,
      );
      if (activeElement)
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const marker = markerRefs.current[activeStallId];
      if (marker) marker.openPopup();
    }
  }, [activeStallId]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
        <p className="font-black italic uppercase tracking-widest animate-pulse">
          Initializing Food-Map...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Thêm đoạn này vào một góc nào đó trong giao diện của bạn */}
      <div className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-[1000] 
        px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest 
        transition-all duration-500
        ${isOnline 
          ? 'bg-green-500 text-white opacity-0 pointer-events-none' 
          : 'bg-rose-500 text-white shadow-lg animate-pulse opacity-100'}
      `}>
          {isOnline ? '● Đã kết nối' : '⚠ Đang Offline'}
      </div>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-24 left-6 z-500 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 active:scale-95 transition-all"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <button
        onClick={() => setIsGpsSimOpen(!isGpsSimOpen)}
        className="fixed top-6 right-6 z-500 w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 active:scale-95 transition-all hover:bg-slate-900 group"
        title="GPS Simulator"
      >
        <Target size={24} />
        <div className="absolute right-full mr-4 bg-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 whitespace-nowrap pointer-events-none">
          Giả lập tọa độ GPS
        </div>
      </button>

      {isAudioPlaying && activeAudioId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-500 bg-slate-950/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
            <Volume2 size={24} className="text-white" />
          </div>
          <div>
            <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-0.5">
              Đang thuyết minh
            </div>
            <div className="text-white font-black italic uppercase tracking-tight text-sm">
              {stalls.find((s) => s.id === activeAudioId)?.name}
            </div>
          </div>
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                setIsAudioPlaying(false);
              }
            }}
            className="ml-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-rose-600 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div
        className={`
					fixed inset-0 z-400 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
					${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
				`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div
        className={`
				fixed md:relative inset-y-0 left-0 z-400 w-80 sm:w-100 transition-transform duration-500 ease-in-out
				${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
			`}
      >
        <MapSidebar
          stalls={stalls}
          filteredStalls={filteredStalls}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          activeStallId={activeStallId}
          onStallClick={handleStallClick}
          isInsideGeofence={isInsideGeofence}
          getDistanceStr={getDistanceStr}
          getCoords={getCoords}
          locateUser={locateUser}
          geoError={geoError}
          t={t}
        />
      </div>

      <div className="flex-1 h-full relative">
        <MapContent
          stalls={stalls}
          filteredStalls={filteredStalls}
          userLoc={userLoc}
          mapCenter={mapCenter}
          activeStallId={activeStallId}
          onStallClick={handleStallClick}
          onMapClick={() => setActiveStallId(null)}
          handleOpenModal={handleOpenModal}
          getCoords={getCoords}
          getDistanceStr={getDistanceStr}
          geofenceRadius={geofenceRadius}
          userIcon={userIcon}
          createStallIcon={createStallIcon}
          markerRefs={markerRefs}
          locateUser={locateUser}
          isAudioPlaying={isAudioPlaying}
          activeAudioId={activeAudioId}
          onAudioToggle={handleAudioToggle}
          t={t}
        />
        <GpsSimulator
          userLoc={userLoc}
          onLocChange={(loc) => {
            setUserLoc(loc);
            setMapCenter(loc);
            setGeoError("");
          }}
          stalls={stalls}
          isOpen={isGpsSimOpen}
          onClose={() => setIsGpsSimOpen(false)}
        />
      </div>

      <MenuModal
        stall={selectedStallForModal}
        menu={modalMenu}
        loading={modalLoading}
        t={t}
        onClose={() => setSelectedStallForModal(null)}
      />
    </div>
  );
}
