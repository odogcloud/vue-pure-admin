<script setup lang="ts">
import { ref } from "vue";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";

const MAX_SIZE = 50 * 1024 * 1024;

const props = defineProps<{
  formInline: { file: File | null; playlistId: number | null };
  playlists: Array<{ id: number; name: string }>;
}>();

const ruleFormRef = ref();
const uploadRef = ref();
const newFormInline = ref(props.formInline);
const rules = {
  file: [{ required: true, message: "请选择文件", trigger: "change" }]
};

function handleChange(uploadFile) {
  const file: File = uploadFile.raw;
  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    message("格式为 xlsx/xls 的文件", { type: "error" });
    uploadRef.value.clearFiles();
    return;
  }
  if (file.size > MAX_SIZE) {
    message("大小不超过 50MB", { type: "error" });
    uploadRef.value.clearFiles();
    return;
  }
  newFormInline.value.file = file;
  ruleFormRef.value.validateField("file");
}

function handleRemove() {
  newFormInline.value.file = null;
}

function handleExceed(files: File[]) {
  uploadRef.value.clearFiles();
  uploadRef.value.handleStart(files[0]);
}

function downloadTemplate() {
  const sheet = utils.aoa_to_sheet([["作品名称", "词作者", "曲作者"]]);
  const book = utils.book_new();
  utils.book_append_sheet(book, sheet, "歌曲清单");
  writeFile(book, "歌曲清单模版.xlsx");
}

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="rules"
    label-width="110px"
    class="channel-dialog-form"
  >
    <el-form-item label="歌曲清单" prop="file">
      <el-upload
        ref="uploadRef"
        action="#"
        drag
        accept=".xlsx,.xls"
        :auto-upload="false"
        :limit="1"
        class="channel-upload-import"
        :on-change="handleChange"
        :on-remove="handleRemove"
        :on-exceed="handleExceed"
      >
        <el-button type="primary">选取文件</el-button>
        <template #tip>
          <div
            class="channel-upload-tip text-gray-500 channel-upload-tip--text"
          >
            <div>大小不超过 <b>50MB</b></div>
            <div>格式为 <b>xlsx/xls</b> 的文件</div>
          </div>
        </template>
      </el-upload>
    </el-form-item>

    <el-form-item label="选择收录的歌单">
      <el-select
        v-model="newFormInline.playlistId"
        placeholder="请选择"
        clearable
        class="w-full"
      >
        <el-option
          v-for="item in playlists"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>

    <el-link
      type="primary"
      underline="never"
      class="ml-4"
      @click="downloadTemplate"
    >
      下载模版
    </el-link>
  </el-form>
</template>

<style lang="scss" src="../utils/search.scss"></style>
