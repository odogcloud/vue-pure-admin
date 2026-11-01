<script setup lang="ts">
import { ref } from "vue";
import { message } from "@/utils/message";
import { uploadFile } from "@/api/channel";
import TagPicker from "./TagPicker.vue";

const props = defineProps<{
  formInline: {
    id?: number;
    cover: string;
    name: string;
    tags: string[];
    weight: number;
    reason: string;
  };
  hotTags: string[];
  recentTags: string[];
}>();

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const recents = ref(props.recentTags);
const uploading = ref(false);
const rules = {
  cover: [{ required: true, message: "请上传歌单封面", trigger: "change" }],
  name: [{ required: true, message: "请输入歌单名称", trigger: "blur" }],
  tags: [
    {
      type: "array" as const,
      required: true,
      min: 1,
      message: "请输入歌单标签",
      trigger: "change"
    }
  ],
  reason: [{ required: true, message: "请输入歌单推荐理由", trigger: "blur" }]
};

async function handleCover(item) {
  const file: File = item.raw;
  if (!file.type.startsWith("image/")) {
    message("请上传图片文件", { type: "error" });
    return;
  }
  uploading.value = true;
  try {
    const { code, message: msg, data } = await uploadFile(file, "image");
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    newFormInline.value.cover = data.url;
    ruleFormRef.value.validateField("cover");
  } catch {
    message("上传失败，请重试", { type: "error" });
  } finally {
    uploading.value = false;
  }
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
    label-width="120px"
    class="channel-dialog-form"
  >
    <el-form-item label="歌单封面：" prop="cover">
      <el-upload
        v-loading="uploading"
        action="#"
        accept="image/*"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleCover"
      >
        <img
          v-if="newFormInline.cover"
          :src="newFormInline.cover"
          alt="cover"
          class="channel-cover object-cover"
        />
        <div v-else class="channel-cover channel-cover--empty flex-c">+</div>
      </el-upload>
    </el-form-item>

    <el-form-item label="歌单名称：" prop="name">
      <el-input
        v-model="newFormInline.name"
        maxlength="50"
        show-word-limit
        placeholder="请输入歌单名称"
      />
    </el-form-item>

    <TagPicker
      v-model="newFormInline.tags"
      v-model:recent-tags="recents"
      :hot-tags="hotTags"
      label="歌单标签："
      hint="自定义标签在输入内容后点击【回车】键"
    />

    <el-form-item label="歌单权重：">
      <el-input-number
        v-model="newFormInline.weight"
        :min="0"
        placeholder="请输入歌单权重"
        class="w-full!"
      />
    </el-form-item>

    <el-form-item label="歌单推荐理由：" prop="reason">
      <el-input
        v-model="newFormInline.reason"
        type="textarea"
        :rows="4"
        placeholder="请输入歌单推荐理由"
      />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" src="../utils/search.scss"></style>
