export default [
  {
    path: "/library",
    redirect: "/channel/library",
    meta: {
      icon: "ri:briefcase-4-line",
      title: "曲库管理",
      rank: 0.1
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
  },
  {
    path: "/songcustomer",
    redirect: "/channel/customer",
    meta: {
      icon: "ri:headphone-line",
      title: "歌曲客户",
      rank: 0.2
    },
    children: [
      {
        path: "/channel/customer",
        name: "ChannelCustomer",
        component: () => import("@/views/channel/customer/index.vue"),
        meta: {
          title: "歌曲客户"
        }
      }
    ]
  },
  {
    path: "/application",
    redirect: "/channel/cooperation",
    meta: {
      icon: "ri:file-list-3-line",
      title: "合作申请",
      rank: 0.3
    },
    children: [
      {
        path: "/channel/cooperation",
        name: "ChannelCooperation",
        component: () => import("@/views/channel/cooperation/index.vue"),
        meta: {
          title: "合作申请"
        }
      }
    ]
  },
  {
    path: "/member",
    redirect: "/channel/member",
    meta: {
      icon: "ri:user-line",
      title: "成员管理",
      rank: 0.4
    },
    children: [
      {
        path: "/channel/member",
        name: "ChannelMember",
        component: () => import("@/views/channel/member/index.vue"),
        meta: {
          title: "成员管理"
        }
      }
    ]
  },
  {
    path: "/messmgr",
    redirect: "/channel/notify",
    meta: {
      icon: "ri:message-2-line",
      title: "通知管理",
      rank: 0.5
    },
    children: [
      {
        path: "/channel/notify",
        name: "ChannelNotify",
        component: () => import("@/views/channel/notify/index.vue"),
        meta: {
          title: "通知管理"
        }
      }
    ]
  },
  {
    path: "/statistics",
    redirect: "/channel/statistics",
    meta: {
      icon: "ri:bar-chart-2-line",
      title: "数据统计",
      rank: 0.6
    },
    children: [
      {
        path: "/channel/statistics",
        name: "ChannelStatistics",
        component: () => import("@/views/channel/statistics/index.vue"),
        meta: {
          title: "数据统计"
        }
      }
    ]
  }
] satisfies RouteConfigsTable[];
