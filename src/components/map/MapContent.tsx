import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Navigation, Utensils, VolumeX, Play } from "lucide-react";
import type { Stall } from "../../types/stall.types";

interface MapContentProps {
  stalls: Stall[];
  filteredStalls: Stall[];
  userLoc: [number, number] | null;
  mapCenter: [number, number];
  activeStallId: number | null;
  onStallClick: (stall: Stall) => void;
  onMapClick: () => void;
  handleOpenModal: (stall: Stall) => void;
  getCoords: (stall: Stall) => [number, number];
  getDistanceStr: (coords: [number, number]) => string;
  userIcon: L.DivIcon;
  createStallIcon: (stall: Stall, isActive: boolean) => L.DivIcon;
  markerRefs: React.MutableRefObject<{ [key: string]: L.Marker | null }>;
  locateUser: () => void;
  isAudioPlaying: boolean;
  activeAudioId: number | null;
  onAudioToggle: (stall: Stall) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: any) => string;
}

// Hàm lấy màu sắc ổn định theo ID quán
const getStallColor = (id: number) => {
  const colors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#f97316", // Orange
  ];
  return colors[id % colors.length];
};

// Điều khiển camera bản đồ
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 21, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

// Xử lý sự kiện click bản đồ
function MapEvents({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

const MapContent: React.FC<MapContentProps> = ({
  stalls,
  filteredStalls,
  userLoc,
  mapCenter,
  activeStallId,
  onStallClick,
  onMapClick,
  handleOpenModal,
  getCoords,
  getDistanceStr,
  userIcon,
  createStallIcon,
  markerRefs,
  locateUser,
  isAudioPlaying,
  activeAudioId,
  onAudioToggle,
  t,
}) => {
  const isOnline = navigator.onLine;

  // Kiểm tra dữ liệu offline
  const hasOfflineAudio = (stallId: number) => {
    try {
      const savedUrls = JSON.parse(
        localStorage.getItem("offline_audio_urls") || "{}",
      );
      return !!savedUrls[stallId];
    } catch {
      return false;
    }
  };

  return (
    <div className="flex-1 h-full z-0 relative overflow-hidden bg-slate-100">
      {/* Nút định vị nhanh trên Mobile */}
      <button
        onClick={locateUser}
        className="md:hidden fixed top-24 right-6 z-[500] w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-200 active:scale-95 transition-all"
      >
        <Navigation size={24} className="text-orange-600" />
      </button>

      <MapContainer
        center={mapCenter}
        zoom={20}
        className="w-full h-full"
        zoomControl={false}
        maxZoom={24}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxNativeZoom={18}
          maxZoom={24}
        />

        <MapController center={mapCenter} />
        <MapEvents onMapClick={onMapClick} />

        {/* Marker vị trí người dùng */}
        {userLoc && (
          <Marker position={userLoc} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="font-black tracking-widest text-[10px] text-slate-900 uppercase py-2 px-4">
                {t("you_are_here", { defaultValue: "BẠN ĐANG Ở ĐÂY" })}
              </div>
            </Popup>
          </Marker>
        )}

        {/* VẼ CÁC VÒNG TRÒN RADIUS (GEOFENCE) THÔNG MINH */}
        {stalls.map((stall) => {
          const stallCoords = getCoords(stall);
          const isActive = activeStallId === stall.id;

          // Tính toán trực tiếp xem người dùng có trong bán kính không để tránh dùng Prop mới
          const isInside = userLoc
            ? L.latLng(userLoc).distanceTo(L.latLng(stallCoords)) <=
              (stall.radius || 30)
            : false;

          // LOGIC: Nếu không đứng trong vùng và không nhấn chọn thì ẩn đi
          if (!isInside && !isActive) return null;

          return (
            <Circle
              key={`radius-circle-${stall.id}`}
              center={stallCoords}
              radius={stall.radius || 30}
              pathOptions={{
                fillColor: getStallColor(stall.id),
                fillOpacity: isActive ? 0.18 : 0.08,
                color: getStallColor(stall.id),
                weight: 1,
                dashArray: isInside ? "0" : "6, 10", // Nét liền khi đang ở trong, nét đứt khi chỉ nhấn xem
              }}
            />
          );
        })}

        {/* HIỂN THỊ CÁC MARKER QUÁN ĂN */}
        {filteredStalls.map((stall) => {
          const coords = getCoords(stall);
          const distanceStr = getDistanceStr(coords);
          const isDownloaded = hasOfflineAudio(stall.id);
          const isPlaying = isAudioPlaying && activeAudioId === stall.id;

          return (
            <Marker
              key={stall.id}
              ref={(el) => {
                markerRefs.current[stall.id] = el;
              }}
              position={coords}
              icon={createStallIcon(stall, activeStallId === stall.id)}
              zIndexOffset={activeStallId === stall.id ? 1000 : 0}
              eventHandlers={{
                click: () => onStallClick(stall),
              }}
            >
              <Popup className="custom-popup rounded-[30px] overflow-hidden p-0 shadow-2xl border-4 border-white">
                <div className="w-72 sm:w-80 overflow-hidden bg-white flex flex-col">
                  <div className="relative h-36 sm:h-40 bg-slate-200">
                    <img
                      src={
                        stall?.image ||
                        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800"
                      }
                      className="w-full h-full object-cover"
                      alt={stall?.name || "Stall"}
                      loading="lazy"
                    />
                    {!isOnline && !isDownloaded && (
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-[8px] px-2 py-1 rounded-full backdrop-blur-sm uppercase font-bold">
                        Chưa tải Offline
                      </div>
                    )}
                  </div>

                  <div className="p-6 text-center flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-orange-500 mb-1.5">
                        {stall?.category ||
                          t("category", { defaultValue: "ẨM THỰC" })}
                      </div>
                      <h4 className="font-black text-xl sm:text-2xl text-slate-900 italic tracking-tight leading-tight">
                        {stall?.name || "Tên quán ăn"}
                      </h4>
                      {distanceStr && (
                        <div className="flex justify-center items-center gap-1 mt-2.5 text-slate-500 text-sm font-bold bg-slate-100 px-3 py-1 rounded-xl w-max mx-auto shadow-inner mb-3 border border-slate-200/50">
                          <Navigation size={14} className="inline rotate-45" />{" "}
                          {t("distance_away", {
                            distance: distanceStr,
                            defaultValue: `${distanceStr} cách đây`,
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 font-bold mt-4">
                      <button
                        onClick={() => handleOpenModal(stall)}
                        className="flex-1 cursor-pointer bg-slate-100 text-slate-900 border border-slate-200 text-[10px] font-black uppercase tracking-wider py-3.5 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Utensils size={14} />{" "}
                        {t("view_menu", { defaultValue: "XEM MENU" })}
                      </button>

                      <button
                        onClick={() => onAudioToggle(stall)}
                        disabled={!isOnline && !isDownloaded}
                        className={`
                          flex-1 cursor-pointer text-white text-[10px] font-black uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95
                          ${
                            isPlaying
                              ? "bg-rose-600 hover:bg-rose-700"
                              : "bg-orange-600 hover:bg-orange-700"
                          }
                          ${
                            !isOnline && !isDownloaded
                              ? "opacity-40 grayscale cursor-not-allowed"
                              : ""
                          }
                        `}
                      >
                        {isPlaying ? (
                          <>
                            <VolumeX size={14} />{" "}
                            {t("stop_audio", { defaultValue: "DỪNG NGHE" })}
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            {!isOnline && !isDownloaded
                              ? t("offline", { defaultValue: "OFFLINE" })
                              : t("play_audio", {
                                  defaultValue: "NGHE AUDIO",
                                })}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .leaflet-container { font-family: inherit; }
          .custom-popup .leaflet-popup-content-wrapper { padding: 0; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); background: white; }
          .custom-popup .leaflet-popup-content { margin: 0; width: auto !important; }
          .custom-popup .leaflet-popup-tip-container { display: none; }
          
          .custom-popup .leaflet-popup-close-button {
            width: 32px !important;
            height: 32px !important;
            top: 12px !important;
            right: 12px !important;
            background-color: rgba(0, 0, 0, 0.4) !important;
            border-radius: 50% !important;
            color: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
            z-index: 50;
          }
          .custom-popup .leaflet-popup-close-button:hover {
            background-color: #ea580c !important;
            transform: scale(1.1);
          }
        `,
        }}
      />
    </div>
  );
};

export default MapContent;
