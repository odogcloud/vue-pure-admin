<script setup lang="ts">
import { h, reactive, ref } from "vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { deleteNotify, getNotifyList, saveNotify } from "@/api/notify";
import { useListPage } from "../library/utils/list";
import { sureCancelButtons } from "../library/utils/dialog";
import EditForm from "./EditForm.vue";
import { NOTIFY_TYPES } from "./types";
import { useAllChannels } from "../library/utils/allChannels";

defineOptions({
  name: "ChannelNotify"
});

const editFormRef = ref();
const form = reactive({});

const { onLoaded, canOperate, channelColumn } = useAllChannels();

const {
  dataList,
  loading,
  pagination,
  onSearch,
  handleSizeChange,
  handleCurrentChange,
  refreshAfterRemove
} = useListPage(form, getNotifyList, onLoaded);

const columns: TableColumnList = [
  channelColumn,
  { label: "姓名", prop: "name", minWidth: 120 },
  { label: "邮箱", prop: "email", minWidth: 180 },
  { label: "提醒类型", slot: "types", minWidth: 280 },
  { label: "操作", fixed: "right", width: 120, slot: "operation" }
];

const typeLabel = (value: string) =>
  NOTIFY_TYPES.find(item => item.value === value)?.label ?? value;

function openDialog(row?) {
  addDialog({
    title: row ? "编辑" : "新增",
    width: "500px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: {
        id: row?.id,
        name: row?.name ?? "",
        email: row?.email ?? "",
        types: [...(row?.types ?? [])]
      }
    },
    contentRenderer: () => h(EditForm, { ref: editFormRef, formInline: null }),
    beforeSure: (done, { options }) => {
      editFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const result = await saveNotify(options.props.formInline as object);
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
  const { code, message: msg } = await deleteNotify({ id: row.id });
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  message("删除成功", { type: "success" });
  refreshAfterRemove();
}
</script>

<template>
  <div class="main bg-bg_color m-6! p-5">
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
      <template #types="{ row }">
        <div class="flex flex-wrap gap-1">
          <el-tag v-for="type in row.types" :key="type">
            {{ typeLabel(type) }}
          </el-tag>
        </div>
      </template>
      <template #operation="{ row }">
        <template v-if="canOperate(row)">
          <el-button link type="primary" @click="openDialog(row)"
            >编辑</el-button
          >
          <el-popconfirm
            :title="`确认删除 ${row.name} 吗？`"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
        <span v-else>-</span>
      </template>
    </pure-table>
  </div>
</template>
