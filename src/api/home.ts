import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

/** 公告（type=1）或手册&附件（type=2）列表 */
export const getNotices = (data?: object) =>
  http.request<
    Result<{
      list: Array<any>;
      total?: number;
      pageSize?: number;
      currentPage?: number;
    }>
  >("post", "/home/notices", { data });

/** 公告或手册详情 */
export const getNoticeDetail = (data?: object) =>
  http.request<
    Result<{
      id: number;
      type: number;
      title: string;
      content: string;
      publishTime: number;
      attachments: Array<{ name: string; url: string; size: number }>;
    }>
  >("post", "/home/notice-detail", { data });
