import { storageLocal } from "@pureadmin/utils";
import { getMine } from "@/api/user";
import { type DataInfo, userKey } from "@/utils/auth";

const SYNC_INTERVAL_MS = 30 * 1000;

const sameList = (a: string[] = [], b: string[] = []) =>
  [...a].sort().join() === [...b].sort().join();

/** 管理员修改权限后，让已登录用户的菜单和按钮跟着更新 */
async function syncPermissions() {
  const stored = storageLocal().getItem<DataInfo<number>>(userKey);
  if (!stored) return;
  try {
    const { code, data } = (await getMine()) as any;
    if (code !== 0 || !data?.permissions) return;
    if (
      sameList(stored.permissions, data.permissions) &&
      sameList(stored.roles, data.roles)
    ) {
      return;
    }
    storageLocal().setItem(userKey, {
      ...stored,
      roles: data.roles,
      permissions: data.permissions
    });
    window.location.reload();
  } catch {
    // 下次定时同步时重试
  }
}

/** 开始定时同步，返回停止函数 */
export function startPermissionSync() {
  syncPermissions();
  const timer = window.setInterval(syncPermissions, SYNC_INTERVAL_MS);
  window.addEventListener("focus", syncPermissions);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", syncPermissions);
  };
}
