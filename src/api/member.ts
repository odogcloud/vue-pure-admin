import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

/** 成员列表 */
export const getMemberList = (data?: object) =>
  http.request<
    Result<{
      list: Array<any>;
      total?: number;
      pageSize?: number;
      currentPage?: number;
    }>
  >("post", "/member/list", { data });

/** 角色选项 */
export const getRoleOptions = () =>
  http.request<
    Result<Array<{ id: number; name: string; assignable: boolean }>>
  >("get", "/member/role-options");

/** 添加成员，创建账号并加入当前频道 */
export const createMember = (data?: object) =>
  http.request<Result>("post", "/member/create", { data });

/** 从当前频道移除成员 */
export const removeMember = (data?: object) =>
  http.request<Result>("post", "/member/remove", { data });

/** 修改成员角色 */
export const updateMember = (data?: object) =>
  http.request<Result>("post", "/member/update", { data });
