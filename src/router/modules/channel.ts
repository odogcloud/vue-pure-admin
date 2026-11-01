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
    }
  ]
} satisfies RouteConfigsTable;
