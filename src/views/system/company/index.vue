<script setup lang="ts">
import { h, reactive, ref } from "vue";
import dayjs from "dayjs";
import { message } from "@/utils/message";
import { hasPerms } from "@/utils/auth";
import { addDialog } from "@/components/ReDialog";
import {
  deleteCompany,
  getCompanyList,
  saveCompany,
  updateCompanyStatus
} from "@/api/company";
import { useListPage } from "@/views/channel/library/utils/list";
import { sureCancelButtons } from "@/views/channel/library/utils/dialog";
import EditForm from "./EditForm.vue";
import MembersDialog from "./MembersDialog.vue";
import { CHANNEL_TYPES } from "./types";

defineOptions({
  name: "SystemCompany"
});

const formRef = ref();
const editFormRef = ref();
const form = reactive({ name: "", type: "", status: "" });
const canWrite = hasPerms("company:write");

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
} = useListPage(form, getCompanyList);

const columns: TableColumnList = [
  { label: "编号", prop: "id", width: 80 },
  { label: "频道名称", prop: "name", minWidth: 150 },
  {
    label: "类型",
    prop: "type",
    width: 90,
    formatter: ({ type }) => typeLabel(type)
  },
  { label: "成员数", prop: "memberCount", width: 90 },
  { label: "歌曲数", prop: "songCount", width: 90 },
  { label: "客户数", prop: "customerCount", width: 90 },
  { label: "状态", slot: "status", width: 100 },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 170,
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  },
  { label: "操作", fixed: "right", width: 170, slot: "operation" }
];

const typeLabel = (value: string) =>
  CHANNEL_TYPES.find(item => item.value === value)?.label ?? value;

const errorText = (error: any) => error?.response?.data?.message ?? "操作失败";

function openDialog(row?) {
  addDialog({
    title: row ? "编辑" : "新增",
    width: "460px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: {
        id: row?.id,
        name: row?.name ?? "",
        type: row?.type ?? "company"
      }
    },
    contentRenderer: () => h(EditForm, { ref: editFormRef, formInline: null }),
    beforeSure: (done, { options }) => {
      editFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        try {
          const result = await saveCompany(options.props.formInline as object);
          if (result.code !== 0) {
            message(result.message, { type: "error" });
            return;
          }
          message("保存成功", { type: "success" });
          done();
          onSearch();
        } catch (error) {
          message(errorText(error), { type: "error" });
        }
      });
    }
  });
}

function openMembers(row) {
  addDialog({
    title: `${row.name} 的成员`,
    width: "680px",
    draggable: true,
    hideFooter: true,
    contentRenderer: () => h(MembersDialog, { companyId: row.id }),
    closeCallBack: () => onSearch()
  });
}

async function onStatusChange(row, value: boolean) {
  const status = value ? "active" : "disabled";
  try {
    const result = await updateCompanyStatus({ id: row.id, status });
    if (result.code !== 0) {
      message(result.message, { type: "error" });
      return;
    }
    row.status = status;
    message("修改成功", { type: "success" });
  } catch (error) {
    message(errorText(error), { type: "error" });
  }
}

async function handleDelete(row) {
  try {
    const { code, message: text } = await deleteCompany({ id: row.id });
    if (code !== 0) {
      message(text, { type: "error" });
      return;
    }
    message("删除成功", { type: "success" });
    refreshAfterRemove();
  } catch (error) {
    message(errorText(error), { type: "error" });
  }
}
</script>

<template>
  <div class="main bg-bg_color m-6! p-5">
    <el-form ref="formRef" :inline="true" :model="form">
      <el-form-item label="频道名称：" prop="name">
        <el-input
          v-model="form.name"
          clearable
          placeholder="请输入频道名称"
          class="w-45!"
        />
      </el-form-item>
      <el-form-item label="类型：" prop="type">
        <el-select
          v-model="form.type"
          clearable
          placeholder="请选择"
          class="w-35!"
        >
          <el-option
            v-for="item in CHANNEL_TYPES"
            :key="item.value"
            v-bind="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          clearable
          placeholder="请选择"
          class="w-35!"
        >
          <el-option label="正常" value="active" />
          <el-option label="已停用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetForm(formRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <div v-if="canWrite" class="mb-4">
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
      <template #status="{ row }">
        <el-switch
          :model-value="row.status === 'active'"
          :disabled="!canWrite"
          inline-prompt
          active-text="正常"
          inactive-text="停用"
          @change="value => onStatusChange(row, value as boolean)"
        />
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" @click="openMembers(row)"
          >成员</el-button
        >
        <template v-if="canWrite">
          <el-button link type="primary" @click="openDialog(row)">
            编辑
          </el-button>
          <el-popconfirm
            :title="`确认删除 ${row.name} 吗？`"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </template>
    </pure-table>
  </div>
</template>
