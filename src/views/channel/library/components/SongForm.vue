<script setup lang="ts">
import { ref } from "vue";
import { message } from "@/utils/message";
import { uploadFile } from "@/api/channel";

export type SongFormData = {
  id?: number;
  name: string;
  lyricist: string;
  composer: string;
  released: number;
  audioUrl: string;
  lyrics: string;
};

const props = defineProps<{ formInline: SongFormData }>();

const ruleFormRef = ref();
const uploading = ref(false);
const form = ref(props.formInline);
const rules = {
  name: [
    {
      required: true,
      whitespace: true,
      message: "请输入作品名称",
      trigger: "blur"
    }
  ]
};

async function handleAudio(item) {
  const file: File = item.raw;
  uploading.value = true;
  try {
    const { code, message: msg, data } = await uploadFile(file, "audio");
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    form.value.audioUrl = data.url;
  } catch {
    message("上传失败，请重试", { type: "error" });
  } finally {
    uploading.value = false;
  }
}

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef, uploading });
</script>

<template>
  <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="90px">
    <el-form-item label="作品名称" prop="name">
      <el-input
        v-model="form.name"
        maxlength="100"
        placeholder="请输入作品名称"
      />
    </el-form-item>
    <el-form-item label="词作者">
      <el-input
        v-model="form.lyricist"
        maxlength="200"
        placeholder="请输入词作者"
      />
    </el-form-item>
    <el-form-item label="曲作者">
      <el-input
        v-model="form.composer"
        maxlength="200"
        placeholder="请输入曲作者"
      />
    </el-form-item>
    <el-form-item label="是否发行">
      <el-radio-group v-model="form.released">
        <el-radio :value="1">已发行</el-radio>
        <el-radio :value="0">未发行</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="音频文件">
      <div class="w-full">
        <el-upload
          v-loading="uploading"
          action="#"
          accept=".mp3,.wav,.flac,.m4a,.aac,.ogg"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleAudio"
        >
          <el-button type="primary" plain>上传音频</el-button>
        </el-upload>
        <audio
          v-if="form.audioUrl"
          :src="form.audioUrl"
          controls
          class="w-full mt-2"
        />
        <div class="text-xs text-gray-500 mt-1">
          支持 mp3、wav、flac、m4a、aac、ogg，不超过 100MB。提交审核前必须上传。
        </div>
      </div>
    </el-form-item>
    <el-form-item label="歌词">
      <el-input
        v-model="form.lyrics"
        type="textarea"
        :rows="5"
        maxlength="20000"
        placeholder="请输入歌词"
      />
    </el-form-item>
  </el-form>
</template>
