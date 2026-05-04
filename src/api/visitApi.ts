import type { ApiResponse } from "../types/api.types";
import axiosClient from "./axiosClient";

const visitApi = {
  logVisit: async (sessionId?: string) => {
    try {
      await axiosClient.post(`/stall-trigger-config/log-visit`, null, {
        params: { sessionId },
      });
    } catch (error) {
      console.error("Failed to log visit:", error);
    }
  },
  getStats: async (): Promise<ApiResponse<any>> => {
    return await axiosClient.get(`/admin/dashboard/stats`);
  },
  getVendorStats: async (
    stallId: number,
    days: number = 7,
  ): Promise<ApiResponse<any>> => {
    return await axiosClient.get(`/vendor/dashboard/stats/${stallId}`, {
      params: { days },
    });
  },
  getAudioStats: (): Promise<ApiResponse<any>> => {
    return axiosClient.get("/analytics/stall-audio");
  },
};

export default visitApi;
