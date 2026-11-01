import { h, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { collectSongs, getPlaylistOptions } from "@/api/channel";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import CollectForm from "../components/CollectForm.vue";

/** 歌曲相关的公共操作 */
export function useSongActions() {
  const router = useRouter();
  const collectFormRef = ref();

  function openPage(name: string, path: string, title: string, id: number) {
    const params = { id: String(id) };
    useMultiTagsStoreHook().handleTags("push", {
      path,
      name,
      params,
      meta: { title }
    });
    router.push({ name, params });
  }

  function goEdit(row) {
    openPage(
      "ChannelEditSong",
      "/channel/library/edit-song/:id",
      "编辑曲库歌曲",
      row.id
    );
  }

  function goPlaylistDetail(row) {
    openPage(
      "ChannelPlaylistDetail",
      "/channel/library/song-detail/:id",
      "歌单详情",
      row.id
    );
  }

  function openLyrics(row) {
    addDialog({
      title: "查看歌词",
      width: "480px",
      draggable: true,
      hideFooter: true,
      contentRenderer: () =>
        h(
          "div",
          {
            style: {
              whiteSpace: "pre-wrap",
              maxHeight: "60vh",
              overflow: "auto"
            }
          },
          row.lyrics || "暂无歌词"
        )
    });
  }

  async function openCollect(
    ids: number[],
    onDone: () => void,
    options: { title?: string; excludeId?: number } = {}
  ) {
    const { code, message: msg, data } = await getPlaylistOptions();
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    const playlists = data.list.filter(item => item.id !== options.excludeId);
    const recents = data.recentIds
      .map(id => playlists.find(item => item.id === id))
      .filter(Boolean);
    addDialog({
      title: options.title ?? "收录到歌单",
      width: "520px",
      draggable: true,
      closeOnClickModal: false,
      props: {
        formInline: { playlistId: recents[0]?.id ?? null }
      },
      contentRenderer: () =>
        h(CollectForm, {
          ref: collectFormRef,
          formInline: null,
          playlists,
          recents
        }),
      beforeSure: (done, { options: dialog }) => {
        collectFormRef.value.getRef().validate(async valid => {
          if (!valid) return;
          const form = dialog.props.formInline as { playlistId: number };
          const result = await collectSongs({
            ids,
            playlistId: form.playlistId
          });
          if (result.code !== 0) {
            message(result.message, { type: "error" });
            return;
          }
          message("收录成功", { type: "success" });
          done();
          onDone();
        });
      }
    });
  }

  return { goEdit, goPlaylistDetail, openLyrics, openCollect };
}
