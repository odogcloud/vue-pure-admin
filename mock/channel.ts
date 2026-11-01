import { defineFakeRoute } from "vite-plugin-fake-server/client";

const songs = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  name: `示例歌曲 ${index + 1}`,
  lyricist: "示例词作者",
  composer: "示例曲作者",
  price: (index + 1) * 500,
  contact: "demo@example.com",
  tags: index % 2 === 0 ? "热门" : "",
  reason: "示例推荐理由",
  videoUrl: "",
  inPlaylist: index % 3 === 0 ? 1 : 0,
  status: index % 4 === 0 ? 0 : 1,
  createTime: 1767225600000 - index * 86400000
}));

const playlists = [
  { id: 1, name: "示例歌单 1" },
  { id: 2, name: "示例歌单 2" }
];

export default defineFakeRoute([
  {
    url: "/channel/song-list",
    method: "post",
    response: ({ body }) => {
      const { name = "", status = "", pageSize = 10, currentPage = 1 } = body;
      const filtered = songs.filter(
        item =>
          item.name.includes(name) &&
          (status === "" || item.status === Number(status))
      );
      const start = (currentPage - 1) * pageSize;
      return {
        code: 0,
        message: "操作成功",
        data: {
          list: filtered.slice(start, start + pageSize),
          total: filtered.length,
          pageSize,
          currentPage
        }
      };
    }
  },
  {
    url: "/channel/song-update",
    method: "post",
    response: ({ body }) => {
      const song = songs.find(item => item.id === body.id);
      if (!song) {
        return { code: 1, message: "歌曲不存在" };
      }
      song.tags = body.tags;
      song.reason = body.reason;
      song.videoUrl = body.videoUrl;
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/channel/song-delete",
    method: "post",
    response: ({ body }) => {
      const index = songs.findIndex(item => item.id === body.id);
      if (index === -1) {
        return { code: 1, message: "歌曲不存在" };
      }
      songs.splice(index, 1);
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/channel/playlist-all",
    method: "get",
    response: () => {
      return { code: 0, message: "操作成功", data: playlists };
    }
  },
  {
    url: "/channel/song-collect",
    method: "post",
    response: ({ body }) => {
      const song = songs.find(item => item.id === body.id);
      if (!song) {
        return { code: 1, message: "歌曲不存在" };
      }
      song.inPlaylist = 1;
      return { code: 0, message: "操作成功" };
    }
  }
]);
