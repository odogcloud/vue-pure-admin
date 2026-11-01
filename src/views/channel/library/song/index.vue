<script setup lang="ts">
import dayjs from "dayjs";
import { h, reactive, ref } from "vue";
import { read, utils } from "xlsx";
import { ElMessageBox } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  deleteSongs,
  getPlaylistOptions,
  getSongList,
  importSongs
} from "@/api/channel";
import { useListPage } from "../utils/list";
import { useSongActions } from "../utils/actions";
import {
  editedOptions,
  inPlaylistOptions,
  releasedOptions,
  statusOptions,
  statusText,
  submitTypeOptions,
  tagCascaderOptions
} from "../utils/constants";
import SongCell from "../components/SongCell.vue";
import ContactCell from "../components/ContactCell.vue";
import ImportForm from "../components/ImportForm.vue";
import { sureOnlyButtons } from "../utils/dialog";

const formRef = ref();
const importFormRef = ref();
const form = reactive({
  name: "",
  contact: "",
  submitType: "",
  released: "",
  tag: "",
  inPlaylist: "",
  edited: "",
  createTime: [],
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
  resetForm,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  refreshAfterRemove,
  clearSelection
} = useListPage(form, getSongList);
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
  { label: "确权联系人", slot: "contact", width: 170 },
  { label: "自定义标签", slot: "tags", width: 140 },
  {
    label: "歌曲推荐理由",
    prop: "reason",
    width: 140,
    formatter: ({ reason }) => reason || "-"
  },
  { label: "音频", slot: "audio", width: 170 },
  { label: "歌词", slot: "lyrics", width: 100 },
  {
    label: "是否收录歌单",
    prop: "inPlaylist",
    width: 100,
    formatter: ({ inPlaylist }) =>
      inPlaylist ? "已收录到歌单" : "未收录到歌单"
  },
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
  { label: "操作", fixed: "right", width: 100, slot: "operation" }
];

function afterCollect() {
  clearSelection();
  onSearch();
}

function collectSelected() {
  openCollect(
    selected.value.map(item => item.id),
    afterCollect
  );
}

async function removeSongs(rows: any[]) {
  const names = rows.length === 1 ? rows[0].name : `${rows.length} 首歌曲`;
  try {
    await ElMessageBox.confirm(`确认删除 ${names} 吗？`, "提示", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    });
  } catch {
    return;
  }
  const { code, message: msg } = await deleteSongs({
    ids: rows.map(item => item.id)
  });
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  message("删除成功", { type: "success" });
  refreshAfterRemove(rows.length);
}

function openCentralLibrary() {
  message("中央曲库尚未接入", { type: "info" });
}

async function openImport() {
  const { code, message: msg, data } = await getPlaylistOptions();
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  addDialog({
    title: "批量导入",
    width: "600px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureOnlyButtons,
    props: {
      formInline: { file: null, playlistId: null }
    },
    contentRenderer: () =>
      h(ImportForm, {
        ref: importFormRef,
        formInline: null,
        playlists: data.list
      }),
    beforeSure: (done, { options }) => {
      importFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const { file, playlistId } = options.props.formInline as {
          file: File;
          playlistId: number | null;
        };
        try {
          const book = read(await file.arrayBuffer());
          const sheet = book.Sheets[book.SheetNames[0]];
          const rows = utils
            .sheet_to_json<Record<string, unknown>>(sheet)
            .map(row => ({
              name: String(row["作品名称"] ?? "").trim(),
              lyricist: String(row["词作者"] ?? "").trim(),
              composer: String(row["曲作者"] ?? "").trim()
            }))
            .filter(row => row.name);
          const result = await importSongs({ rows, playlistId });
          if (result.code !== 0) {
            message(result.message, { type: "error" });
            return;
          }
          message(`成功导入 ${result.data.count} 首歌曲`, { type: "success" });
          done();
          handleSearch();
        } catch {
          message("文件解析失败，请使用模版文件", { type: "error" });
        }
      });
    }
  });
}
</script>

<template>
  <div>
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
      <el-form-item label="确权联系人:" prop="contact">
        <el-input
          v-model="form.contact"
          placeholder="请输入确权联系人"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="提交用户类型:" prop="submitType">
        <el-select
          v-model="form.submitType"
          placeholder="请选择提交用户类型"
          clearable
          class="w-full!"
        >
          <el-option
            v-for="item in submitTypeOptions"
            :key="item.value"
            v-bind="item"
          />
        </el-select>
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
        <el-cascader
          v-model="form.tag"
          :options="tagCascaderOptions"
          :props="{ emitPath: false }"
          filterable
          clearable
          placeholder="请输入歌曲标签"
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="是否收录歌单:" prop="inPlaylist">
        <el-select
          v-model="form.inPlaylist"
          placeholder="请选择是否收录歌单"
          clearable
          class="w-full!"
        >
          <el-option
            v-for="item in inPlaylistOptions"
            :key="item.value"
            v-bind="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否已编辑:" prop="edited">
        <el-select
          v-model="form.edited"
          placeholder="请选择是否已编辑"
          clearable
          class="w-full!"
        >
          <el-option
            v-for="item in editedOptions"
            :key="item.value"
            v-bind="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="加入时间:" prop="createTime">
        <el-date-picker
          v-model="form.createTime"
          type="daterange"
          value-format="x"
          start-placeholder="请选择"
          end-placeholder="请选择"
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
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
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

    <div class="flex justify-between mb-4">
      <div>
        <el-button type="primary" @click="openCentralLibrary">
          中央曲库-选歌
        </el-button>
        <el-button type="primary" @click="openImport">批量导入</el-button>
      </div>
      <div>
        <el-button
          type="primary"
          plain
          :disabled="!selected.length"
          @click="collectSelected"
        >
          收录到歌单
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="!selected.length"
          @click="removeSongs(selected)"
        >
          删除
        </el-button>
      </div>
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
        <div class="flex flex-col items-center gap-1">
          <el-button link type="primary" @click="goEdit(row)">编辑</el-button>
          <el-button
            link
            type="primary"
            class="ml-0!"
            @click="openCollect([row.id], afterCollect)"
          >
            收录到歌单
          </el-button>
          <el-button
            link
            type="danger"
            class="ml-0!"
            @click="removeSongs([row])"
          >
            删除
          </el-button>
        </div>
      </template>
    </pure-table>
  </div>
</template>

<style lang="scss" src="../utils/search.scss"></style>
