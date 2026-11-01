import { http } from "@/utils/http";

export type UserResult = {
  code: number;
  message: string;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  code: number;
  message: string;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type UserInfo = {
  /** 头像 */
  avatar: string;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 邮箱 */
  email: string;
  /** 联系电话 */
  phone: string;
  /** 简介 */
  description: string;
};

export type UserInfoResult = {
  code: number;
  message: string;
  data: UserInfo;
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

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/login", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

/** 账户设置-个人信息 */
export const getMine = (data?: object) => {
  return http.request<UserInfoResult>("get", "/mine", { data });
};

/** 账户设置-个人安全日志 */
export const getMineLogs = (data?: object) => {
  return http.request<ResultTable>("get", "/mine-logs", { data });
};

type BaseResult = {
  code: number;
  message: string;
};

/** 退出登录，让刷新令牌失效 */
export const logoutApi = (data?: object) => {
  return http.request<BaseResult>("post", "/logout", { data });
};

/** 账户设置-更新个人信息 */
export const updateMine = (data?: object) => {
  return http.request<BaseResult>("post", "/mine", { data });
};

/** 账户设置-修改密码 */
export const changePassword = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/change-password", { data });
};

/** 忘记密码，发送重置链接 */
export const forgotPassword = (data?: object) => {
  return http.request<BaseResult>("post", "/forgot-password", { data });
};

/** 通过链接重置密码 */
export const resetPassword = (data?: object) => {
  return http.request<BaseResult>("post", "/reset-password", { data });
};

/** 通过链接激活账号并设置密码 */
export const activateAccount = (data?: object) => {
  return http.request<BaseResult>("post", "/activate-account", { data });
};
