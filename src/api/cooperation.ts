import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

/** 合作申请列表 */
export const getCooperationList = (data?: object) =>
  http.request<
    Result<{
      list: Array<any>;
      total?: number;
      pageSize?: number;
      currentPage?: number;
    }>
  >("post", "/cooperation/list", { data });

/** 处理合作申请 */
export const handleCooperation = (data?: object) =>
  http.request<Result>("post", "/cooperation/handle", { data });
