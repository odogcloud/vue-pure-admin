<script setup lang="ts">
import dayjs from "dayjs";
import { computed, h, reactive, ref, watch } from "vue";
import { addDialog } from "@/components/ReDialog";
import { getCustomerStats, getMemberStats } from "@/api/stats";
import { useListPage } from "../library/utils/list";
import Favorites from "./Favorites.vue";
import { formatSeconds } from "./utils";

const props = defineProps<{ type: "customer" | "member" }>();

const period = ref<"today" | "week" | "custom">("today");
const customRange = ref<[string, string]>([
  dayjs().subtract(30, "day").format("YYYY-MM-DD"),
  dayjs().format("YYYY-MM-DD")
]);
const editingRange = ref(false);
const summary = ref({ people: 0, avgCount: 0, avgSeconds: 0 });

function currentRange() {
  const end = dayjs().add(1, "day").startOf("day");
  if (period.value === "week") {
    return { start: end.subtract(7, "day").valueOf(), end: end.valueOf() };
  }
  if (period.value === "custom" && customRange.value) {
    return {
      start: dayjs(customRange.value[0]).startOf("day").valueOf(),
      end: dayjs(customRange.value[1]).add(1, "day").startOf("day").valueOf()
    };
  }
  return { start: dayjs().startOf("day").valueOf(), end: end.valueOf() };
}

const form = reactive(currentRange());

const {
  dataList,
  loading,
  pagination,
  handleSearch,
  handleSizeChange,
  handleCurrentChange
} = useListPage(
  form,
  props.type === "customer" ? getCustomerStats : getMemberStats,
  data => {
    if (data?.summary) summary.value = data.summary;
  }
);

const rankOf = (index: number) =>
  (pagination.currentPage - 1) * pagination.pageSize + index + 1;

const columns = computed<TableColumnList>(() => {
  const common: TableColumnList = [
    { label: "听歌排名", slot: "rank", width: 110 },
    {
      label: props.type === "customer" ? "客户名称" : "频道用户",
      prop: "name",
      minWidth: 150
    },
    { label: "听歌数量", prop: "plays", minWidth: 100 },
    {
      label: "听歌时长",
      prop: "seconds",
      minWidth: 130,
      formatter: ({ seconds }) => formatSeconds(seconds)
    }
  ];
  if (props.type === "customer") {
    return [
      ...common,
      { label: "收藏歌曲", prop: "favorites", minWidth: 100 },
      { label: "操作", fixed: "right", width: 110, slot: "operation" }
    ];
  }
  return [
    ...common,
    { label: "歌曲加入频道曲库", prop: "added", minWidth: 160 },
    { label: "歌曲打标签&传视频", prop: "edited", minWidth: 170 }
  ];
});

watch([period, customRange], () => {
  editingRange.value = false;
  Object.assign(form, currentRange());
  handleSearch();
});

function openFavorites(row) {
  addDialog({
    title: row.name,
    width: "640px",
    draggable: true,
    hideFooter: true,
    contentRenderer: () => h(Favorites, { customerId: row.id })
  });
}
</script>

<template>
  <div>
    <div class="flex-c mb-4">
      <el-tabs v-model="period" class="stats-period">
        <el-tab-pane label="今日" name="today" />
        <el-tab-pane label="近7天" name="week" />
        <el-tab-pane label="自定义" name="custom" />
      </el-tabs>
    </div>
    <div v-if="period === 'custom'" class="flex-c mb-4 gap-2">
      <el-date-picker
        v-if="editingRange"
        v-model="customRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        :clearable="false"
        start-placeholder="请选择"
        end-placeholder="请选择"
      />
      <template v-else>
        <span>{{ customRange[0] }} ~ {{ customRange[1] }}</span>
        <el-button link type="primary" @click="editingRange = true">
          编辑
        </el-button>
      </template>
    </div>

    <div class="stats-summary mb-6">
      <div>
        <p>听歌人数</p>
        <b>{{ summary.people }}人</b>
      </div>
      <div>
        <p>平均听歌数量</p>
        <b>{{ summary.avgCount }}首</b>
      </div>
      <div>
        <p>平均听歌时长</p>
        <b>{{ formatSeconds(summary.avgSeconds) }}</b>
      </div>
    </div>

    <pure-table
      row-key="id"
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
    >
      <template #rank="{ $index }">
        {{ rankOf($index) }}
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" @click="openFavorites(row)">
          查看收藏
        </el-button>
      </template>
    </pure-table>
  </div>
</template>

<style lang="scss" scoped>
.stats-period {
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__content) {
    display: none;
  }
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 20px 0;
  text-align: center;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;

  > div + div {
    border-left: 1px solid var(--el-border-color-lighter);
  }

  p {
    margin-bottom: 4px;
  }
}
</style>
