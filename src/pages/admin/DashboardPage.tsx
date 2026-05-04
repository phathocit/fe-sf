import { useState, useEffect, useRef } from "react";
import { Users, Eye, Activity, BarChart3 } from "lucide-react";
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
    onlineUsers: 0,
    totalVisits: 0,
    uniqueVisitors: 0,
  });
  const [audioData, setAudioData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const effectRan = useRef(false);

  useEffect(() => {
    // Nếu effect đã chạy rồi thì thoát ra (Dùng cho React Strict Mode)
    if (effectRan.current === true) return;

    const initData = async () => {
      try {
        const [statsRes, audioRes] = await Promise.all([
          visitApi.getStats(),
          visitApi.getAudioStats(),
        ]);

        if (statsRes && statsRes.result) {
          setStats({
            onlineUsers: statsRes.result.onlineUsers || 0,
            totalVisits: statsRes.result.totalVisits || 0,
            uniqueVisitors: statsRes.result.uniqueVisitors || 0,
          });
        }

        if (audioRes && audioRes.result) {
          const formattedData = Object.entries(audioRes.result).map(
            ([id, count]) => ({
              name: `Stall ${id}`,
              plays: count,
            }),
          );
          setAudioData(formattedData);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu ban đầu:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();

    // KẾT NỐI WEBSOCKET
    const socket = new SockJS("/api/ws-qr-code");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe("/topic/analytics", (message) => {
          const data = JSON.parse(message.body);
          setStats({
            onlineUsers: data.onlineUsers,
            totalVisits: data.totalVisits,
            uniqueVisitors: data.uniqueVisitors || 0,
          });
        });
      },
    });

    stompClient.activate();

    // Đánh dấu đã chạy xong lần đầu
    effectRan.current = true;

    return () => {
      // Lưu ý: Trong Strict Mode, cleanup này sẽ chạy sau lần đầu
      // và effectRan sẽ ngăn lần thứ 2 kích hoạt lại logic trên.
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, []);

  const cards = [
    {
      title: "Đang truy cập",
      value: stats.onlineUsers,
      icon: Activity,
      color: "from-orange-500 to-red-600",
      bg: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Tổng lượt quét",
      value: stats.totalVisits.toLocaleString(),
      icon: Eye,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Khách duy nhất",
      value: stats.uniqueVisitors.toLocaleString(),
      icon: Users,
      color: "from-emerald-400 to-teal-600",
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

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
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Trang Tổng Quan"
      subtitle="Phân tích lưu lượng truy cập hệ thống"
      searchPlaceholder=""
      searchValue=""
      onSearchChange={() => {}}
      hideSearch={true}
    >
      <div className="flex-1 overflow-auto no-scrollbar pb-10">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {cards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 relative overflow-hidden group"
              >
                <div
                  className={`${card.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <card.icon size={28} className={card.textColor} />
                </div>
                <h3 className="text-slate-500 font-bold text-xs uppercase mb-1">
                  {card.title}
                </h3>
                <span className="text-3xl font-black text-slate-900">
                  {card.value}
                </span>
              </div>
            ))}
          </div>

          {/* FIX LỖI 3: Thêm min-h và đảm bảo container có chiều cao ổn định */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Thống kê lượt nghe audio của từng gian hàng
                </h2>
                <p className="text-sm text-slate-400">
                  Số lượt nghe hoàn thành
                </p>
              </div>
            </div>

            {/* Container biểu đồ */}
            <div className="h-[400px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={audioData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="plays" radius={[10, 10, 0, 0]} barSize={40}>
                    {audioData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
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
