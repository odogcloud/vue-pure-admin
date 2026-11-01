import dayjs from "dayjs";
import editForm from "../form.vue";
import collectForm from "../collect.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { deviceDetection } from "@pureadmin/utils";
import {
  collectSong,
  deleteSong,
  getPlaylistOptions,
  getSongList,
  updateSong
} from "@/api/channel";
import type { PaginationProps } from "@pureadmin/table";
import { h, onMounted, reactive, ref } from "vue";

export function useLibrary() {
  const form = reactive({
    name: "",
    status: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  const editFormRef = ref();
  const collectFormRef = ref();
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    { label: "作品", prop: "name", minWidth: 150 },
    { label: "词作者", prop: "lyricist", minWidth: 110 },
    { label: "曲作者", prop: "composer", minWidth: 110 },
    { label: "歌曲价格", prop: "price", minWidth: 90 },
    { label: "确权联系人", prop: "contact", minWidth: 160 },
    { label: "自定义标签", prop: "tags", minWidth: 100 },
    { label: "歌曲推荐理由", prop: "reason", minWidth: 150 },
    {
      label: "是否收录歌单",
      prop: "inPlaylist",
      minWidth: 110,
      formatter: ({ inPlaylist }) => (inPlaylist ? "已收录" : "未收录")
    },
    { label: "状态", slot: "status", minWidth: 90 },
    {
      label: "加入时间",
      prop: "createTime",
      minWidth: 170,
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    { label: "操作", fixed: "right", width: 220, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getSongList({
        ...form,
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage
      });
      dataList.value = data.list;
      pagination.total = data.total;
    } finally {
      loading.value = false;
    }
  }

  function handleSearch() {
    pagination.currentPage = 1;
    onSearch();
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    handleSearch();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleTodo(name: string) {
    message(`${name}：功能开发中`, { type: "info" });
  }

  function openEdit(row) {
    addDialog({
      title: "编辑曲库歌曲",
      props: {
        formInline: {
          id: row.id,
          name: row.name,
          tags: row.tags ?? "",
          reason: row.reason ?? "",
          videoUrl: row.videoUrl ?? ""
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, { ref: editFormRef, formInline: null }),
      beforeSure: async (done, { options }) => {
        const { code, message: msg } = await updateSong(
          options.props.formInline
        );
        if (code !== 0) {
          message(msg, { type: "error" });
          return;
        }
        message("保存成功", { type: "success" });
        done();
        onSearch();
      }
    });
  }

  async function openCollect(row) {
    const { code, message: msg, data } = await getPlaylistOptions();
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    addDialog({
      title: "收录到歌单",
      props: {
        formInline: { id: row.id, name: row.name, playlistId: null }
      },
      width: "30%",
      draggable: true,
      fullscreen: deviceDetection(),
      closeOnClickModal: false,
      contentRenderer: () =>
        h(collectForm, {
          ref: collectFormRef,
          formInline: null,
          playlists: data
        }),
      beforeSure: (done, { options }) => {
        collectFormRef.value.getRef().validate(async valid => {
          if (!valid) return;
          const result = await collectSong(options.props.formInline);
          if (result.code !== 0) {
            message(result.message, { type: "error" });
            return;
          }
          message("收录成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  async function handleDelete(row) {
    const { code, message: msg } = await deleteSong({ id: row.id });
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    message("删除成功", { type: "success" });
    if (dataList.value.length === 1 && pagination.currentPage > 1) {
      pagination.currentPage -= 1;
    }
    onSearch();
  }

  onMounted(onSearch);

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    handleSearch,
    resetForm,
    handleTodo,
    openEdit,
    openCollect,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}
