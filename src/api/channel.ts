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
  playlistName?: string;
  canCompanyReview?: boolean;
  allChannels?: boolean;
}>;

const post = <T = Result>(url: string, data?: object) =>
  http.request<T>("post", url, { data });

/** 频道曲库列表 */
export const getSongList = (data?: object) =>
  post<ResultTable>("/channel/song-list", data);

/** 曲库歌曲详情 */
export const getSongDetail = (data?: object) =>
  post<Result<any>>("/channel/song-detail", data);

/** 新增歌曲，保存为草稿 */
export const createSong = (data?: object) =>
  post<Result<{ id: number }>>("/channel/song-create", data);

/** 修改草稿或被拒绝的歌曲 */
export const updateSongDraft = (data?: object) =>
  post("/channel/song-draft-update", data);

/** 公司审核通过，提交给平台（支持批量） */
export const companyApproveSongs = (data?: object) =>
  post<Result<{ count: number }>>("/channel/song-company-approve", data);

/** 公司审核拒绝 */
export const companyRejectSong = (data?: object) =>
  post("/channel/song-company-reject", data);

/** 提交审核（支持批量） */
export const submitSongs = (data?: object) =>
  post<Result<{ count: number; skipped: number }>>(
    "/channel/song-submit",
    data
  );

/** 编辑曲库歌曲 */
export const updateSong = (data?: object) => post("/channel/song-update", data);

/** 删除曲库歌曲（支持批量） */
export const deleteSongs = (data?: object) =>
  post("/channel/song-delete", data);

/** 收录歌曲到歌单（支持批量） */
export const collectSongs = (data?: object) =>
  post("/channel/song-collect", data);

/** 批量导入歌曲 */
export const importSongs = (data?: object) =>
  post<Result<{ count: number }>>("/channel/song-import", data);

/** 标签选项 */
export const getTagOptions = () =>
  http.request<
    Result<{ hotTags: string[]; aiTags: string[]; recentTags: string[] }>
  >("get", "/channel/tag-options");

/** 删除最近使用的标签 */
export const deleteRecentTag = (data?: object) =>
  post("/channel/recent-tag-delete", data);

/** 全部歌单及最近加入的歌单 */
export const getPlaylistOptions = () =>
  http.request<
    Result<{
      list: Array<{ id: number; name: string }>;
      recentIds: number[];
    }>
  >("get", "/channel/playlist-all");

/** 频道歌单列表 */
export const getPlaylistList = (data?: object) =>
  post<ResultTable>("/channel/playlist-list", data);

/** 新增或编辑频道歌单 */
export const savePlaylist = (data?: object) =>
  post("/channel/playlist-save", data);

/** 删除频道歌单 */
export const deletePlaylist = (data?: object) =>
  post("/channel/playlist-delete", data);

/** 歌单内歌曲列表 */
export const getPlaylistSongs = (data?: object) =>
  post<ResultTable>("/channel/playlist-songs", data);

/** 修改歌曲在歌单内的权重 */
export const updatePlaylistSongWeight = (data?: object) =>
  post("/channel/playlist-song-weight", data);

/** 取消收录（支持批量） */
export const removePlaylistSongs = (data?: object) =>
  post("/channel/playlist-song-remove", data);

/** 上传图片、视频或音频，返回可访问的地址 */
export const uploadFile = (file: File, kind: "image" | "video" | "audio") => {
  const data = new FormData();
  data.append("file", file);
  data.append("kind", kind);
  return http.request<Result<{ url: string; name: string }>>(
    "post",
    "/channel/upload",
    {
      data,
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0
    }
  );
};
