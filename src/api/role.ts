import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

export type PermissionGroup = {
  label: string;
  items: Array<{ label: string; value: string }>;
};

/** 角色列表 */
export const getRoleList = (data?: object) =>
  http.request<
    Result<{
      list: Array<any>;
      total?: number;
      pageSize?: number;
      currentPage?: number;
    }>
  >("post", "/role/list", { data });

/** 新增或修改角色 */
export const saveRole = (data?: object) =>
  http.request<Result>("post", "/role/save", { data });

/** 删除角色 */
export const deleteRole = (data?: object) =>
  http.request<Result>("post", "/role/delete", { data });

/** 可分配的权限 */
export const getPermissionOptions = () =>
  http.request<Result<PermissionGroup[]>>("get", "/role/permission-options");

/** 设置角色权限 */
export const setRolePermissions = (data?: object) =>
  http.request<Result>("post", "/role/set-permissions", { data });
