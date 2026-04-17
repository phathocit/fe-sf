export default function VendorLoading() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 gap-6">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-sm animate-pulse">
        Cửa hàng đang tải...
      </div>
    </div>
  );
}
