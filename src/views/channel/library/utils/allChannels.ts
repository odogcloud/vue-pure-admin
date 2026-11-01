import { ref } from "vue";

const DEFAULT_CHANNEL_ID = 1;

/**
 * 超级管理员在默认频道可以查看所有频道的数据。
 * 其他频道的数据只能查看，需要切换到对应频道后才能操作。
 */
export function useAllChannels() {
  const allChannels = ref(false);

  const onLoaded = (data: any) => {
    allChannels.value = Boolean(data?.allChannels);
  };

  const canOperate = (row: any) =>
    !allChannels.value ||
    row.channelId === DEFAULT_CHANNEL_ID ||
    Boolean(row.channelIds?.includes(DEFAULT_CHANNEL_ID));

  const channelColumn = {
    label: "所属频道",
    prop: "channelName",
    width: 120,
    hide: () => !allChannels.value
  };

  return { allChannels, onLoaded, canOperate, channelColumn };
}
