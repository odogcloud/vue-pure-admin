import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

/** 通知人列表 */
export const getNotifyList = (data?: object) =>
  http.request<
    Result<{
      list: Array<any>;
      total?: number;
      pageSize?: number;
      currentPage?: number;
    }>
  >("post", "/notify/list", { data });

/** 新增或编辑通知人 */
export const saveNotify = (data?: object) =>
  http.request<Result>("post", "/notify/save", { data });

/** 删除通知人 */
export const deleteNotify = (data?: object) =>
  http.request<Result>("post", "/notify/delete", { data });
