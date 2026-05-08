import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import visitApi from "../api/visitApi";
import qrCodeApi from "../api/qrCodeApi"; // Đảm bảo bạn đã import qrCodeApi

const VisitLogger = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // 1. Hàm lấy hoặc tạo Session ID
    const getSessionId = () => {
      let sessionId = localStorage.getItem("visit_sessionId");
      if (!sessionId) {
        sessionId = Date.now().toString();
        localStorage.setItem("visit_sessionId", sessionId);
      }
      return sessionId;
    };

    // 2. Hàm kiểm tra xem hôm nay đã ghi log truy cập chưa
    const hasLoggedToday = () => {
      const lastLogged = localStorage.getItem("last_visit_log");
      const today = new Date().toDateString();
      return lastLogged === today;
    };

    const sessionId = getSessionId();
    const qrConfirmId = searchParams.get("qr_confirm_id");

    // --- TRƯỜNG HỢP 1: ĐẾN TỪ VIỆC QUÉT MÃ QR ---
    if (qrConfirmId) {
      console.log(
        "Phát hiện quét mã QR, đang gửi xác nhận với session:",
        sessionId,
      );

      // Gọi API xác nhận thành công mà chúng ta vừa viết ở Backend
      qrCodeApi
        .confirmSuccess(qrConfirmId, sessionId)
        .then(() => {
          console.log("Xác nhận quét mã thành công!");

          // Xóa các tham số qr_confirm_id và t trên URL để trang web sạch đẹp
          searchParams.delete("qr_confirm_id");
          searchParams.delete("t");
          setSearchParams(searchParams, { replace: true });

          // Đánh dấu luôn là hôm nay đã "ghé thăm" để tránh log trùng ở Bước 2
          localStorage.setItem("last_visit_log", new Date().toDateString());
        })
        .catch((err) => {
          console.error("Lỗi khi xác nhận quét mã:", err);
        });
    }

    // --- TRƯỜNG HỢP 2: TRUY CẬP TRỰC TIẾP (KHÔNG QUA QR) ---
    else if (!hasLoggedToday()) {
      console.log(
        "Truy cập trực tiếp, ghi log hàng ngày cho session:",
        sessionId,
      );
      visitApi.logVisit(sessionId);
      localStorage.setItem("last_visit_log", new Date().toDateString());
    }
  }, [searchParams, setSearchParams]);

  return null;
};

export default VisitLogger;
