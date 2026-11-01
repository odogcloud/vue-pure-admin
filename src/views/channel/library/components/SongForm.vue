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
  cover: string;
  audioUrl: string;
  lyrics: string;
};

const COVER_SIZE = 1500;

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

/** 读取图片的实际尺寸 */
function readImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid image"));
    };
    image.src = url;
  });
}

async function handleCover(item) {
  const file: File = item.raw;
  uploading.value = true;
  try {
    const { width, height } = await readImageSize(file);
    if (width !== COVER_SIZE || height !== COVER_SIZE) {
      message(
        `封面尺寸应为 ${COVER_SIZE}x${COVER_SIZE}，当前为 ${width}x${height}`,
        { type: "error" }
      );
      return;
    }
    const { code, message: msg, data } = await uploadFile(file, "image");
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    form.value.cover = data.url;
  } catch {
    message("图片无法读取或上传失败，请重试", { type: "error" });
  } finally {
    uploading.value = false;
  }
}

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
    <el-form-item label="歌曲封面">
      <div class="flex items-center gap-3">
        <el-image
          v-if="form.cover"
          :src="form.cover"
          fit="cover"
          class="size-20 rounded-sm"
        />
        <div>
          <div class="flex items-center gap-2">
            <el-upload
              action="#"
              accept=".png,.jpg,.jpeg,.webp"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleCover"
            >
              <el-button type="primary" plain>上传封面</el-button>
            </el-upload>
            <el-button
              v-if="form.cover"
              link
              type="danger"
              @click="form.cover = ''"
            >
              删除
            </el-button>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            选填，尺寸 1500x1500，支持 png、jpg、webp，不超过 10MB
          </div>
        </div>
      </div>
    </el-form-item>
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
