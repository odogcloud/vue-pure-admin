import { defineFakeRoute } from "vite-plugin-fake-server/client";

const ok = (data?: unknown) => ({ code: 0, message: "操作成功", data });
const fail = (message: string) => ({ code: 1, message });

const songs = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  name: `示例歌曲 ${index + 1}`,
  released: index % 5 === 4 ? 0 : 1,
  lyricist: "示例词作者",
  composer: "示例曲作者",
  cooperationTypes: [
    ["授权", "重制", "改编"],
    ["重制", "改编"],
    ["转让", "重制", "改编"]
  ][index % 3],
  price: index % 3 === 1 ? null : (index + 1) * 500,
  submitType: index % 4 === 3 ? "author" : "label",
  contactName: index % 4 === 3 ? "示例作者" : "示例厂牌",
  contactPhone: index % 2 === 0 ? "" : "（+86） 13800000000",
  contactEmail: "demo@example.com",
  songTags: ["普通话", index % 2 === 0 ? "情歌" : "中国风"],
  tags: [] as string[],
  reason: "",
  defaultReason: "示例默认推荐理由",
  videoUrl: "",
  videoName: "",
  audioUrl: "/audio/海阔天空.mp3",
  lyrics: `示例歌曲 ${index + 1}\n作词：示例词作者\n作曲：示例曲作者\n\n这里是示例歌词第一行\n这里是示例歌词第二行`,
  status: [1, 1, 1, 2, 1, 3, 1, 4][index % 8],
  edited: 0,
  createTime: 1767225600000 - index * 86400000
}));
let nextSongId = 24;

const playlists = [
  {
    id: 1,
    cover: "",
    name: "示例歌单 1",
    tags: ["热门"],
    weight: 3,
    reason: "示例歌单推荐理由",
    creator: "示例运营",
    createTime: 1767225600000,
    items: [
      { songId: 1, weight: 5 },
      { songId: 4, weight: 1 }
    ]
  },
  {
    id: 2,
    cover: "",
    name: "示例歌单 2",
    tags: ["治愈", "适合短视频"],
    weight: 1,
    reason: "示例歌单推荐理由",
    creator: "示例运营",
    createTime: 1767139200000,
    items: [{ songId: 7, weight: 0 }]
  }
];
let nextPlaylistId = 3;

const hotTags = [
  "治愈",
  "热门",
  "小清新",
  "emo",
  "热血",
  "爱国",
  "童年",
  "适合短视频",
  "祝福",
  "遗憾",
  "白月光"
];
const aiTags = ["古风", "回忆", "岁月", "孤独", "梦想", "怀旧"];
let recentTags = ["热门", "治愈"];
let recentPlaylistIds = [1, 2];

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === "";
const matchNumber = (filter: unknown, value: number) =>
  isEmpty(filter) || Number(filter) === value;
const includes = (value: unknown, keyword: unknown) =>
  isEmpty(keyword) || String(value ?? "").includes(String(keyword));
const inRange = (time: number, range?: Array<string | number>) => {
  if (!range?.length) return true;
  return time >= Number(range[0]) && time < Number(range[1]) + 86400000;
};
const inAnyPlaylist = (songId: number) =>
  playlists.some(item => item.items.some(song => song.songId === songId));
const paginate = (list: unknown[], pageSize = 10, currentPage = 1) => {
  const start = (currentPage - 1) * pageSize;
  return ok({
    list: list.slice(start, start + pageSize),
    total: list.length,
    pageSize,
    currentPage
  });
};
const toSongRow = (song: (typeof songs)[number]) => ({
  ...song,
  inPlaylist: inAnyPlaylist(song.id) ? 1 : 0
});
const matchSong = (song: (typeof songs)[number], body) =>
  includes(song.name, body.name) &&
  includes(song.lyricist, body.lyricist) &&
  includes(song.composer, body.composer) &&
  includes(song.reason, body.reason) &&
  includes(
    `${song.contactName} ${song.contactPhone} ${song.contactEmail}`,
    body.contact
  ) &&
  (isEmpty(body.submitType) || song.submitType === body.submitType) &&
  matchNumber(body.released, song.released) &&
  (isEmpty(body.tag) ||
    [...song.songTags, ...song.tags].some(tag => tag.includes(body.tag))) &&
  matchNumber(body.edited, song.edited) &&
  matchNumber(body.status, song.status);
const rememberTags = (tags: string[]) => {
  recentTags = [...new Set([...tags, ...recentTags])].slice(0, 6);
};
const rememberPlaylist = (id: number) => {
  recentPlaylistIds = [
    id,
    ...recentPlaylistIds.filter(item => item !== id)
  ].slice(0, 8);
};
const addSongsToPlaylist = (
  playlist: (typeof playlists)[number],
  songIds: number[]
) => {
  songIds.forEach(songId => {
    if (!playlist.items.some(item => item.songId === songId)) {
      playlist.items.push({ songId, weight: 0 });
    }
  });
  rememberPlaylist(playlist.id);
};

export default defineFakeRoute([
  {
    url: "/channel/song-list",
    method: "post",
    response: ({ body }) => {
      const list = songs
        .filter(
          song =>
            matchSong(song, body) &&
            inRange(song.createTime, body.createTime) &&
            matchNumber(body.inPlaylist, inAnyPlaylist(song.id) ? 1 : 0)
        )
        .map(toSongRow);
      return paginate(list, body.pageSize, body.currentPage);
    }
  },
  {
    url: "/channel/song-detail",
    method: "post",
    response: ({ body }) => {
      const song = songs.find(item => item.id === Number(body.id));
      return song ? ok(toSongRow(song)) : fail("歌曲不存在");
    }
  },
  {
    url: "/channel/song-update",
    method: "post",
    response: ({ body }) => {
      const song = songs.find(item => item.id === Number(body.id));
      if (!song) return fail("歌曲不存在");
      if (!body.tags?.length) return fail("请输入自定义标签");
      song.tags = body.tags;
      song.reason = body.reason ?? "";
      song.videoUrl = body.videoUrl ?? "";
      song.videoName = body.videoName ?? "";
      song.edited = 1;
      rememberTags(body.tags);
      return ok();
    }
  },
  {
    url: "/channel/song-delete",
    method: "post",
    response: ({ body }) => {
      const ids: number[] = body.ids ?? [];
      if (!ids.length) return fail("请选择歌曲");
      playlists.forEach(item => {
        item.items = item.items.filter(song => !ids.includes(song.songId));
      });
      ids.forEach(id => {
        const index = songs.findIndex(song => song.id === id);
        if (index !== -1) songs.splice(index, 1);
      });
      return ok();
    }
  },
  {
    url: "/channel/song-collect",
    method: "post",
    response: ({ body }) => {
      const ids: number[] = body.ids ?? [];
      if (!ids.length) return fail("请选择歌曲");
      const targets = playlists.filter(item =>
        (body.playlistIds ?? []).includes(item.id)
      );
      if (!targets.length) return fail("歌单不存在");
      targets.forEach(item => addSongsToPlaylist(item, ids));
      return ok();
    }
  },
  {
    url: "/channel/song-import",
    method: "post",
    response: ({ body }) => {
      const rows = body.rows ?? [];
      if (!rows.length) return fail("文件中没有可导入的歌曲");
      const playlist = playlists.find(item => item.id === body.playlistId);
      if (body.playlistId && !playlist) return fail("歌单不存在");
      const ids = rows.map(row => {
        const exist = songs.find(song => song.name === row.name);
        if (exist) return exist.id;
        const id = nextSongId++;
        songs.unshift({
          ...songs[0],
          id,
          name: row.name,
          lyricist: row.lyricist ?? "",
          composer: row.composer ?? "",
          price: null,
          tags: [],
          reason: "",
          videoUrl: "",
          videoName: "",
          status: 1,
          edited: 0,
          createTime: Date.now()
        });
        return id;
      });
      if (playlist) addSongsToPlaylist(playlist, ids);
      return ok({ count: ids.length });
    }
  },
  {
    url: "/channel/tag-options",
    method: "get",
    response: () => ok({ hotTags, aiTags, recentTags })
  },
  {
    url: "/channel/recent-tag-delete",
    method: "post",
    response: ({ body }) => {
      recentTags = recentTags.filter(tag => tag !== body.tag);
      return ok();
    }
  },
  {
    url: "/channel/playlist-all",
    method: "get",
    response: () =>
      ok({
        list: playlists.map(({ id, name }) => ({ id, name })),
        recentIds: recentPlaylistIds.filter(id =>
          playlists.some(item => item.id === id)
        )
      })
  },
  {
    url: "/channel/playlist-list",
    method: "post",
    response: ({ body }) => {
      const list = playlists
        .filter(
          item =>
            includes(item.name, body.name) &&
            (isEmpty(body.tag) ||
              item.tags.some(tag => tag.includes(body.tag))) &&
            inRange(item.createTime, body.createTime)
        )
        .map(({ items, ...item }) => ({ ...item, songCount: items.length }));
      return paginate(list, body.pageSize, body.currentPage);
    }
  },
  {
    url: "/channel/playlist-save",
    method: "post",
    response: ({ body }) => {
      const name = String(body.name ?? "").trim();
      if (!body.cover) return fail("请上传歌单封面");
      if (!name) return fail("请输入歌单名称");
      if (!body.tags?.length) return fail("请输入歌单标签");
      if (!String(body.reason ?? "").trim()) return fail("请输入歌单推荐理由");
      const data = {
        cover: body.cover,
        name,
        tags: body.tags,
        weight: Number(body.weight ?? 0),
        reason: body.reason
      };
      rememberTags(body.tags);
      if (body.id) {
        const playlist = playlists.find(item => item.id === body.id);
        if (!playlist) return fail("歌单不存在");
        Object.assign(playlist, data);
        return ok();
      }
      const id = nextPlaylistId++;
      playlists.unshift({
        ...data,
        id,
        creator: body.creator ?? "",
        createTime: Date.now(),
        items: []
      });
      rememberPlaylist(id);
      return ok();
    }
  },
  {
    url: "/channel/playlist-delete",
    method: "post",
    response: ({ body }) => {
      const index = playlists.findIndex(item => item.id === body.id);
      if (index === -1) return fail("歌单不存在");
      playlists.splice(index, 1);
      return ok();
    }
  },
  {
    url: "/channel/playlist-songs",
    method: "post",
    response: ({ body }) => {
      const playlist = playlists.find(item => item.id === Number(body.id));
      if (!playlist) return fail("歌单不存在");
      const list = playlist.items
        .map(item => {
          const song = songs.find(row => row.id === item.songId);
          return song && { ...toSongRow(song), weight: item.weight };
        })
        .filter(song => song && matchSong(song, body))
        .sort((a, b) => b.weight - a.weight);
      const result = paginate(list, body.pageSize, body.currentPage);
      return ok({
        ...(result.data as object),
        playlistName: playlist.name
      });
    }
  },
  {
    url: "/channel/playlist-song-weight",
    method: "post",
    response: ({ body }) => {
      const playlist = playlists.find(item => item.id === Number(body.id));
      const item = playlist?.items.find(row => row.songId === body.songId);
      if (!item) return fail("歌曲不在该歌单中");
      item.weight = Number(body.weight ?? 0);
      return ok();
    }
  },
  {
    url: "/channel/playlist-song-remove",
    method: "post",
    response: ({ body }) => {
      const playlist = playlists.find(item => item.id === Number(body.id));
      if (!playlist) return fail("歌单不存在");
      const ids: number[] = body.ids ?? [];
      playlist.items = playlist.items.filter(
        item => !ids.includes(item.songId)
      );
      return ok();
    }
  }
]);
