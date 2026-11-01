export default {
  path: "/channel",
  redirect: "/channel/library",
  meta: {
    icon: "ri:music-2-line",
    title: "频道管理",
    rank: 1
  },
  children: [
    {
      path: "/channel/library",
      name: "ChannelLibrary",
      component: () => import("@/views/channel/library/index.vue"),
      meta: {
        title: "曲库管理"
      }
    },
    {
      path: "/channel/library/edit-song/:id",
      name: "ChannelEditSong",
      component: () => import("@/views/channel/library/song/edit.vue"),
      meta: {
        title: "编辑曲库歌曲",
        showLink: false,
        activePath: "/channel/library"
      }
    },
    {
      path: "/channel/library/song-detail/:id",
      name: "ChannelPlaylistDetail",
      component: () => import("@/views/channel/library/playlist/detail.vue"),
      meta: {
        title: "歌单详情",
        showLink: false,
        activePath: "/channel/library"
      }
    }
  ]
} satisfies RouteConfigsTable;
