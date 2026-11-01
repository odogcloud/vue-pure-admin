<script setup lang="ts">
import dayjs from "dayjs";
import { reactive } from "vue";
import { getCustomerFavorites } from "@/api/stats";
import { useListPage } from "../library/utils/list";

const props = defineProps<{ customerId: number }>();

const form = reactive({ customerId: props.customerId });
const { dataList, loading, pagination, handleSizeChange, handleCurrentChange } =
  useListPage(form, getCustomerFavorites);

const columns: TableColumnList = [
  { label: "歌曲", prop: "name", minWidth: 200 },
  {
    label: "收藏时间",
    prop: "createTime",
    minWidth: 170,
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  }
];
</script>

<template>
  <pure-table
    row-key="songId"
    align-whole="left"
    border
    stripe
    :loading="loading"
    :data="dataList"
    :columns="columns"
    :pagination="pagination"
    :header-cell-style="{
      background: 'var(--el-fill-color-light)',
      color: 'var(--el-text-color-primary)'
    }"
    @page-size-change="handleSizeChange"
    @page-current-change="handleCurrentChange"
  />
</template>
