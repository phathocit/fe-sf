import { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCcw, ExternalLink, Power } from "lucide-react";
import qrCodeApi from "../../api/qrCodeApi";
import stallApi from "../../api/stallApi";
import accountApi from "../../api/accountApi";
import foodApi from "../../api/foodApi";
import { type QRCode } from "../../types/qrcode.types";
import { type Stall } from "../../types/stall.types";
import { type Food } from "../../types/food.types";
import { type Account } from "../../types/auth.types";
import { toast } from "react-toastify";
import AdminLayout from "../../layouts/AdminLayout";
import StallDetailModal from "../../components/admin/modals/StallDetailModal";
import CreateQRModal from "../../components/admin/modals/CreateQRModal";

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrFormLoading, setQrFormLoading] = useState(false);
  const [newQR, setNewQR] = useState({ name: "", stallId: 0 });

  const [isStallDetailOpen, setIsStallDetailOpen] = useState(false);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [stallMenu, setStallMenu] = useState<Food[]>([]);
  const [stallMenuLoading, setStallMenuLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Account | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qrRes, stallRes] = await Promise.all([
        qrCodeApi.getAll(),
        stallApi.getAll(),
      ]);
      setQrCodes(qrRes.result);
      setStalls(stallRes.result);
    } catch {
      toast.error("Không thể tải dữ liệu QR");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return qrCodes.filter(
      (qr) =>
        qr.name.toLowerCase().includes(q) ||
        qr.code.toLowerCase().includes(q) ||
        qr.stallName.toLowerCase().includes(q),
    );
  }, [qrCodes, searchQuery]);

  const handleToggleQRActive = async (qr: QRCode) => {
    try {
      const res = await qrCodeApi.toggle(qr.id);
      if (res.result) {
        setQrCodes(qrCodes.map((q) => (q.id === qr.id ? res.result : q)));
        toast.success("Thao tác thành công!");
      }
    } catch {
      toast.error("Lỗi khi thay đổi trạng thái");
    }
  };

  const handleCreateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQR.name || !newQR.stallId) return;
    setQrFormLoading(true);
    try {
      const res = await qrCodeApi.create({ ...newQR, code: "" });
      if (res.result) {
        setQrCodes([...qrCodes, res.result]);
        setIsQRModalOpen(false);
        setNewQR({ name: "", stallId: 0 });
        toast.success("Tạo QR thành công!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Tạo thất bại");
    } finally {
      setQrFormLoading(false);
    }
  };

  const handleViewStall = async (stallId: number) => {
    const stall = stalls.find((s) => s.id === stallId);
    if (!stall) return;
    setSelectedStall(stall);
    setIsStallDetailOpen(true);
    setStallMenuLoading(true);
    try {
      const foodRes = await foodApi.getByStallId(stall.id);
      setStallMenu(foodRes.result || []);
      const accRes = await accountApi.getById(stall.vendorId);
      setSelectedVendor(accRes.result);
    } catch {
      toast.error("Lỗi khi tải chi tiết gian hàng");
    } finally {
      setStallMenuLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Quản Lý QR Code"
      subtitle={`Tổng cộng ${qrCodes.length} mã QR đang lưu trữ`}
      searchPlaceholder="Tìm mã QR, gian hàng..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      showCreateQR
      onCreateQR={() => setIsQRModalOpen(true)}
    >
      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-4xl shadow-sm flex flex-col">
        <div className="flex-1 overflow-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50">
                <th className="p-6 pl-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  ID
                </th>
                <th className="p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  Tên Mã QR
                </th>
                <th className="p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  Gian Hàng
                </th>
                <th className="p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  Lượt quét
                </th>
                <th className="p-6 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  Trạng thái
                </th>
                <th className="p-6 text-right pr-10 border-b border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-400">
                    <p className="font-black uppercase tracking-widest text-xs">
                      Không tìm thấy mã QR
                    </p>
                  </td>
                </tr>
              ) : (
                filteredData.map((qr) => (
                  <tr
                    key={qr.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-6 pl-10">
                      <span className="font-black text-slate-400 text-xs tracking-tighter">
                        #{qr.id}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <QRCodeSVG
                            value={`${import.meta.env.VITE_QR_BASE_URL}/api/qr/scan/${qr.code}`}
                            size={48}
                            level="H"
                          />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 uppercase italic tracking-tight">
                            {qr.name}
                          </div>
                          <div className="text-[10px] font-mono text-indigo-400 font-bold">
                            {qr.code.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <div className="font-black text-slate-700 text-xs italic uppercase tracking-tight">
                          {qr.stallName}
                        </div>
                        <button
                          onClick={() => handleViewStall(qr.stallId)}
                          className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1 flex items-center gap-1 hover:text-indigo-700 cursor-pointer"
                        >
                          <ExternalLink size={10} /> Chi tiết gian hàng
                        </button>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                        <RefreshCcw size={10} className="text-slate-400" />
                        <span className="font-black text-slate-600 text-[10px]">
                          {qr.scanCount} Lượt
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${qr.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 animate-pulse"}`}
                        ></div>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${qr.isActive ? "text-emerald-500" : "text-rose-500"}`}
                        >
                          {qr.isActive ? "Đang chạy" : "Đã ngắt"}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right pr-10">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleQRActive(qr)}
                          className={`cursor-pointer w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm ${qr.isActive ? "bg-slate-900 text-white hover:bg-rose-600" : "bg-emerald-500"}`}
                        >
                          <Power size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateQRModal
        stalls={stalls}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onSubmit={handleCreateQR}
        newQR={newQR}
        setNewQR={setNewQR}
        loading={qrFormLoading}
      />

      <StallDetailModal
        stall={selectedStall}
        vendor={selectedVendor}
        menu={stallMenu}
        menuLoading={stallMenuLoading}
        isOpen={isStallDetailOpen}
        onClose={() => setIsStallDetailOpen(false)}
        onToggleActive={() => {}} // Not editable from here
      />
    </AdminLayout>
  );
}
