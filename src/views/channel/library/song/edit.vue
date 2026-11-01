<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "@/utils/message";
import { getSongDetail, getTagOptions, updateSong } from "@/api/channel";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import TagPicker from "../components/TagPicker.vue";

defineOptions({
  name: "ChannelEditSong"
});

const route = useRoute();
const router = useRouter();
const formRef = ref();
const saving = ref(false);
const loading = ref(true);
const songTags = ref<string[]>([]);
const defaultReason = ref("");
const hotTags = ref<string[]>([]);
const aiTags = ref<string[]>([]);
const recentTags = ref<string[]>([]);
const form = reactive({
  id: Number(route.params.id),
  name: "",
  tags: [] as string[],
  reason: "",
  videoUrl: "",
  videoName: ""
});
const rules = {
  tags: [
    {
      type: "array" as const,
      required: true,
      min: 1,
      message: "请输入自定义标签",
      trigger: "change"
    }
  ]
};

function goBack() {
  router.push({ name: "ChannelLibrary" });
}

function restoreReason() {
  form.reason = defaultReason.value;
}

function handleVideo(uploadFile) {
  const file: File = uploadFile.raw;
  if (!file.type.startsWith("video/")) {
    message("请上传视频文件", { type: "error" });
    return;
  }
  form.videoUrl = URL.createObjectURL(file);
  form.videoName = file.name;
}

function removeVideo() {
  form.videoUrl = "";
  form.videoName = "";
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  saving.value = true;
  try {
    const { code, message: msg } = await updateSong({ ...form });
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    message("保存成功", { type: "success" });
    goBack();
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  useMultiTagsStoreHook().handleTags("push", {
    path: "/channel/library/edit-song/:id",
    name: "ChannelEditSong",
    params: { id: String(route.params.id) },
    meta: { title: "编辑曲库歌曲" }
  });
  try {
    const [song, options] = await Promise.all([
      getSongDetail({ id: form.id }),
      getTagOptions()
    ]);
    if (song.code !== 0) {
      message(song.message, { type: "error" });
      goBack();
      return;
    }
    form.name = song.data.name;
    form.tags = [...song.data.tags];
    form.reason = song.data.reason;
    form.videoUrl = song.data.videoUrl;
    form.videoName = song.data.videoName;
    songTags.value = song.data.songTags;
    defaultReason.value = song.data.defaultReason;
    hotTags.value = options.data.hotTags;
    aiTags.value = options.data.aiTags;
    recentTags.value = options.data.recentTags;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-loading="loading" class="main bg-bg_color m-6! p-5">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="left"
      label-width="110px"
      class="max-w-200"
    >
      <el-form-item label="歌曲名称">
        <el-input v-model="form.name" disabled placeholder="请输入歌曲名称" />
      </el-form-item>

      <el-form-item label="歌曲标签">
        <div class="flex flex-wrap gap-2">
          <el-tag v-for="tag in songTags" :key="tag">{{ tag }}</el-tag>
        </div>
      </el-form-item>

      <TagPicker
        v-model="form.tags"
        v-model:recent-tags="recentTags"
        :hot-tags="hotTags"
        :ai-tags="aiTags"
        label="自定义标签"
        hint="请在输入框输入内容后点击【回车】键"
      />

      <el-form-item label="歌曲推荐理由">
        <div class="w-full">
          <div class="text-right">
            <el-button link type="primary" @click="restoreReason">
              恢复默认
            </el-button>
          </div>
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="5"
            maxlength="500"
            show-word-limit
          />
        </div>
      </el-form-item>

      <el-form-item label="上传视频">
        <div class="w-full">
          <el-upload
            action="#"
            accept="video/*"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleVideo"
          >
            <el-button>选取视频</el-button>
          </el-upload>
          <div v-if="form.videoUrl" class="mt-2">
            <video :src="form.videoUrl" controls class="w-80" />
            <div class="flex items-center gap-2">
              <span>{{ form.videoName }}</span>
              <el-button link type="danger" @click="removeVideo">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          确认
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
