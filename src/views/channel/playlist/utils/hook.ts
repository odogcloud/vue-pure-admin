import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { deviceDetection } from "@pureadmin/utils";
import { deletePlaylist, getPlaylistList, savePlaylist } from "@/api/channel";
import type { PaginationProps } from "@pureadmin/table";
import { h, onMounted, reactive, ref } from "vue";

export function usePlaylist() {
  const form = reactive({
    name: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  const editFormRef = ref();
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    { label: "歌单名称", prop: "name", minWidth: 180 },
    { label: "歌曲数量", prop: "songCount", minWidth: 100 },
    { label: "备注", prop: "remark", minWidth: 200 },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 170,
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    { label: "操作", fixed: "right", width: 160, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getPlaylistList({
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

  function openDialog(row?) {
    addDialog({
      title: row ? "编辑歌单" : "新增歌单",
      props: {
        formInline: {
          id: row?.id,
          name: row?.name ?? "",
          remark: row?.remark ?? ""
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, { ref: editFormRef, formInline: null }),
      beforeSure: (done, { options }) => {
        editFormRef.value.getRef().validate(async valid => {
          if (!valid) return;
          const { code, message: msg } = await savePlaylist(
            options.props.formInline
          );
          if (code !== 0) {
            message(msg, { type: "error" });
            return;
          }
          message("保存成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  async function handleDelete(row) {
    const { code, message: msg } = await deletePlaylist({ id: row.id });
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
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}
