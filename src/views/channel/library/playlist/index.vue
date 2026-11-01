<script setup lang="ts">
import dayjs from "dayjs";
import { h, reactive, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { useUserStoreHook } from "@/store/modules/user";
import {
  deletePlaylist,
  getPlaylistList,
  getTagOptions,
  savePlaylist
} from "@/api/channel";
import { useListPage } from "../utils/list";
import { useSongActions } from "../utils/actions";
import PlaylistForm from "../components/PlaylistForm.vue";
import { sureCancelButtons } from "../utils/dialog";

const formRef = ref();
const editFormRef = ref();
const form = reactive({
  name: "",
  tag: "",
  createTime: []
});

const {
  dataList,
  loading,
  pagination,
  onSearch,
  handleSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange,
  refreshAfterRemove
} = useListPage(form, getPlaylistList);
const { goPlaylistDetail } = useSongActions();

const columns: TableColumnList = [
  { label: "封面", slot: "cover", width: 100 },
  { label: "歌单名称", slot: "name", minWidth: 180 },
  { label: "歌单标签", slot: "tags", minWidth: 200 },
  { label: "歌曲数量", prop: "songCount", minWidth: 90 },
  { label: "创建信息", slot: "creator", minWidth: 220 },
  { label: "歌单权重", prop: "weight", minWidth: 90 },
  { label: "操作", fixed: "right", width: 140, slot: "operation" }
];

async function openDialog(row?) {
  const { code, message: msg, data } = await getTagOptions();
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  addDialog({
    title: row ? "编辑歌单" : "创建歌单",
    width: "500px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: {
        id: row?.id,
        cover: row?.cover ?? "",
        name: row?.name ?? "",
        tags: [...(row?.tags ?? [])],
        weight: row?.weight ?? 0,
        reason: row?.reason ?? ""
      }
    },
    contentRenderer: () =>
      h(PlaylistForm, {
        ref: editFormRef,
        formInline: null,
        hotTags: data.hotTags,
        recentTags: data.recentTags
      }),
    beforeSure: (done, { options }) => {
      editFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const result = await savePlaylist({
          ...(options.props.formInline as object),
          creator: useUserStoreHook().nickname
        });
        if (result.code !== 0) {
          message(result.message, { type: "error" });
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
  refreshAfterRemove();
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
      <el-form-item label="歌单名称:" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入歌单名称"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="歌单标签:" prop="tag">
        <el-input
          v-model="form.tag"
          placeholder="请输入歌单标签"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="创建时间:" prop="createTime">
        <el-date-picker
          v-model="form.createTime"
          type="daterange"
          value-format="x"
          start-placeholder="请选择"
          end-placeholder="请选择"
          class="w-full!"
        />
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

    <div class="mb-4">
      <el-button type="primary" @click="openDialog()">新增</el-button>
    </div>

    <pure-table
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
      @page-size-change="handleSizeChange"
      @page-current-change="handleCurrentChange"
    >
      <template #cover="{ row }">
        <el-image
          v-if="row.cover"
          :src="row.cover"
          fit="cover"
          class="size-15"
        />
        <div v-else class="size-15 flex-c bg-gray-100">-</div>
      </template>
      <template #name="{ row }">
        <div class="text-left">
          <div>{{ row.name }}</div>
          <div class="text-gray-500 text-sm">{{ row.reason }}</div>
        </div>
      </template>
      <template #tags="{ row }">
        <div class="flex flex-wrap gap-1">
          <el-tag v-for="tag in row.tags" :key="tag">{{ tag }}</el-tag>
        </div>
      </template>
      <template #creator="{ row }">
        <div class="text-left">
          <div>创建人:{{ row.creator || "-" }}</div>
          <div>
            创建时间：{{ dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss") }}
          </div>
        </div>
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" @click="goPlaylistDetail(row)">
          查看
        </el-button>
        <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
        <el-popconfirm
          :title="`确认删除 ${row.name} 吗？`"
          @confirm="handleDelete(row)"
        >
          <template #reference>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </pure-table>
  </div>
</template>

<style lang="scss" src="../utils/search.scss"></style>
