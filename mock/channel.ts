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
  inPlaylist: index % 3 === 0 ? 1 : 0,
  status: index % 4 === 0 ? 0 : 1,
  createTime: 1767225600000 - index * 86400000
}));

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
  }
]);
