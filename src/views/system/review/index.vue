<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import dayjs from "dayjs";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { hasPerms } from "@/utils/auth";
import {
  approveSongs,
  getReviewChannels,
  getReviewList,
  rejectSong
} from "@/api/review";
import { useListPage } from "@/views/channel/library/utils/list";
import ReviewProgress from "@/views/channel/library/components/ReviewProgress.vue";

defineOptions({
  name: "SystemReview"
});

const formRef = ref();
const form = reactive({ name: "", channelId: "", reviewStatus: "pending" });
const channels = ref([]);
const canWrite = hasPerms("review:write");

const {
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
  clearSelection
} = useListPage(form, getReviewList);

const formatTime = (value?: string) =>
  value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-";

const columns: TableColumnList = [
  {
    type: "selection",
    width: 50,
    label: "勾选列",
    selectable: row => row.reviewStatus === "pending"
  },
  { label: "所属频道", prop: "channelName", minWidth: 120 },
  { label: "封面", slot: "cover", width: 80 },
  { label: "歌曲名称", prop: "name", minWidth: 140 },
  { label: "词作者", prop: "lyricist", minWidth: 100 },
  { label: "曲作者", prop: "composer", minWidth: 100 },
  { label: "音频", slot: "audio", width: 260 },
  { label: "歌词", slot: "lyrics", width: 90 },
  { label: "状态", slot: "status", width: 230 },
  {
    label: "提交时间",
    prop: "submitTime",
    minWidth: 170,
    formatter: ({ submitTime }) => formatTime(submitTime)
  },
  { label: "操作", fixed: "right", width: 110, slot: "operation" }
];

const errorText = (error: any) => error?.response?.data?.message ?? "操作失败";

function openLyrics(row) {
  ElMessageBox.alert(row.lyrics || "暂无歌词", `${row.name} 歌词`, {
    customStyle: { whiteSpace: "pre-wrap" },
    confirmButtonText: "关闭"
  });
}

async function handleApprove(ids: number[]) {
  try {
    const { code, message: text } = await approveSongs({ ids });
    if (code !== 0) {
      message(text, { type: "error" });
      return;
    }
    message("审核通过", { type: "success" });
    clearSelection();
    onSearch();
  } catch (error) {
    message(errorText(error), { type: "error" });
  }
}

async function handleReject(row) {
  let reason = "";
  try {
    const result = await ElMessageBox.prompt("请输入拒绝原因", "拒绝", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "textarea",
      inputValidator: value =>
        (value?.trim().length > 0 && value.trim().length <= 200) ||
        "请输入 1-200 字的拒绝原因"
    });
    reason = (result as { value: string }).value;
  } catch {
    return;
  }
  try {
    const { code, message: text } = await rejectSong({ id: row.id, reason });
    if (code !== 0) {
      message(text, { type: "error" });
      return;
    }
    message("已拒绝", { type: "success" });
    onSearch();
  } catch (error) {
    message(errorText(error), { type: "error" });
  }
}

onMounted(async () => {
  const { data } = await getReviewChannels();
  channels.value = data ?? [];
});
</script>

<template>
  <div class="main bg-bg_color m-6! p-5">
    <el-form ref="formRef" :inline="true" :model="form">
      <el-form-item label="歌曲名称：" prop="name">
        <el-input
          v-model="form.name"
          clearable
          placeholder="请输入歌曲名称"
          class="w-45!"
        />
      </el-form-item>
      <el-form-item label="所属频道：" prop="channelId">
        <el-select
          v-model="form.channelId"
          clearable
          filterable
          placeholder="请选择"
          class="w-45!"
        >
          <el-option
            v-for="item in channels"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核情况：" prop="reviewStatus">
        <el-select
          v-model="form.reviewStatus"
          clearable
          placeholder="全部"
          class="w-35!"
        >
          <el-option label="待平台审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetForm(formRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <div v-if="canWrite" class="mb-4">
      <el-button
        type="primary"
        :disabled="!selected.length"
        @click="handleApprove(selected.map(item => item.id))"
      >
        批量通过
      </el-button>
    </div>
    <pure-table
      ref="tableRef"
      row-key="id"
      align-whole="left"
      border
      stripe
      table-layout="fixed"
      :loading="loading"
      :data="dataList"
      :columns="columns"
      :pagination="pagination"
      :header-cell-style="{
        background: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-primary)'
      }"
      @selection-change="handleSelectionChange"
      @page-size-change="handleSizeChange"
      @page-current-change="handleCurrentChange"
    >
      <template #cover="{ row }">
        <el-image
          v-if="row.cover"
          :src="row.cover"
          :preview-src-list="[row.cover]"
          preview-teleported
          fit="cover"
          class="size-12 rounded-sm"
        />
        <span v-else>-</span>
      </template>
      <template #audio="{ row }">
        <audio :src="row.audioUrl" controls preload="none" class="w-full" />
      </template>
      <template #lyrics="{ row }">
        <el-button link type="primary" @click="openLyrics(row)">查看</el-button>
      </template>
      <template #status="{ row }">
        <ReviewProgress :row="row" />
      </template>
      <template #operation="{ row }">
        <template v-if="canWrite && row.reviewStatus === 'pending'">
          <el-button link type="primary" @click="handleApprove([row.id])">
            通过
          </el-button>
          <el-button link type="danger" @click="handleReject(row)">
            拒绝
          </el-button>
        </template>
        <span v-else>-</span>
      </template>
    </pure-table>
  </div>
</template>
