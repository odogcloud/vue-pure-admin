<script setup lang="ts">
import dayjs from "dayjs";
import { h, reactive, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";
import AddFill from "~icons/ri/add-circle-line";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  deleteRole,
  getPermissionOptions,
  getRoleList,
  saveRole,
  setRolePermissions
} from "@/api/role";
import { useListPage } from "../library/utils/list";
import EditForm from "./EditForm.vue";
import PermissionForm from "./PermissionForm.vue";

defineOptions({
  name: "ChannelRole"
});

const formRef = ref();
const editFormRef = ref();
const form = reactive({ name: "" });

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
} = useListPage(form, getRoleList);

const columns: TableColumnList = [
  { label: "角色名称", prop: "name", minWidth: 140 },
  { label: "备注", prop: "remark", minWidth: 160 },
  { label: "成员人数", prop: "memberCount", minWidth: 100 },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 170,
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  },
  { label: "操作", fixed: "right", width: 180, slot: "operation" }
];

function openDialog(row?) {
  addDialog({
    title: row ? "修改角色" : "新增角色",
    width: "500px",
    draggable: true,
    closeOnClickModal: false,
    props: {
      formInline: {
        id: row?.id,
        name: row?.name ?? "",
        remark: row?.remark ?? ""
      }
    },
    contentRenderer: () => h(EditForm, { ref: editFormRef, formInline: null }),
    beforeSure: (done, { options }) => {
      editFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const result = await saveRole(options.props.formInline as object);
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

async function openPermissions(row) {
  const { code, message: msg, data } = await getPermissionOptions();
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  addDialog({
    title: `权限：${row.name}`,
    width: "500px",
    draggable: true,
    closeOnClickModal: false,
    props: {
      formInline: { permissions: [...row.permissions] }
    },
    contentRenderer: () =>
      h(PermissionForm, { formInline: null, groups: data }),
    beforeSure: async (done, { options }) => {
      const { permissions } = options.props.formInline as {
        permissions: string[];
      };
      const result = await setRolePermissions({ id: row.id, permissions });
      if (result.code !== 0) {
        message(result.message, { type: "error" });
        return;
      }
      message("权限已更新", { type: "success" });
      done();
      onSearch();
    }
  });
}

async function handleDelete(row) {
  const { code, message: msg } = await deleteRole({ id: row.id });
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  message("删除成功", { type: "success" });
  refreshAfterRemove();
}
</script>

<template>
  <div class="main m-6!">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="bg-bg_color pl-8 pt-3 mb-2"
    >
      <el-form-item label="角色名称：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入角色名称"
          clearable
          class="w-45!"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="handleSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="" :columns="columns" @refresh="onSearch">
      <template #title>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增角色
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          row-key="id"
          align-whole="center"
          showOverflowTooltip
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <template v-if="!row.isDefault">
              <el-button link type="primary" @click="openDialog(row)">
                修改
              </el-button>
              <el-button link type="primary" @click="openPermissions(row)">
                权限
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
      </template>
    </PureTableBar>
  </div>
</template>
