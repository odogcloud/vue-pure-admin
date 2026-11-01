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
          auths: ["channel:read"],
          title: "曲库管理"
        }
      },
      {
        path: "/channel/library/edit-song/:id",
        name: "ChannelEditSong",
        component: () => import("@/views/channel/library/song/edit.vue"),
        meta: {
          auths: ["channel:read"],
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
          auths: ["channel:read"],
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
          auths: ["customer:read"],
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
          auths: ["cooperation:read"],
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
          auths: ["member:read"],
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
          auths: ["notify:read"],
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
          auths: ["stats:read"],
          title: "数据统计"
        }
      }
    ]
  },
  {
    path: "/role",
    redirect: "/channel/role",
    meta: {
      icon: "ri:eye-line",
      title: "角色管理",
      rank: 0.7
    },
    children: [
      {
        path: "/channel/role",
        name: "ChannelRole",
        component: () => import("@/views/channel/role/index.vue"),
        meta: {
          auths: ["role:read"],
          title: "角色管理"
        }
      }
    ]
  },
  {
    path: "/sysuser",
    redirect: "/system/user/index",
    meta: {
      icon: "ri:admin-line",
      title: "用户管理",
      rank: 0.75
    },
    children: [
      {
        path: "/system/user/index",
        name: "SystemUser",
        component: () => import("@/views/system/user/index.vue"),
        meta: {
          auths: ["user:read"],
          title: "用户管理"
        }
      }
    ]
  },
  {
    path: "/syscompany",
    redirect: "/system/company/index",
    meta: {
      icon: "ri:building-line",
      title: "公司管理",
      rank: 0.76
    },
    children: [
      {
        path: "/system/company/index",
        name: "SystemCompany",
        component: () => import("@/views/system/company/index.vue"),
        meta: {
          auths: ["company:read"],
          title: "公司管理"
        }
      }
    ]
  },
  {
    path: "/sysreview",
    redirect: "/system/review/index",
    meta: {
      icon: "ri:checkbox-circle-line",
      title: "歌曲审核",
      rank: 0.77
    },
    children: [
      {
        path: "/system/review/index",
        name: "SystemReview",
        component: () => import("@/views/system/review/index.vue"),
        meta: {
          auths: ["review:read"],
          title: "歌曲审核"
        }
      }
    ]
  },
  {
    path: "/myProfile",
    redirect: "/channel/profile",
    meta: {
      icon: "ri:contacts-book-line",
      title: "我的资料",
      rank: 0.8
    },
    children: [
      {
        path: "/channel/profile",
        name: "ChannelProfile",
        component: () => import("@/views/channel/profile/index.vue"),
        meta: {
          title: "我的资料"
        }
      }
    ]
  }
] satisfies RouteConfigsTable[];
