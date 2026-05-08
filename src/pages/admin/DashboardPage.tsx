import { useEffect, useRef, useState } from "react";

import { Users, Eye, BarChart3 } from "lucide-react";

import { Client } from "@stomp/stompjs";

import SockJS from "sockjs-client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import visitApi from "../../api/visitApi";

import AdminLayout from "../../layouts/AdminLayout";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalQrScans: 0,
    uniqueVisitors: 0,
  });

  const [audioData, setAudioData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const effectRan = useRef(false);

  // =====================================================
  // fetch dashboard
  // =====================================================

  const fetchDashboard = async () => {
    try {
      const response = await visitApi.getDashboard();

      const data = response.data;

      setStats({
        totalQrScans: data.totalQrScans || 0,

        uniqueVisitors: data.uniqueVisitors || 0,
      });

      setAudioData(data.audioPerStall || []);
    } catch (error) {
      console.error("Fetch dashboard failed", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // websocket
  // =====================================================

  useEffect(() => {
    if (effectRan.current) return;

    fetchDashboard();

    const socket = new SockJS("/api/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,

      reconnectDelay: 5000,

      onConnect: () => {
        stompClient.subscribe(
          "/topic/analytics",

          () => {
            fetchDashboard();
          },
        );
      },
    });

    stompClient.activate();

    effectRan.current = true;

    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, []);

  // =====================================================
  // cards
  // =====================================================

  const cards = [
    {
      title: "Tổng lượt quét",

      value: stats.totalQrScans.toLocaleString(),

      icon: Eye,

      bg: "bg-blue-50",

      textColor: "text-blue-600",
    },

    {
      title: "Khách duy nhất",

      value: stats.uniqueVisitors.toLocaleString(),

      icon: Users,

      bg: "bg-emerald-50",

      textColor: "text-emerald-600",
    },
  ];

  // =====================================================
  // loading
  // =====================================================

  if (loading) {
    return (
      <AdminLayout
        title="Trang Tổng Quan"
        subtitle=""
        searchPlaceholder=""
        searchValue=""
        onSearchChange={() => {}}
        hideSearch={true}
      >
        <div
          className="
          flex
          items-center
          justify-center
          min-h-[50vh]
        "
        >
          <div
            className="
            animate-spin
            rounded-full
            h-12
            w-12
            border-t-4
            border-orange-500
          "
          />
        </div>
      </AdminLayout>
    );
  }

  // =====================================================
  // render
  // =====================================================

  return (
    <AdminLayout
      title="Trang Tổng Quan"
      subtitle="
        Phân tích lưu lượng truy cập hệ thống
      "
      searchPlaceholder=""
      searchValue=""
      onSearchChange={() => {}}
      hideSearch={true}
    >
      <div
        className="
        flex-1
        overflow-auto
        no-scrollbar
        pb-10
      "
      >
        <div
          className="
          max-w-7xl
          mx-auto
          animate-in
          fade-in
          duration-700
        "
        >
          {/* cards */}

          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
            mb-10
          "
          >
            {cards.map((card, index) => (
              <div
                key={index}
                className="
                  bg-white
                  rounded-[2rem]
                  p-6
                  shadow-sm
                  border
                  border-slate-50
                "
              >
                <div
                  className={`
                  ${card.bg}
                  w-14
                  h-14
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  mb-4
                `}
                >
                  <card.icon size={28} className={card.textColor} />
                </div>

                <h3
                  className="
                  text-slate-500
                  font-bold
                  text-xs
                  uppercase
                  mb-1
                "
                >
                  {card.title}
                </h3>

                <span
                  className="
                  text-3xl
                  font-black
                  text-slate-900
                "
                >
                  {card.value}
                </span>
              </div>
            ))}
          </div>

          {/* chart */}

          <div
            className="
            bg-white
            rounded-[2.5rem]
            p-8
            shadow-sm
            border
            border-slate-50
          "
          >
            <div
              className="
              flex
              items-center
              gap-3
              mb-8
            "
            >
              <div
                className="
                p-3
                bg-indigo-50
                rounded-xl
                text-indigo-600
              "
              >
                <BarChart3 size={24} />
              </div>

              <div>
                <h2
                  className="
                  text-xl
                  font-bold
                  text-slate-800
                "
                >
                  Thống kê lượt nghe audio
                </h2>

                <p
                  className="
                  text-sm
                  text-slate-400
                "
                >
                  Theo từng gian hàng
                </p>
              </div>
            </div>

            <div
              className="
              h-[400px]
              w-full
            "
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={audioData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />

                  <XAxis
                    dataKey="stallName"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis axisLine={false} tickLine={false} />

                  <Tooltip />

                  <Bar
                    dataKey="audioCount"
                    radius={[10, 10, 0, 0]}
                    barSize={40}
                  >
                    {audioData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={index % 2 === 0 ? "#6366f1" : "#818cf8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
