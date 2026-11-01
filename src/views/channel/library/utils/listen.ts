import { reportListen } from "@/api/stats";

/** 记录试听时长，暂停或播放结束时上报（结束时浏览器也会触发 pause） */
export function useListenReport() {
  const startedAt = new WeakMap<EventTarget, number>();

  function onAudioPlay(event: Event) {
    startedAt.set(event.target, Date.now());
  }

  function onAudioStop(row: { id: number }, event: Event) {
    const started = startedAt.get(event.target);
    if (!started) return;
    startedAt.delete(event.target);
    const seconds = Math.round((Date.now() - started) / 1000);
    if (seconds > 0) {
      // 统计失败不影响试听
      reportListen({ songId: row.id, seconds }).catch(() => {});
    }
  }

  return { onAudioPlay, onAudioStop };
}
