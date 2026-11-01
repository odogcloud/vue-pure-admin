<script setup lang="ts">
import dayjs from "dayjs";
import { computed, h, reactive, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import Search from "~icons/ep/search";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getCooperationList, handleCooperation } from "@/api/cooperation";
import { useListPage } from "../library/utils/list";
import { sureCancelButtons } from "../library/utils/dialog";
import { releasedOptions } from "../library/utils/constants";
import SongCell from "../library/components/SongCell.vue";
import ContactCell from "../library/components/ContactCell.vue";
import NoteForm from "./NoteForm.vue";
import { useAllChannels } from "../library/utils/allChannels";

const props = defineProps<{ stage: "confirm" | "trade" | "done" }>();

const STATUS_TEXT = {
  confirm: { pending: "待确权", unable: "无法确权", cancelled: "客户取消申请" },
  trade: { pending: "待交易", closed: "交易关闭", cancelled: "客户取消申请" },
  done: { done: "完成交易" }
};

const ACTIONS = {
  confirm: [
    {
      action: "confirm",
      label: "确权",
      noteLabel: "备注",
      required: false,
      success: "已确权，申请转入待交易"
    },
    {
      action: "unable",
      label: "无法确权",
      noteLabel: "原因",
      required: true,
      success: "已标记为无法确权"
    }
  ],
  trade: [
    {
      action: "complete",
      label: "完成交易",
      noteLabel: "备注",
      required: false,
      success: "交易已完成"
    },
    {
      action: "close",
      label: "交易关闭",
      noteLabel: "原因",
      required: true,
      success: "交易已关闭"
    }
  ],
  done: []
};

const formRef = ref();
const noteFormRef = ref();
const form = reactive({
  stage: props.stage,
  customerName: "",
  songName: "",
  released: "",
  lyricist: "",
  composer: "",
  contact: "",
  applyTime: [],
  status: ""
});

const statusOptions = computed(() =>
  Object.entries(STATUS_TEXT[props.stage]).map(([value, label]) => ({
    value,
    label
  }))
);
const actions = computed(() => ACTIONS[props.stage]);

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
} = useListPage(form, getCooperationList, onLoaded);

const columns: TableColumnList = [
  channelColumn,
  { label: "合作申请", slot: "request", width: 170 },
  { label: "客户联系方式", slot: "customer", width: 190 },
  { label: "作品", slot: "song", width: 170 },
  {
    label: "歌曲价格",
    prop: "price",
    width: 100,
    formatter: ({ song }) => (song.price ? song.price.toLocaleString() : "-")
  },
  { label: "确权联系人", slot: "contact", width: 170 },
  {
    label: "申请时间",
    prop: "createTime",
    width: 110,
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  },
  { label: "状态", slot: "status", width: 120 },
  { label: "操作", fixed: "right", width: 100, slot: "operation" }
];

function openAction(row, item) {
  addDialog({
    title: item.label,
    width: "500px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: { note: "" }
    },
    contentRenderer: () =>
      h(NoteForm, {
        ref: noteFormRef,
        formInline: null,
        summary: `${row.customerName} 申请《${row.song.name}》`,
        label: item.noteLabel,
        required: item.required
      }),
    beforeSure: (done, { options }) => {
      noteFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const { note } = options.props.formInline as { note: string };
        const result = await handleCooperation({
          id: row.id,
          action: item.action,
          note
        });
        if (result.code !== 0) {
          message(result.message, { type: "error" });
          return;
        }
        message(item.success, { type: "success" });
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
      label-width="100px"
      class="channel-search"
    >
      <el-form-item label="客户名称:" prop="customerName">
        <el-input
          v-model="form.customerName"
          placeholder="请输入客户名称"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="作品名称:" prop="songName">
        <el-input
          v-model="form.songName"
          placeholder="请输入作品名称"
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
      <el-form-item label="确权联系人:" prop="contact">
        <el-input
          v-model="form.contact"
          placeholder="请输入确权联系人"
          clearable
          class="w-full!"
        />
      </el-form-item>
      <el-form-item label="申请时间:" prop="applyTime">
        <el-date-picker
          v-model="form.applyTime"
          type="daterange"
          value-format="x"
          start-placeholder="请选择"
          end-placeholder="请选择"
          class="w-full!"
        />
      </el-form-item>
      <el-form-item v-if="stage !== 'done'" label="状态:" prop="status">
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
      <template #request="{ row }">
        <div>{{ row.customerName }}</div>
        <div v-if="row.company">单位：{{ row.company }}</div>
        <div>合作类型：{{ row.cooperationType || "-" }}</div>
        <div v-if="row.content">说明：{{ row.content }}</div>
      </template>
      <template #customer="{ row }">
        <div v-if="row.customerPhone">{{ row.customerPhone }}</div>
        <div>{{ row.customerEmail }}</div>
      </template>
      <template #song="{ row }">
        <SongCell :row="row.song" />
      </template>
      <template #contact="{ row }">
        <ContactCell :row="row.song" />
      </template>
      <template #status="{ row }">
        <div>{{ STATUS_TEXT[stage][row.status] ?? "-" }}</div>
        <el-tooltip v-if="row.note" :content="row.note" placement="top">
          <div class="truncate cursor-default">{{ row.note }}</div>
        </el-tooltip>
      </template>
      <template #operation="{ row }">
        <template v-if="canOperate(row)">
          <div
            v-if="row.status === 'pending' && actions.length"
            class="flex flex-col items-start gap-1"
          >
            <el-button
              v-for="item in actions"
              :key="item.action"
              link
              :type="item.required ? 'danger' : 'primary'"
              class="ml-0!"
              @click="openAction(row, item)"
            >
              {{ item.label }}
            </el-button>
          </div>
          <span v-else>-</span>
        </template>
        <span v-else>-</span>
      </template>
    </pure-table>
  </div>
</template>

<style lang="scss" src="../library/utils/search.scss"></style>
