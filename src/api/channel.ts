import { http } from "@/utils/http";

type ResultTable = {
  code: number;
  message: string;
  data?: {
    list: Array<any>;
    total?: number;
    pageSize?: number;
    currentPage?: number;
  };
};

/** 频道曲库列表 */
export const getSongList = (data?: object) => {
  return http.request<ResultTable>("post", "/channel/song-list", { data });
};
