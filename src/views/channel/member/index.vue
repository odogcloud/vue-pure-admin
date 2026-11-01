<script setup lang="ts">
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { hasPerms } from "@/utils/auth";
import {
  createMember,
  getMemberList,
  getRoleOptions,
  removeMember,
  updateMember
} from "@/api/member";
import { useListPage } from "../library/utils/list";
import { sureCancelButtons } from "../library/utils/dialog";
import AddForm from "./AddForm.vue";
import EditForm from "./EditForm.vue";
import { useAllChannels } from "../library/utils/allChannels";

defineOptions({
  name: "ChannelMember"
});

const STATUS_OPTIONS = [
  { label: "未激活", value: "pending" },
  { label: "正常", value: "active" },
  { label: "禁用", value: "disabled" }
];

const formRef = ref();
const addFormRef = ref();
const canWrite = hasPerms("member:write");
const roles = ref<Array<{ id: number; name: string; assignable: boolean }>>([]);
const form = reactive({
  name: "",
  roleId: "",
  phone: "",
  email: "",
  status: ""
});

const { onLoaded, canOperate, channelColumn } = useAllChannels();

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
} = useListPage(form, getMemberList, onLoaded);

const columns: TableColumnList = [
  channelColumn,
  {
    label: "用户名称",
    prop: "nickname",
    minWidth: 120,
    formatter: ({ nickname, username }) => nickname || username
  },
  {
    label: "用户角色",
    prop: "roleName",
    minWidth: 120,
    formatter: ({ roleName }) => roleName || "无"
  },
  { label: "联系方式", slot: "contact", minWidth: 170 },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 120,
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  },
  {
    label: "状态",
    prop: "status",
    minWidth: 90,
    formatter: ({ status }) =>
      STATUS_OPTIONS.find(item => item.value === status)?.label ?? "-"
  },
  { label: "操作", fixed: "right", width: 120, slot: "operation" }
];

async function loadRoles() {
  const { code, data } = await getRoleOptions();
  if (code === 0) roles.value = data;
}

const errorText = (error: any) => error?.response?.data?.message ?? "操作失败";

function openAdd() {
  addDialog({
    title: "添加成员",
    width: "520px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: {
        nickname: "",
        username: "",
        password: "",
        phone: "",
        email: "",
        accountType: "member",
        roleId: null
      }
    },
    contentRenderer: () =>
      h(AddForm, { ref: addFormRef, formInline: null, roles: roles.value }),
    beforeSure: (done, { options }) => {
      addFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const data = options.props.formInline as { roleId: number | null };
        try {
          const result = await createMember({
            ...data,
            roleId: data.roleId || null
          });
          if (result.code !== 0) {
            message(result.message, { type: "error" });
            return;
          }
          message("添加成功", { type: "success" });
          done();
          onSearch();
        } catch (error) {
          message(errorText(error), { type: "error" });
        }
      });
    }
  });
}

async function handleRemove(row) {
  try {
    const { code, message: text } = await removeMember({ id: row.id });
    if (code !== 0) {
      message(text, { type: "error" });
      return;
    }
    message("移除成功", { type: "success" });
    refreshAfterRemove();
  } catch (error) {
    message(errorText(error), { type: "error" });
  }
}

function openEdit(row) {
  addDialog({
    title: "编辑",
    width: "400px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: { roleId: row.roleId ?? "none" }
    },
    contentRenderer: () =>
      h(EditForm, {
        formInline: null,
        memberName: row.nickname || row.username,
        roles: roles.value
      }),
    beforeSure: async (done, { options }) => {
      const { roleId } = options.props.formInline as {
        roleId: number | "none";
      };
      const result = await updateMember({
        id: row.id,
        roleId: roleId === "none" ? null : roleId
      });
      if (result.code !== 0) {
        message(result.message, { type: "error" });
        return;
      }
      message("修改成功", { type: "success" });
      done();
      onSearch();
    }
  });
}

onMounted(loadRoles);
</script>

<template>
  <div class="main m-6!">
    <div class="bg-bg_color p-5 mb-4">
      <el-form
        ref="formRef"
        :model="form"
        label-width="90px"
        class="channel-search"
      >
        <el-form-item label="用户名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入用户名称"
            clearable
            class="w-full!"
          />
        </el-form-item>
        <el-form-item label="用户角色" prop="roleId">
          <el-select
            v-model="form.roleId"
            placeholder="请选择用户角色"
            clearable
            class="w-full!"
          >
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="String(item.id)"
            />
            <el-option label="无" value="none" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号码"
            clearable
            class="w-full!"
          />
        </el-form-item>
        <el-form-item label="登录邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
            clearable
            class="w-full!"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择状态"
            clearable
            class="w-full!"
          >
            <el-option
              v-for="item in STATUS_OPTIONS"
              :key="item.value"
              v-bind="item"
            />
          </el-select>
        </el-form-item>
        <div class="channel-search__actions">
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
        </div>
      </el-form>
    </div>

    <div class="bg-bg_color p-5">
      <div v-if="canWrite" class="mb-4">
        <el-button type="primary" @click="openAdd">添加成员</el-button>
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
        <template #contact="{ row }">
          <div v-if="row.phone">{{ row.phone }}</div>
          <div v-if="row.email">{{ row.email }}</div>
          <span v-if="!row.phone && !row.email">-</span>
        </template>
        <template #operation="{ row }">
          <template v-if="canOperate(row)">
            <template v-if="canWrite">
              <el-button link type="primary" @click="openEdit(row)">
                编辑
              </el-button>
              <el-popconfirm
                :title="`确认将 ${row.nickname || row.username} 移出公司吗？`"
                @confirm="handleRemove(row)"
              >
                <template #reference>
                  <el-button link type="danger">移除</el-button>
                </template>
              </el-popconfirm>
            </template>
            <span v-else>-</span>
          </template>
          <span v-else>-</span>
        </template>
      </pure-table>
    </div>
  </div>
</template>

<style lang="scss" src="../library/utils/search.scss"></style>
