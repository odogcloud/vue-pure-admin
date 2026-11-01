import { http } from "@/utils/http";

type Result = {
  code: number;
  message: string;
  data?: Array<any>;
};

type ResultTable = {
  code: number;
  message: string;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};

type ResultAction = {
  code: number;
  message: string;
};

/** 获取系统管理-用户管理列表 */
export const getUserList = (data?: object) => {
  return http.request<ResultTable>("post", "/sysuser/list", { data });
};

/** 系统管理-用户管理-可分配的角色和频道 */
export const getUserOptions = () => {
  return http.request<{
    code: number;
    message: string;
    data?: {
      roles: { id: number; name: string }[];
      channels: { id: number; name: string }[];
    };
  }>("get", "/sysuser/options");
};

/** 系统管理-用户管理-新增 */
export const createUser = (data?: object) => {
  return http.request<ResultAction>("post", "/sysuser/create", { data });
};

/** 系统管理-用户管理-修改资料 */
export const updateUser = (data?: object) => {
  return http.request<ResultAction>("post", "/sysuser/update", { data });
};

/** 系统管理-用户管理-启用或停用 */
export const updateUserStatus = (data?: object) => {
  return http.request<ResultAction>("post", "/sysuser/status", { data });
};

/** 系统管理-用户管理-删除，支持批量 */
export const deleteUsers = (data?: object) => {
  return http.request<ResultAction>("post", "/sysuser/delete", { data });
};

/** 系统管理-用户管理-重置密码 */
export const resetUserPassword = (data?: object) => {
  return http.request<ResultAction>("post", "/sysuser/reset-password", {
    data
  });
};

/** 系统管理-用户管理-分配角色和频道 */
export const assignUser = (data?: object) => {
  return http.request<ResultAction>("post", "/sysuser/assign", { data });
};

/** 获取系统管理-角色管理列表 */
export const getRoleList = (data?: object) => {
  return http.request<ResultTable>("post", "/role", { data });
};

/** 获取系统管理-菜单管理列表 */
export const getMenuList = (data?: object) => {
  return http.request<Result>("post", "/menu", { data });
};

/** 获取系统管理-部门管理列表 */
export const getDeptList = (data?: object) => {
  return http.request<Result>("post", "/dept", { data });
};

/** 获取系统监控-在线用户列表 */
export const getOnlineLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/online-logs", { data });
};

/** 获取系统监控-登录日志列表 */
export const getLoginLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/login-logs", { data });
};

/** 获取系统监控-操作日志列表 */
export const getOperationLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/operation-logs", { data });
};

/** 获取系统监控-系统日志列表 */
export const getSystemLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/system-logs", { data });
};

/** 获取系统监控-系统日志-根据 id 查日志详情 */
export const getSystemLogsDetail = (data?: object) => {
  return http.request<Result>("post", "/system-logs-detail", { data });
};

/** 获取角色管理-权限-菜单权限 */
export const getRoleMenu = (data?: object) => {
  return http.request<Result>("post", "/role-menu", { data });
};

/** 获取角色管理-权限-菜单权限-根据角色 id 查对应菜单 */
export const getRoleMenuIds = (data?: object) => {
  return http.request<Result>("post", "/role-menu-ids", { data });
};
