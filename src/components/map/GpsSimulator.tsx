import React, { useState, useEffect, useRef } from "react";
import { Crosshair, MapPin, Navigation, Send, X, Move } from "lucide-react";
import type { Stall } from "../../types/stall.types";

interface GpsSimulatorProps {
  userLoc: [number, number] | null;
  onLocChange: (loc: [number, number]) => void;
  stalls: Stall[];
  isOpen: boolean;
  onClose: () => void;
}

const GpsSimulator: React.FC<GpsSimulatorProps> = ({
  userLoc,
  onLocChange,
  stalls,
  isOpen,
  onClose,
}) => {
  // State cho tọa độ thực tế
  const [lat, setLat] = useState<number>(userLoc?.[0] || 0);
  const [lng, setLng] = useState<number>(userLoc?.[1] || 0);

  // State cho việc nhập thủ công
  const [inputLat, setInputLat] = useState("");
  const [inputLng, setInputLng] = useState("");

  // Joystick State
  const [isMoving, setIsMoving] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

  // FIX: Cung cấp giá trị khởi tạo undefined để tránh lỗi TypeScript
  const requestRef = useRef<number | undefined>(undefined);

  // Tốc độ di chuyển
  const SPEED_MODIFIER = 0.00000025;

  useEffect(() => {
    if (userLoc && !isMoving) {
      setLat(userLoc[0]);
      setLng(userLoc[1]);
      setInputLat(userLoc[0].toFixed(6));
      setInputLng(userLoc[1].toFixed(6));
    }
  }, [userLoc, isMoving]);

  const updatePosition = () => {
    if (isMoving) {
      setLat((prevLat) => {
        const newLat = prevLat - (joystickPos.y / 40) * SPEED_MODIFIER;
        setLng((prevLng) => {
          const newLng = prevLng + (joystickPos.x / 40) * SPEED_MODIFIER;
          onLocChange([newLat, newLng]);
          return newLng;
        });
        return newLat;
      });
      requestRef.current = requestAnimationFrame(updatePosition);
    }
  };

  useEffect(() => {
    if (isMoving) {
      requestRef.current = requestAnimationFrame(updatePosition);
    } else {
      if (requestRef.current !== undefined)
        cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current !== undefined)
        cancelAnimationFrame(requestRef.current);
    };
  }, [isMoving, joystickPos]);

  if (!isOpen) return null;

  const handleJoystickMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMoving) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 40;

    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      setJoystickPos({
        x: Math.cos(angle) * maxRadius,
        y: Math.sin(angle) * maxRadius,
      });
    } else {
      setJoystickPos({ x: dx, y: dy });
    }
  };

  const stopMoving = () => {
    setIsMoving(false);
    setJoystickPos({ x: 0, y: 0 });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nLat = parseFloat(inputLat);
    const nLng = parseFloat(inputLng);
    if (!isNaN(nLat) && !isNaN(nLng)) {
      onLocChange([nLat, nLng]);
    }
  };

  return (
    /* THAY ĐỔI Ở ĐÂY: fixed bottom-6 right-6 để đưa ra góc phải dưới cùng */
    <div className="fixed bottom-6 right-6 z-[500] w-80 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 select-none">
      {/* Header */}
      <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500 rounded-lg">
            <Navigation size={16} className="text-white" />
          </div>
          <span className="font-black uppercase tracking-widest text-xs italic">
            GPS Simulator Pro
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
        {/* JOYSTICK CONTROLLER */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
          <span className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-1">
            <Move size={12} /> Live Joystick
          </span>

          <div
            className="relative w-32 h-32 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center touch-none"
            onMouseDown={() => setIsMoving(true)}
            onMouseMove={handleJoystickMove}
            onMouseUp={stopMoving}
            onMouseLeave={stopMoving}
            onTouchStart={() => setIsMoving(true)}
            onTouchMove={handleJoystickMove}
            onTouchEnd={stopMoving}
          >
            <div className="absolute w-2 h-2 bg-slate-100 rounded-full" />
            <div
              className="absolute w-14 h-14 bg-orange-500 rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75 border-[4px] border-white"
              style={{
                transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
              }}
            >
              <div className="w-4 h-4 border-2 border-white/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* MANUAL INPUTS */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                Latitude
              </label>
              <input
                type="text"
                value={isMoving ? lat.toFixed(6) : inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                Longitude
              </label>
              <input
                type="text"
                value={isMoving ? lng.toFixed(6) : inputLng}
                onChange={(e) => setInputLng(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none"
              />
            </div>
          </div>
          {!isMoving && (
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95"
            >
              <Send size={14} /> Teleport Now
            </button>
          )}
        </form>

        {/* POI LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Nearby Stalls
            </span>
            <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
              {stalls.length} POIs
            </span>
          </div>
          <div className="space-y-2">
            {stalls.slice(0, 5).map((stall) => (
              <button
                key={stall.id}
                onClick={() =>
                  onLocChange([Number(stall.latitude), Number(stall.longitude)])
                }
                className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  {stall.image && (
                    <img
                      src={stall.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[10px] font-black text-slate-900 uppercase italic truncate">
                    {stall.name}
                  </div>
                  <div className="text-[8px] text-slate-400 font-bold tracking-tighter">
                    {stall.latitude.toString().slice(0, 8)},{" "}
                    {stall.longitude.toString().slice(0, 8)}
                  </div>
                </div>
                <div className="p-2 rounded-lg text-slate-300 group-hover:text-orange-500 transition-colors">
                  <MapPin size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                onLocChange([pos.coords.latitude, pos.coords.longitude]);
              });
            }
          }}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-orange-600 text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          <Crosshair size={14} /> Re-sync to Real GPS
        </button>
      </div>
    </div>
  );
};

export default GpsSimulator;
