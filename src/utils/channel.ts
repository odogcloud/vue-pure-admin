import { storageLocal } from "@pureadmin/utils";

const CHANNEL_KEY = "current-channel-id";

/** 当前频道，请求时通过 X-Channel-Id 发送给后端 */
export const getCurrentChannelId = () =>
  storageLocal().getItem<number>(CHANNEL_KEY);

export const setCurrentChannelId = (id: number) =>
  storageLocal().setItem(CHANNEL_KEY, id);

export const removeCurrentChannelId = () =>
  storageLocal().removeItem(CHANNEL_KEY);
