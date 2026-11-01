import { http } from "@/utils/http";

type Result<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

type ResultTable = Result<{
  list: Array<any>;
  total?: number;
  pageSize?: number;
  currentPage?: number;
}>;

const post = <T = Result>(url: string, data?: object) =>
  http.request<T>("post", url, { data });

/** 客户申请列表 */
export const getApplicationList = (data?: object) =>
  post<ResultTable>("/customer/application-list", data);

/** 处理客户申请 */
export const handleApplication = (data?: object) =>
  post("/customer/application-handle", data);

/** 我的客户列表 */
export const getCustomerList = (data?: object) =>
  post<ResultTable>("/customer/list", data);

/** 按完整邮箱搜索客户 */
export const searchCustomer = (data?: object) =>
  post<
    Result<{
      id: number;
      name: string;
      company: string;
      email: string;
      added: boolean;
    } | null>
  >("/customer/search", data);

/** 添加客户 */
export const addCustomer = (data?: object) => post("/customer/add", data);

/** 修改客户权限 */
export const updateCustomer = (data?: object) => post("/customer/update", data);

/** 取消分享（支持批量） */
export const removeCustomers = (data?: object) =>
  post("/customer/remove", data);
