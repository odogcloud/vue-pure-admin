import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

/** 公司和厂牌列表 */
export const getCompanyList = (data?: object) =>
  http.request<
    Result<{
      list: Array<any>;
      total?: number;
      pageSize?: number;
      currentPage?: number;
    }>
  >("post", "/company/list", { data });

/** 新增或编辑 */
export const saveCompany = (data?: object) =>
  http.request<Result>("post", "/company/save", { data });

/** 启用或停用 */
export const updateCompanyStatus = (data?: object) =>
  http.request<Result>("post", "/company/status", { data });

/** 删除没有内容的频道 */
export const deleteCompany = (data?: object) =>
  http.request<Result>("post", "/company/delete", { data });

/** 频道成员 */
export const getCompanyMembers = (data?: object) =>
  http.request<Result<Array<any>>>("post", "/company/members", { data });

/** 添加成员 */
export const addCompanyMember = (data?: object) =>
  http.request<Result>("post", "/company/member-add", { data });

/** 移除成员 */
export const removeCompanyMember = (data?: object) =>
  http.request<Result>("post", "/company/member-remove", { data });
