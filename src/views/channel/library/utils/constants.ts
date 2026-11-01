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
