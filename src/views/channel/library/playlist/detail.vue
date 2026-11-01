<script setup lang="ts">
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { utils, writeFile } from "xlsx";
import { ElMessageBox } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import {
  getPlaylistSongs,
  removePlaylistSongs,
  updatePlaylistSongWeight
} from "@/api/channel";
import { useListPage } from "../utils/list";
import { useSongActions } from "../utils/actions";
import { releasedOptions, statusOptions, statusText } from "../utils/constants";
import SongCell from "../components/SongCell.vue";
import ContactCell from "../components/ContactCell.vue";
import WeightForm from "../components/WeightForm.vue";
import { sureCancelButtons } from "../utils/dialog";

defineOptions({
  name: "ChannelPlaylistDetail"
});

const route = useRoute();
const router = useRouter();
const playlistId = Number(route.params.id);
const formRef = ref();
const playlistName = ref("");
const form = reactive({
  id: playlistId,
  name: "",
  lyricist: "",
  composer: "",
  released: "",
  tag: "",
  reason: "",
  contact: "",
  status: ""
});

const {
  tableRef,
  dataList,
  selected,
  loading,
  pagination,
  onSearch,
  handleSearch,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  refreshAfterRemove,
  clearSelection
} = useListPage(form, getPlaylistSongs, data => {
  playlistName.value = data?.playlistName ?? "";
});
const { goEdit, openLyrics, openCollect } = useSongActions();

const columns: TableColumnList = [
  { type: "selection", width: 50, label: "勾选列" },
  { label: "作品", slot: "song", width: 170 },
  {
    label: "歌曲价格",
    prop: "price",
    width: 100,
    formatter: ({ price }) => (price ? price.toLocaleString() : "-")
  },
  { label: "推荐权重", prop: "weight", width: 100, sortable: true },
  { label: "自定义标签", slot: "tags", width: 140 },
  {
    label: "歌曲推荐理由",
    prop: "reason",
    width: 140,
    formatter: ({ reason }) => reason || "-"
  },
  { label: "音频", slot: "audio", width: 170 },
  { label: "歌词", slot: "lyrics", width: 100 },
  { label: "确权联系人", slot: "contact", width: 170 },
  {
    label: "状态",
    prop: "status",
    width: 100,
    formatter: ({ status }) => statusText(status)
  },
  {
    label: "加入时间",
    prop: "createTime",
    width: 110,
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  },
  { label: "操作", fixed: "right", width: 120, slot: "operation" }
];

function goBack() {
  router.push({ name: "ChannelLibrary", query: { tab: "playlist" } });
}

function resetFilters() {
  formRef.value?.resetFields();
  form.id = playlistId;
  handleSearch();
}

function openWeight(row) {
  addDialog({
    title: "修改",
    width: "500px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: { weight: row.weight }
    },
    contentRenderer: () => h(WeightForm, { formInline: null }),
    beforeSure: async (done, { options }) => {
      const { weight } = options.props.formInline as { weight: number };
      const { code, message: msg } = await updatePlaylistSongWeight({
        id: playlistId,
        songId: row.id,
        weight
      });
      if (code !== 0) {
        message(msg, { type: "error" });
        return;
      }
      message("修改成功", { type: "success" });
      done();
      onSearch();
    }
  });
}

async function removeRows(rows: any[]) {
  const names = rows.length === 1 ? rows[0].name : `${rows.length} 首歌曲`;
  try {
    await ElMessageBox.confirm(`确认取消收录 ${names} 吗？`, "提示", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    });
  } catch {
    return;
  }
  const { code, message: msg } = await removePlaylistSongs({
    id: playlistId,
    ids: rows.map(item => item.id)
  });
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  message("取消收录成功", { type: "success" });
  refreshAfterRemove(rows.length);
}

function collectToOther() {
  openCollect(
    selected.value.map(item => item.id),
    () => {
      clearSelection();
      onSearch();
    },
    { title: "收录到其他歌单", excludeId: playlistId }
  );
}

async function handleExport() {
  const {
    code,
    message: msg,
    data
  } = await getPlaylistSongs({
    ...form,
    pageSize: Math.max(pagination.total, 1),
    currentPage: 1
  });
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  const sheet = utils.json_to_sheet(
    data.list.map(row => ({
      作品名称: row.name,
      是否发行: row.released ? "已发行" : "未发行",
      词作者: row.lyricist,
      曲作者: row.composer,
      合作类型: row.cooperationTypes?.join("、"),
      歌曲价格: row.price ?? "",
      推荐权重: row.weight,
      自定义标签: row.tags?.join("、"),
      歌曲推荐理由: row.reason,
      确权联系人: `${row.contactName} ${row.contactPhone} ${row.contactEmail}`,
      状态: statusText(row.status),
      加入时间: dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
    }))
  );
  const book = utils.book_new();
  utils.book_append_sheet(book, sheet, "歌单歌曲");
  writeFile(book, `${playlistName.value || "歌单"}.xlsx`);
}

onMounted(() => {
  useMultiTagsStoreHook().handleTags("push", {
    path: "/channel/library/song-detail/:id",
    name: "ChannelPlaylistDetail",
    params: { id: String(route.params.id) },
    meta: { title: "歌单详情" }
  });
});
</script>

<template>
  <div class="main bg-bg_color m-6! p-5">
    <div class="flex items-center gap-2 mb-5 text-lg font-bold">
      <el-button link @click="goBack">&lt;</el-button>
      <span>歌单名称:</span>
      <span class="text-primary font-normal">{{ playlistName }}</span>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      label-width="110px"
      class="channel-search"
    >
      <el-form-item label="作品名称:" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入作品名称"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="词作者:" prop="lyricist">
        <el-input
          v-model="form.lyricist"
          placeholder="请输入词作者"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="曲作者:" prop="composer">
        <el-input
          v-model="form.composer"
          placeholder="请输入曲作者"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="是否发行:" prop="released">
        <el-select
          v-model="form.released"
          placeholder="请选择是否发行"
          clearable
          class="w-full!"
        >
          <el-option
            v-for="item in releasedOptions"
            :key="item.value"
            v-bind="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="歌曲标签:" prop="tag">
        <el-input
          v-model="form.tag"
          placeholder="请输入歌曲标签"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="歌曲推荐理由:" prop="reason">
        <el-input
          v-model="form.reason"
          placeholder="请输入歌曲推荐理由"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="确权联系人:" prop="contact">
        <el-input
          v-model="form.contact"
          placeholder="请输入确权联系人"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="作品状态:" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
          clearable
          class="w-full!"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            v-bind="item"
          />
        </el-select>
      </el-form-item>
      <div class="channel-search__actions">
        <el-button :icon="useRenderIcon(Refresh)" @click="resetFilters">
          重置
        </el-button>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="handleSearch"
        >
          搜索
        </el-button>
      </div>
    </el-form>

    <div class="mb-4">
      <el-button
        type="primary"
        :disabled="!selected.length"
        @click="removeRows(selected)"
      >
        取消收录
      </el-button>
      <el-button
        type="primary"
        :disabled="!selected.length"
        @click="collectToOther"
      >
        收录到其他歌单
      </el-button>
      <el-button type="primary" @click="handleExport">导出</el-button>
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
      <template #song="{ row }">
        <SongCell :row="row" />
      </template>
      <template #tags="{ row }">
        <div v-if="row.tags?.length" class="flex flex-wrap gap-1">
          <el-tag v-for="tag in row.tags" :key="tag">{{ tag }}</el-tag>
        </div>
        <span v-else>-</span>
      </template>
      <template #contact="{ row }">
        <ContactCell :row="row" />
      </template>
      <template #audio="{ row }">
        <audio :src="row.audioUrl" controls preload="none" class="w-full" />
      </template>
      <template #lyrics="{ row }">
        <el-button link type="primary" @click="openLyrics(row)">
          查看歌词
        </el-button>
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" @click="openWeight(row)">权重</el-button>
        <el-button link type="primary" @click="goEdit(row)">编辑</el-button>
        <el-button link type="primary" @click="removeRows([row])">
          取消收录
        </el-button>
      </template>
    </pure-table>
  </div>
</template>

<style lang="scss" src="../utils/search.scss"></style>
