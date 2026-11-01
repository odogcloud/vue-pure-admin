import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

/** 待审核和已审核的歌曲 */
export const getReviewList = (data?: object) =>
  http.request<
    Result<{
      list: Array<any>;
      total?: number;
      pageSize?: number;
      currentPage?: number;
    }>
  >("post", "/review/list", { data });

/** 全部频道，用于筛选 */
export const getReviewChannels = () =>
  http.request<Result<Array<{ id: number; name: string }>>>(
    "get",
    "/review/channels"
  );

/** 审核通过（支持批量） */
export const approveSongs = (data?: object) =>
  http.request<Result<{ count: number }>>("post", "/review/approve", { data });

/** 审核拒绝 */
export const rejectSong = (data?: object) =>
  http.request<Result>("post", "/review/reject", { data });
