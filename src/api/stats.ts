import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

type StatsResult = Result<{
  summary?: { people: number; avgCount: number; avgSeconds: number };
  list: Array<any>;
  total?: number;
  pageSize?: number;
  currentPage?: number;
}>;

/** 客户统计 */
export const getCustomerStats = (data?: object) =>
  http.request<StatsResult>("post", "/stats/customers", { data });

/** 频道用户统计 */
export const getMemberStats = (data?: object) =>
  http.request<StatsResult>("post", "/stats/members", { data });

/** 客户收藏的歌曲 */
export const getCustomerFavorites = (data?: object) =>
  http.request<StatsResult>("post", "/stats/customer-favorites", { data });

/** 上报试听时长 */
export const reportListen = (data?: object) =>
  http.request<Result>("post", "/stats/listen", { data });
