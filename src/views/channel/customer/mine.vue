<script setup lang="ts">
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";
import Plus from "~icons/ep/plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getPlaylistOptions } from "@/api/channel";
import {
  addCustomer,
  getCustomerList,
  removeCustomers,
  updateCustomer
} from "@/api/customer";
import { useListPage } from "../library/utils/list";
import { sureCancelButtons } from "../library/utils/dialog";
import AddForm from "./components/AddForm.vue";
import EditForm from "./components/EditForm.vue";

const formRef = ref();
const dialogFormRef = ref();
const playlists = ref<Array<{ id: number; name: string }>>([]);
const form = reactive({
  name: "",
  phone: "",
  email: "",
  permission: "",
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
  refreshAfterRemove
} = useListPage(form, getCustomerList);

const columns: TableColumnList = [
  { type: "selection", width: 50, label: "勾选列" },
  { label: "客户名称", slot: "name", minWidth: 130 },
  { label: "客户联系方式", slot: "contact", minWidth: 170 },
  { label: "客户权限", slot: "permission", minWidth: 150 },
  {
    label: "合作类型",
    prop: "showCooperation",
    minWidth: 120,
    formatter: ({ showCooperation }) =>
      showCooperation ? "显示合作类型" : "不显示合作类型"
  },
  {
    label: "价格显示",
    prop: "showPrice",
    minWidth: 120,
    formatter: ({ showPrice }) =>
      showPrice ? "显示歌曲价格" : "不显示歌曲价格"
  },
  {
    label: "添加客户时间",
    prop: "createTime",
    minWidth: 120,
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  },
  { label: "分享截止时间", prop: "expireDate", minWidth: 120 },
  {
    label: "状态",
    prop: "status",
    minWidth: 90,
    formatter: ({ status }) => (status === 1 ? "正常" : "已到期")
  },
  { label: "操作", fixed: "right", width: 100, slot: "operation" }
];

const permissionText = (row: any) => {
  if (row.scope === "all") return "全频道歌单/歌曲";
  return row.playlistNames?.join("、") || "无";
};

async function loadPlaylists() {
  const { code, data } = await getPlaylistOptions();
  if (code === 0) playlists.value = data.list;
}

function openAdd() {
  addDialog({
    title: "添加客户",
    width: "500px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: {
        customerId: null,
        scope: "all",
        playlistIds: [],
        showCooperation: 0,
        expireDate: ""
      }
    },
    contentRenderer: () =>
      h(AddForm, {
        ref: dialogFormRef,
        formInline: null,
        playlists: playlists.value
      }),
    beforeSure: (done, { options }) => {
      const values = options.props.formInline as { customerId: number | null };
      if (!values.customerId) {
        message("请先搜索并选择未添加的客户", { type: "warning" });
        return;
      }
      dialogFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const result = await addCustomer(values);
        if (result.code !== 0) {
          message(result.message, { type: "error" });
          return;
        }
        message("添加成功", { type: "success" });
        done();
        handleSearch();
      });
    }
  });
}

function openEdit(row) {
  addDialog({
    title: "修改客户",
    width: "500px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: {
        scope: row.scope,
        playlistIds: [...row.playlistIds],
        showCooperation: row.showCooperation,
        expireDate: row.expireDate
      }
    },
    contentRenderer: () =>
      h(EditForm, {
        ref: dialogFormRef,
        formInline: null,
        playlists: playlists.value
      }),
    beforeSure: (done, { options }) => {
      dialogFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const result = await updateCustomer({
          ...(options.props.formInline as object),
          id: row.id
        });
        if (result.code !== 0) {
          message(result.message, { type: "error" });
          return;
        }
        message("修改成功", { type: "success" });
        done();
        onSearch();
      });
    }
  });
}

async function removeRows(rows: any[]) {
  const names = rows.length === 1 ? rows[0].name : `${rows.length} 个客户`;
  try {
    await ElMessageBox.confirm(`确认取消分享给 ${names} 吗？`, "提示", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    });
  } catch {
    return;
  }
  const { code, message: msg } = await removeCustomers({
    ids: rows.map(item => item.id)
  });
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  message("取消分享成功", { type: "success" });
  refreshAfterRemove(rows.length);
}

onMounted(loadPlaylists);
</script>

<template>
  <div>
    <el-form
      ref="formRef"
      :model="form"
      label-width="90px"
      class="channel-search"
    >
      <el-form-item label="客户名称:" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入客户名称"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="手机号码:" prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="请输入手机号码"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="登录邮箱:" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入登录邮箱"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="客户权限:" prop="permission">
        <el-select
          v-model="form.permission"
          placeholder="请选择客户权限"
          clearable
          class="w-full!"
        >
          <el-option label="全频道歌单/歌曲" value="all" />
          <el-option
            v-for="item in playlists"
            :key="item.id"
            :label="item.name"
            :value="String(item.id)"
          />
          <el-option label="无" value="none" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态:" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
          clearable
          class="w-full!"
        >
          <el-option label="正常" :value="1" />
          <el-option label="已到期" :value="2" />
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

    <div class="mb-4">
      <el-button type="primary" :icon="useRenderIcon(Plus)" @click="openAdd">
        添加客户
      </el-button>
      <el-button
        type="warning"
        :disabled="!selected.length"
        @click="removeRows(selected)"
      >
        取消分享
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
      <template #name="{ row }">
        <div>{{ row.name }}</div>
        <div v-if="row.company">单位：{{ row.company }}</div>
      </template>
      <template #contact="{ row }">
        <div v-if="row.phone">{{ row.phone }}</div>
        <div>{{ row.email }}</div>
      </template>
      <template #permission="{ row }">
        {{ permissionText(row) }}
      </template>
      <template #operation="{ row }">
        <div class="flex flex-col items-start gap-1">
          <el-button link type="primary" @click="openEdit(row)">修改</el-button>
          <el-button
            link
            type="primary"
            class="ml-0!"
            @click="removeRows([row])"
          >
            取消分享
          </el-button>
        </div>
      </template>
    </pure-table>
  </div>
</template>

<style lang="scss" src="../library/utils/search.scss"></style>
