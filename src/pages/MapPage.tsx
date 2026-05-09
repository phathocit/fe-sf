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
  const { t, i18n } = useTranslation("map");
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
  const currentAudioStallRef = useRef<number | null>(null);
  // const heardStalls = useRef<Set<number>>(new Set());
  const lastHeardTimes = useRef<Map<number, number>>(new Map());
  // const geofenceRadius = 25;
  const voiceTourEnabled = true;
  const playbackTokenRef = useRef(0);

  // Thêm state để theo dõi thông tin phục vụ thông báo/debug
  const [nearbyInfo, setNearbyInfo] = useState<{
    name: string;
    priority: number;
    cooldownLeft: number;
    totalCooldown: number; // Thêm dòng này để TypeScript nhận diện thuộc tính mới
  } | null>(null);

  // Hàm dừng audio tập trung
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      if (currentAudioStallRef.current) {
        lastHeardTimes.current.set(currentAudioStallRef.current, Date.now());
      }

      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      audioRef.current.load();
    }

    playbackTokenRef.current++; // hủy toàn bộ async cũ

    currentAudioStallRef.current = null;
    setActiveAudioId(null);
    setIsAudioPlaying(false);
  }, []);

  // State theo dõi tiến độ tải audio
  const [audioProgress, setAudioProgress] = useState({
    current: 0,
    total: 0,
    isSyncing: false,
  });

  // Lắng nghe sự kiện thay đổi trạng thái mạng
  // 1. State khởi tạo chính xác
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);

  // Dùng useCallback để hàm check mạng có thể được gọi ở nhiều nơi
  const verifyConnectivity = useCallback(async () => {
    try {
      // Thử ping một file nhỏ (favicon) với mode no-store để không lấy cache
      const response = await fetch("/favicon.ico", {
        method: "HEAD",
        cache: "no-store",
        // Thêm timeout để không đợi quá lâu nếu mạng cực yếu
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false; // Lỗi fetch = thực sự mất mạng
    }
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

  const isInsideStallGeofence = useCallback(
    (stall: Stall) => {
      if (!userLoc) return false;
      const distance = L.latLng(userLoc).distanceTo(L.latLng(getCoords(stall)));
      // Sử dụng radius từ Backend, nếu không có thì mặc định là 30
      return distance <= (stall.radius || 30);
    },
    [userLoc, getCoords],
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

    // 1. LẤY DỮ LIỆU OFFLINE HIỆN NGAY (Tốc độ ~0.1s)
    const savedMenus = JSON.parse(
      localStorage.getItem("offline_menus_data") || "{}",
    );
    const localData = savedMenus[stall.id];

    if (localData) {
      setModalMenu(localData);
      setModalLoading(false);
    } else {
      setModalLoading(true);
    }

    // 2. CẬP NHẬT NGẦM (SILENT SYNC) NẾU CÓ MẠNG
    if (navigator.onLine) {
      try {
        const response = await foodApi.getByStallId(stall.id);
        const menuData = (response?.result || []).filter(
          (item: Food) => item.isAvailable,
        );

        // Cập nhật giao diện và bộ nhớ đệm
        setModalMenu(menuData);
        savedMenus[stall.id] = menuData;
        localStorage.setItem("offline_menus_data", JSON.stringify(savedMenus));
      } catch (err) {
        console.error("Sync failed", err);
      } finally {
        setModalLoading(false);
      }
    }
  }, []);

  // Hàm tự động tải trước toàn bộ Audio của các quán
  const prefetchAllAudios = async (stallsToCache: Stall[]) => {
    if (!("caches" in window) || !navigator.onLine) return;

    const cache = await caches.open("cloudinary-assets");
    const savedUrls = JSON.parse(
      localStorage.getItem("offline_audio_urls") || "{}",
    );

    // Chỉ hiện thanh tiến trình cho những file CHƯA có trong Cache
    const neededStalls = stallsToCache.filter(
      (s) => !savedUrls[`${s.id}_${i18n.language}`],
    );
    if (neededStalls.length === 0) return; // Nếu đủ rồi thì không chạy thanh tiến trình nữa

    setAudioProgress({
      current: 0,
      total: neededStalls.length,
      isSyncing: true,
    });

    for (let i = 0; i < neededStalls.length; i++) {
      const stall = neededStalls[i];
      try {
        const res = await audioApi.getStallAudio(stall.id, i18n.language);
        const url = res?.result?.audioUrl;

        if (url) {
          // Tải với chế độ CORS để thẻ <audio> đọc được khi Offline
          const resp = await fetch(url, {
            mode: "cors",
            headers: { "ngrok-skip-browser-warning": "true" },
          });

          if (resp.ok) {
            await cache.put(url, resp);
            savedUrls[`${stall.id}_${i18n.language}`] = url;
            localStorage.setItem(
              "offline_audio_urls",
              JSON.stringify(savedUrls),
            );
          }
        }
      } catch (e) {
        console.error(`Lỗi tải nhạc quán ${stall.name}:`, e);
      }
      setAudioProgress((prev) => ({ ...prev, current: i + 1 }));
    }

    setTimeout(
      () => setAudioProgress((p) => ({ ...p, isSyncing: false })),
      2000,
    );
  };

  // Hàm tự động tải trước toàn bộ Menu của các quán
  const prefetchAllMenus = async (stallsToCache: Stall[]) => {
    if (!navigator.onLine) return;

    console.log("Đang kiểm tra và đồng bộ thực đơn mới nhất...");
    const savedMenus = JSON.parse(
      localStorage.getItem("offline_menus_data") || "{}",
    );

    for (const stall of stallsToCache) {
      try {
        // Thay vì kiểm tra 'if (!savedMenus[stall.id])',
        // chúng ta cứ tải lại để đảm bảo giá cả luôn mới nhất
        const response = await foodApi.getByStallId(stall.id);
        savedMenus[stall.id] = response?.result?.filter(
          (item: Food) => item.isAvailable,
        );
      } catch (err) {
        console.warn(`Lỗi đồng bộ menu quán ${stall.id}`, err);
      }
    }

    localStorage.setItem("offline_menus_data", JSON.stringify(savedMenus));
    console.log("Đã đồng bộ xong toàn bộ dữ liệu thực đơn!");
  };

  // Cập nhật hàm handlePlayStallAudio
  const handlePlayStallAudio = async (stall: Stall) => {
    // 1. Tăng token để đánh dấu phiên làm việc mới (Hủy toàn bộ các tiến trình async cũ)
    const token = ++playbackTokenRef.current;

    try {
      // 2. Cập nhật Ref và State ngay lập tức để useEffect lần sau thấy ngay
      currentAudioStallRef.current = stall.id;
      setActiveAudioId(stall.id);

      const savedAudioUrls = JSON.parse(
        localStorage.getItem("offline_audio_urls") || "{}",
      );
      const cacheKey = `${stall.id}_${i18n.language}`;
      let audioUrl = savedAudioUrls[cacheKey];

      // 3. Nếu chưa có Audio URL, tiến hành tạo mới
      if (!audioUrl) {
        if (!navigator.onLine) throw new Error("Offline và không có cache");

        toast.info(
          `Đang tạo audio ${i18n.language.toUpperCase()} cho ${stall.name}...`,
        );

        const genRes = await audioApi.createTranslation({
          stallId: stall.id,
          languageCode: i18n.language,
          ttsScript: stall.description || `Welcome to ${stall.name}`,
        });

        audioUrl = genRes.result?.audioUrl;

        if (!audioUrl) throw new Error("Audio chưa sẵn sàng");

        // Lưu vào cache URL
        savedAudioUrls[cacheKey] = audioUrl;
        localStorage.setItem(
          "offline_audio_urls",
          JSON.stringify(savedAudioUrls),
        );
        toast.success(`Đã tạo audio ${i18n.language.toUpperCase()}`);
      }

      // Kiểm tra Token sau khi await API: Nếu đã nhảy vùng khác thì dừng tại đây
      if (token !== playbackTokenRef.current) return;

      // 4. Khởi tạo và dọn dẹp Audio Object cũ
      if (!audioRef.current) audioRef.current = new Audio();

      // Ngắt kết nối các sự kiện cũ để tránh chạy đè logic
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      audioRef.current.load();

      // 5. Lấy dữ liệu từ Cache Storage (Cloudinary Assets)
      const cache = await caches.open("cloudinary-assets");
      const cachedResponse = await cache.match(audioUrl);
      let targetSrc = audioUrl;

      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        targetSrc = URL.createObjectURL(blob);
      }

      // Kiểm tra Token lần nữa trước khi gán src
      if (token !== playbackTokenRef.current) return;

      audioRef.current.src = targetSrc;
      audioRef.current.load();

      // 6. Xử lý khi kết thúc âm thanh tự nhiên
      audioRef.current.onended = () => {
        if (token === playbackTokenRef.current) {
          lastHeardTimes.current.set(stall.id, Date.now());
          setIsAudioPlaying(false);
          setActiveAudioId(null);
          currentAudioStallRef.current = null;
        }
      };

      // 7. Thực hiện phát âm thanh
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;

        // Nếu sau khi load xong mà đã có stall khác nhảy vào (token thay đổi)
        if (token !== playbackTokenRef.current) {
          audioRef.current.pause();
          return;
        }

        setIsAudioPlaying(true);
        currentAudioStallRef.current = stall.id;
      }
    } catch (error) {
      console.error("Playback error:", error);
      if (token === playbackTokenRef.current) {
        setIsAudioPlaying(false);
        currentAudioStallRef.current = null;
      }
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

  // Tách phần giao diện thông báo mạng ra một biến để tái sử dụng
  const NetworkStatusBadge = (
    <div
      className={`
    fixed top-6 left-1/2 -translate-x-1/2 z-[10000] 
    px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest 
    transition-all duration-500 shadow-2xl border-2 pointer-events-none
    ${
      !isOnline
        ? "bg-rose-600 text-white border-rose-400 opacity-100 animate-pulse" // Hiện đỏ ngay khi isOnline = false
        : showOnlineStatus
          ? "bg-green-600 text-white border-green-400 opacity-100" // Hiện xanh 5s
          : "opacity-0"
    }
  `}
    >
      {!isOnline ? "⚠ ĐANG OFFLINE" : "● ĐÃ KẾT NỐI"}
    </div>
  );

  useEffect(() => {
    let onlineTimer: ReturnType<typeof setTimeout>;

    const handleOnline = async () => {
      // Bước 1: Tin trình duyệt trước để hiện UI xanh ngay cho mượt (tốc độ <0.1s)
      setIsOnline(true);
      setShowOnlineStatus(true);

      // Bước 2: Xác thực lại "mạng thật" ngầm (phòng trường hợp WiFi không có internet)
      const isReallyOnline = await verifyConnectivity();

      if (!isReallyOnline) {
        setIsOnline(false);
        setShowOnlineStatus(false);
      } else {
        // Nếu thực sự có mạng, sau 5s ẩn nút xanh
        clearTimeout(onlineTimer);
        onlineTimer = setTimeout(() => setShowOnlineStatus(false), 5000);
      }
    };

    const handleOffline = () => {
      // TRIGGER TỨC THÌ: Khi ngắt kết nối, trình duyệt bắn event này ngay lập tức
      setIsOnline(false);
      setShowOnlineStatus(false);
      // Xóa các thông báo thành công cũ nếu có
      clearTimeout(onlineTimer);
    };

    // Kiểm tra trạng thái thực tế ngay khi vừa load trang (tránh lag khi reload)
    const initialCheck = async () => {
      if (navigator.onLine) {
        const reallyConnected = await verifyConnectivity();
        setIsOnline(reallyConnected);
      } else {
        setIsOnline(false);
      }
    };
    initialCheck();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(onlineTimer);
    };
  }, [verifyConnectivity]);

  // Fetch Data
  useEffect(() => {
    const fetchStalls = async () => {
      // 1. LẤY TRONG KHO VÀ HIỂN THỊ NGAY (Tốc độ cực nhanh)
      const savedData = localStorage.getItem("offline_stalls_data");
      if (savedData) {
        setStalls(JSON.parse(savedData));
        setLoading(false); // Tắt màn hình loading ngay nếu có dữ liệu cũ
      }

      // 2. NẾU CÓ MẠNG, CẬP NHẬT DỮ LIỆU MỚI TRONG IM LẶNG
      if (navigator.onLine) {
        try {
          const response = await stallApi.getAllActive();
          const data = response?.result || []; // Sử dụng ?. để tránh lỗi 'payload'

          setStalls(data);
          localStorage.setItem("offline_stalls_data", JSON.stringify(data));

          // Chạy tải trước sau khi đã có dữ liệu mới
          prefetchAllAudios(data);
          prefetchAllMenus(data);
        } catch (error) {
          console.error("Cập nhật dữ liệu ngầm thất bại:", error);
        } finally {
          setLoading(false);
        }
      } else if (!savedData) {
        // Chỉ hiện lỗi nếu không có cả mạng lẫn dữ liệu cũ
        toast.error("Không có dữ liệu. Vui lòng kết nối mạng.");
        setLoading(false);
      }
    };
    fetchStalls();
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

  // Nơi xử lý Priority và CoolDown
  useEffect(() => {
    if (!userLoc || !voiceTourEnabled || stalls.length === 0) return;

    const now = Date.now();
    const currentlyPlayingId = currentAudioStallRef.current;

    // 1. Tìm tất cả stall người dùng đang đứng bên trong
    const stallsInRange = stalls
      .filter((stall) => {
        const distance = L.latLng(userLoc).distanceTo(
          L.latLng([Number(stall.latitude), Number(stall.longitude)]),
        );
        return distance <= (stall.radius || 30);
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // 2. Nếu không còn ở trong bất kỳ vùng nào -> Dừng audio
    if (stallsInRange.length === 0) {
      if (isAudioPlaying || currentlyPlayingId) {
        stopAudio();
      }
      setNearbyInfo(null);
      return;
    }

    // 3. Tìm stall ưu tiên cao nhất mà ĐÃ HẾT COOLDOWN
    const nextPlayableStall = stallsInRange.find((stall) => {
      const lastTime = lastHeardTimes.current.get(stall.id) || 0;
      const cooldownMs = (stall.cooldownSeconds ?? 10) * 1000;
      return now - lastTime >= cooldownMs;
    });

    // 4. LOGIC INTERRUPT
    if (currentlyPlayingId !== null) {
      const currentPlayingStall = stalls.find(
        (s) => s.id === currentlyPlayingId,
      );

      const stillInside = stallsInRange.some(
        (s) => s.id === currentlyPlayingId,
      );

      // Nếu rời vùng → dừng ngay
      if (!stillInside) {
        stopAudio();
        return;
      }

      // Nếu có stall ưu tiên cao hơn
      if (
        nextPlayableStall &&
        currentPlayingStall &&
        nextPlayableStall.id !== currentPlayingStall.id &&
        (nextPlayableStall.priority || 0) > (currentPlayingStall.priority || 0)
      ) {
        console.log(
          `[INTERRUPT] ${currentPlayingStall.name} -> ${nextPlayableStall.name}`,
        );

        // Dừng hoàn toàn audio cũ
        stopAudio();

        // Delay nhỏ để browser giải phóng audio
        setTimeout(() => {
          handlePlayStallAudio(nextPlayableStall);
        }, 50);

        return;
      }

      return;
    }

    // 5. Nếu đang im lặng và có stall khả dụng -> Phát luôn
    if (nextPlayableStall) {
      handlePlayStallAudio(nextPlayableStall);
    }

    // 6. Cập nhật Debug UI (Nearby Info)
    const topStall = stallsInRange[0];
    const lastTimeTop = lastHeardTimes.current.get(topStall.id) || 0;
    const cooldownMsTop = (topStall.cooldownSeconds ?? 10) * 1000;
    const cooldownLeft = Math.max(
      0,
      Math.ceil((cooldownMsTop - (now - lastTimeTop)) / 1000),
    );

    setNearbyInfo({
      name: topStall.name,
      priority: topStall.priority || 0,
      cooldownLeft,
      totalCooldown: topStall.cooldownSeconds ?? 10,
    });
  }, [userLoc, stalls, voiceTourEnabled, stopAudio, handlePlayStallAudio]);

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
        {NetworkStatusBadge} {/* Thêm vào đây */}
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
        <p className="font-black italic uppercase tracking-widest animate-pulse">
          Initializing Food-Map...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Giao diện tiến độ tải Audio Offline */}
      {audioProgress.isSyncing && (
        <div className="fixed bottom-24 right-6 z-[1000] bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl w-64 animate-in slide-in-from-right-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
              {audioProgress.current === audioProgress.total
                ? "✓ Đã sẵn sàng Offline"
                : "⟳ Đang nạp dữ liệu..."}
            </span>
            <span className="text-[10px] font-black text-white">
              {audioProgress.current}/{audioProgress.total}
            </span>
          </div>

          {/* Thanh Progress Bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-500 ease-out"
              style={{
                width: `${(audioProgress.current / audioProgress.total) * 100}%`,
              }}
            />
          </div>

          <p className="mt-2 text-[9px] text-slate-400 italic">
            Hệ thống đang tải bản thuyết minh để bạn sử dụng khi mất mạng.
          </p>
        </div>
      )}
      {NetworkStatusBadge}
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
          isInsideStallGeofence={isInsideStallGeofence}
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
          // geofenceRadius={geofenceRadius}
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

      {/* Bảng theo dõi Logic Tour (Priority/Cooldown) */}
      {nearbyInfo && (
        <div className="fixed bottom-32 left-6 z-[1000] bg-slate-900/95 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl w-64">
          <div className="text-[10px] font-black text-orange-400 uppercase mb-2 tracking-widest">
            Hệ thống Geofence
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
              <span className="text-[9px] text-slate-400 uppercase">Quán:</span>
              <span className="text-xs font-bold text-white truncate ml-2">
                {nearbyInfo.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <div className="text-[8px] text-slate-400 uppercase">
                  Độ ưu tiên
                </div>
                <div className="text-sm font-black text-orange-500">
                  P{nearbyInfo.priority}
                </div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <div className="text-[8px] text-slate-400 uppercase">
                  Hồi chiêu (BE)
                </div>
                <div className="text-sm font-black text-blue-400">
                  {nearbyInfo.cooldownLeft > 0
                    ? `${nearbyInfo.cooldownLeft}s`
                    : "Sẵn sàng"}
                </div>
              </div>
            </div>

            <div className="text-[8px] text-slate-500 italic">
              * Config: {nearbyInfo.totalCooldown}s cooldown
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
