import { useState, useEffect } from "react";
import { Users, Eye } from "lucide-react";
import visitApi from "../../api/visitApi";
import AdminLayout from "../../layouts/AdminLayout";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await visitApi.getStats();
        if (response.result) {
          setStats(response.result);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Tổng lượt truy cập",
      value: stats.totalVisits.toLocaleString(),
      icon: Eye,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Tổng số lần người dùng mở web và quét mã",
    },
    {
      title: "Khách truy cập duy nhất",
      value: stats.uniqueVisitors.toLocaleString(),
      icon: Users,
      color: "from-emerald-400 to-teal-600",
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
      description: "Số người dùng khác nhau dựa trên IP",
    },
  ];

  if (loading) {
    return (
      <AdminLayout
        title="Trang Tổng Quan"
        subtitle="Phân tích lưu lượng truy cập hệ thống"
        searchPlaceholder=""
        searchValue=""
        onSearchChange={() => {}}
        hideSearch={true}
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
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
      <div className="flex-1 overflow-auto no-scrollbar">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {cards.map((card, index) => (
              <div
                key={index}
                className="group bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50 hover:-translate-y-2 relative overflow-hidden"
              >
                <div
                  className={`absolute -right-4 -top-4 w-24 h-24 bg-linear-to-br ${card.color} opacity-0 group-hover:opacity-10 rounded-full transition-all duration-700 blur-2xl`}
                ></div>

                <div
                  className={`${card.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                >
                  <card.icon size={32} className={card.textColor} />
                </div>

                <h3 className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2">
                  {card.title}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium mt-4 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
