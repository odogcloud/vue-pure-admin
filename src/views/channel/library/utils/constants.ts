export const submitTypeOptions = [
  { label: "作者", value: "author" },
  { label: "厂牌", value: "label" }
];

export const releasedOptions = [
  { label: "未发行", value: 0 },
  { label: "已发行", value: 1 }
];

export const inPlaylistOptions = [
  { label: "未收录到歌单", value: 0 },
  { label: "已收录到歌单", value: 1 }
];

export const editedOptions = [
  { label: "已编辑", value: 1 },
  { label: "未编辑", value: 0 }
];

export const statusOptions = [
  { label: "已入库", value: 1 },
  { label: "已下架", value: 2 },
  { label: "音乐人已下架", value: 3 },
  { label: "重新上架中", value: 4 }
];

export const statusText = (status: number) =>
  statusOptions.find(item => item.value === status)?.label ?? "-";

const toOptions = (values: string[]) =>
  values.map(value => ({ label: value, value }));

export const tagCascaderOptions = [
  {
    label: "曲风",
    value: "genre",
    children: toOptions([
      "中国风",
      "旋律说唱",
      "情歌",
      "亲情",
      "下沉",
      "治愈",
      "民谣",
      "摇滚",
      "嘻哈说唱",
      "网络风",
      "其他"
    ])
  },
  {
    label: "语种",
    value: "language",
    children: toOptions([
      "普通话",
      "英语",
      "粤语",
      "少数民族语言",
      "地方方言",
      "韩语",
      "小语种",
      "其他"
    ])
  }
];

export const reviewStatusOptions = [
  { label: "草稿", value: "draft" },
  { label: "待公司审核", value: "company_pending" },
  { label: "待平台审核", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已拒绝", value: "rejected" }
];
