import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

export type MyChannel = {
  id: number;
  name: string;
  status: string;
};

export type ApplyCode = {
  name: string;
  code: string;
  expiresAt: number;
  validDays: number;
};

/** 我加入的频道 */
export const getMyChannels = () =>
  http.request<Result<MyChannel[]>>("get", "/channels/mine");

/** 修改频道名称 */
export const updateChannelName = (data?: object) =>
  http.request<Result>("post", "/channels/update-name", { data });

/** 获取频道申请码 */
export const getApplyCode = (data?: object) =>
  http.request<Result<ApplyCode>>("post", "/channels/apply-code", { data });
