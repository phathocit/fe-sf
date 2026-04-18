import { useState, useEffect } from "react";
import stallApi from "../api/stallApi";
import type { Stall } from "../types/stall.types";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const response = await stallApi.getByStreetId(1);
        setStalls(response.result);
      } catch (error) {
        console.error("Error fetching stalls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStalls();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(stalls.map((stall) => stall.category))),
  ];

  const filteredStalls = stalls.filter((stall) => {
    const matchesSearch = stall.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || stall.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredStalls.length / itemsPerPage);
  const currentStalls = filteredStalls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <div className="relative w-full h-80 bg-linear-to-r from-orange-600 to-red-500 flex flex-col items-center justify-center pt-8  rounded-b-3xl shadow-xl">
        <h1 className="text-4xl md:text-5xl font-black text-white px-4 text-center z-10 drop-shadow-md mb-4">
          {t("hero_title")}
        </h1>
        <p className="text-white/90 text-sm md:text-lg font-medium max-w-2xl text-center px-4 z-10 drop-shadow-sm mb-6">
          {t("hero_subtitle")}
        </p>

        <div className="z-10 mb-14 relative group cursor-pointer">
          <div className="absolute -inset-1.5 bg-linear-to-r from-green-400 via-yellow-400 to-orange-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
          <Link
            to="/map"
            className="relative flex items-center gap-4 bg-white text-orange-600 px-8 py-4 rounded-full font-black shadow-2xl transition-all hover:scale-105 active:scale-95 text-lg uppercase tracking-wider border-2 border-white"
          >
            <div className="flex relative w-5 h-5 justify-center items-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white box-content"></span>
            </div>
            <span>{t("map_btn")}</span>
            <div className="bg-orange-100 text-orange-600 rounded-full p-2 ml-1 group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-inner">
              <MapPin size={24} className="animate-bounce" />
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="absolute bottom-0 translate-y-1/2 w-full max-w-3xl z-20 overflow-hidden shadow-2xl">
          <div className="bg-white p-2 rounded-3xl shadow-2xl flex items-center border border-gray-100">
            <div className="pl-4 pr-2 text-gray-400">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder={t("search_placeholder")}
              className="w-full py-3 px-2 outline-none text-gray-700 bg-transparent text-lg placeholder:text-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {(searchTerm || filterCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("All");
                  setCurrentPage(1);
                }}
                className="cursor-pointer bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 hover:text-red-500 transition-all whitespace-nowrap"
              >
                {t("clear_filter")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium animate-pulse">
              Đang tải danh sách quán ăn...
            </p>
          </div>
        ) : (
          <>
            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide py-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilterCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`cursor-pointer whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all shadow-sm ${
                    filterCategory === cat
                      ? "bg-orange-500 text-white shadow-orange-500/30"
                      : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 border border-gray-100"
                  }`}
                >
                  {cat === "All" ? t("all") : cat}
                </button>
              ))}
            </div>

            {/* Stalls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
              {currentStalls.map((stall) => (
                <div
                  key={stall.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        stall.image ||
                        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800"
                      }
                      alt={stall.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* <div className='absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold text-orange-600 flex items-center gap-1.5 shadow-lg'>
											<Star size={16} fill='currentColor' /> 4.5
										</div> */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-bold tracking-wider uppercase">
                      {stall.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-2xl font-black text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {stall.name}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">
                      {stall.description ||
                        `Quán ăn hấp dẫn nhất khu phố ẩm thực, chuyên cung cấp các món ăn ngon từ ${stall.category}. Hãy đến và trải nghiệm ngay!`}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100">
                      <Link
                        to={`/map?stallId=${stall.id}`}
                        className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      >
                        <MapPin size={18} /> {t("gps_pos")}
                      </Link>
                      <Link
                        to={`/home/stall/${stall.id}`}
                        className="flex items-center justify-center gap-2 bg-orange-100 text-orange-600 py-3 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        {t("view_menu")}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {filteredStalls.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-500 flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={40} className="text-gray-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-700">
                    {t("no_stalls")}
                  </p>
                  <p className="mt-2 text-gray-500">{t("no_stalls_hint")}</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCategory("All");
                    }}
                    className="mt-6 px-6 py-2 bg-orange-100 text-orange-600 font-bold rounded-full hover:bg-orange-200 transition-colors"
                  >
                    {t("clear_filter")}
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="cursor-pointer p-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft size={24} />
                </button>
                <span className="font-black text-slate-700 bg-white px-6 py-4 rounded-2xl shadow-sm border-2 border-slate-100">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="cursor-pointer p-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
