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
  http.request<Result<Array<{ id: number; name: string }>>>(
    "get",
    "/member/role-options"
  );

/** 修改成员角色 */
export const updateMember = (data?: object) =>
  http.request<Result>("post", "/member/update", { data });
