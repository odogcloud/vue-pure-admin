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
  {
    id: 1,
    name: "示例歌单 1",
    remark: "示例备注",
    songIds: [] as number[],
    createTime: 1767225600000
  },
  {
    id: 2,
    name: "示例歌单 2",
    remark: "",
    songIds: [] as number[],
    createTime: 1767139200000
  }
];
let nextPlaylistId = 3;

/** 同步歌曲的收录状态 */
function syncInPlaylist(songId: number) {
  const song = songs.find(item => item.id === songId);
  if (song) {
    song.inPlaylist = playlists.some(item => item.songIds.includes(songId))
      ? 1
      : 0;
  }
}

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
      playlists.forEach(item => {
        item.songIds = item.songIds.filter(id => id !== body.id);
      });
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
      const playlist = playlists.find(item => item.id === body.playlistId);
      if (!playlist) {
        return { code: 1, message: "歌单不存在" };
      }
      if (!playlist.songIds.includes(song.id)) {
        playlist.songIds.push(song.id);
      }
      song.inPlaylist = 1;
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/channel/playlist-list",
    method: "post",
    response: ({ body }) => {
      const { name = "", pageSize = 10, currentPage = 1 } = body;
      const filtered = playlists.filter(item => item.name.includes(name));
      const start = (currentPage - 1) * pageSize;
      return {
        code: 0,
        message: "操作成功",
        data: {
          list: filtered
            .slice(start, start + pageSize)
            .map(({ songIds, ...item }) => ({
              ...item,
              songCount: songIds.length
            })),
          total: filtered.length,
          pageSize,
          currentPage
        }
      };
    }
  },
  {
    url: "/channel/playlist-save",
    method: "post",
    response: ({ body }) => {
      const name = String(body.name ?? "").trim();
      if (!name) {
        return { code: 1, message: "请输入歌单名称" };
      }
      if (body.id) {
        const playlist = playlists.find(item => item.id === body.id);
        if (!playlist) {
          return { code: 1, message: "歌单不存在" };
        }
        playlist.name = name;
        playlist.remark = body.remark ?? "";
        return { code: 0, message: "操作成功" };
      }
      playlists.unshift({
        id: nextPlaylistId++,
        name,
        remark: body.remark ?? "",
        songIds: [],
        createTime: Date.now()
      });
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/channel/playlist-delete",
    method: "post",
    response: ({ body }) => {
      const index = playlists.findIndex(item => item.id === body.id);
      if (index === -1) {
        return { code: 1, message: "歌单不存在" };
      }
      const [removed] = playlists.splice(index, 1);
      removed.songIds.forEach(syncInPlaylist);
      return { code: 0, message: "操作成功" };
    }
  }
]);
