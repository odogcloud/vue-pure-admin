<script setup lang="ts">
import dayjs from "dayjs";
import { h, reactive, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getPlaylistOptions } from "@/api/channel";
import { getApplicationList, handleApplication } from "@/api/customer";
import { useListPage } from "../library/utils/list";
import { sureCancelButtons } from "../library/utils/dialog";
import HandleForm from "./components/HandleForm.vue";
import { useAllChannels } from "../library/utils/allChannels";

const formRef = ref();
const handleFormRef = ref();
const form = reactive({
  name: "",
  phone: "",
  email: "",
  applyTime: [],
  status: ""
});

const statusOptions = [
  { label: "待处理", value: 0, type: "warning" },
  { label: "已同意", value: 1, type: "success" },
  { label: "已拒绝", value: 2, type: "danger" }
] as const;

const { onLoaded, canOperate, channelColumn } = useAllChannels();

const {
  dataList,
  loading,
  pagination,
  onSearch,
  handleSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = useListPage(form, getApplicationList, onLoaded);

const columns: TableColumnList = [
  channelColumn,
  { label: "客户名称", slot: "name", minWidth: 150 },
  { label: "客户联系方式", slot: "contact", minWidth: 170 },
  {
    label: "申请时间",
    prop: "createTime",
    minWidth: 170,
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  },
  { label: "状态", slot: "status", minWidth: 100 },
  { label: "操作", fixed: "right", width: 90, slot: "operation" }
];

const statusOf = (status: number) =>
  statusOptions.find(item => item.value === status);

async function openHandle(row) {
  const { code, message: msg, data } = await getPlaylistOptions();
  if (code !== 0) {
    message(msg, { type: "error" });
    return;
  }
  addDialog({
    title: "处理客户申请",
    width: "500px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: {
        action: "approve",
        scope: "all",
        playlistIds: [],
        showCooperation: 0,
        expireDate: ""
      }
    },
    contentRenderer: () =>
      h(HandleForm, {
        ref: handleFormRef,
        formInline: null,
        customer: `${row.name}（${row.email}）`,
        playlists: data.list
      }),
    beforeSure: (done, { options }) => {
      handleFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const values = options.props.formInline as Record<string, unknown>;
        const result = await handleApplication(
          values.action === "reject"
            ? { action: "reject", id: row.id }
            : { ...values, id: row.id }
        );
        if (result.code !== 0) {
          message(result.message, { type: "error" });
          return;
        }
        message("处理成功", { type: "success" });
        done();
        onSearch();
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
      <el-form-item label="申请时间:" prop="applyTime">
        <el-date-picker
          v-model="form.applyTime"
          type="daterange"
          value-format="x"
          start-placeholder="请选择开始时间"
          end-placeholder="请选择结束时间"
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="状态:" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
          clearable
          class="w-full!"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
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
      <template #name="{ row }">
        <div>{{ row.name }}</div>
        <div v-if="row.company">单位：{{ row.company }}</div>
      </template>
      <template #contact="{ row }">
        <div v-if="row.phone">{{ row.phone }}</div>
        <div>{{ row.email }}</div>
      </template>
      <template #status="{ row }">
        <el-tag :type="statusOf(row.status)?.type">
          {{ statusOf(row.status)?.label }}
        </el-tag>
      </template>
      <template #operation="{ row }">
        <template v-if="canOperate(row)">
          <el-button
            v-if="row.status === 0"
            link
            type="primary"
            @click="openHandle(row)"
          >
            处理
          </el-button>
          <span v-else>-</span>
        </template>
        <span v-else>-</span>
      </template>
    </pure-table>
  </div>
</template>

<style lang="scss" src="../library/utils/search.scss"></style>
