import type { PaginationProps } from "@pureadmin/table";
import { onMounted, reactive, ref } from "vue";

/** 列表页通用的查询、分页和勾选逻辑 */
export function useListPage(
  form: object,
  fetchList: (params: object) => Promise<any>,
  onLoaded?: (data: any) => void
) {
  const tableRef = ref();
  const dataList = ref([]);
  const selected = ref([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await fetchList({
        ...form,
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage
      });
      dataList.value = data?.list ?? [];
      pagination.total = data?.total ?? 0;
      onLoaded?.(data);
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

  function handleSelectionChange(rows: any[]) {
    selected.value = rows;
  }

  function clearSelection() {
    tableRef.value?.getTableRef()?.clearSelection();
  }

  /** 删除数据后刷新，当前页被删空时回到上一页 */
  function refreshAfterRemove(count = 1) {
    clearSelection();
    if (dataList.value.length <= count && pagination.currentPage > 1) {
      pagination.currentPage -= 1;
    }
    onSearch();
  }

  onMounted(onSearch);

  return {
    tableRef,
    dataList,
    selected,
    loading,
    pagination,
    onSearch,
    handleSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    refreshAfterRemove,
    clearSelection
  };
}
