<script setup lang="ts">
import dayjs from "dayjs";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { message } from "@/utils/message";
import { getNoticeDetail } from "@/api/home";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";

defineOptions({
  name: "NoticeDetail"
});

const route = useRoute();
const loading = ref(true);
const detail = ref(null);

const formatSize = (size: number) =>
  size >= 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(2)} MB`
    : `${(size / 1024).toFixed(2)} KB`;

onMounted(async () => {
  useMultiTagsStoreHook().handleTags("push", {
    path: "/welcome/view-notice/:type/:id",
    name: "NoticeDetail",
    params: { type: String(route.params.type), id: String(route.params.id) },
    meta: {
      title: route.params.type === "2" ? "查看手册&附件" : "查看公告"
    }
  });
  try {
    const {
      code,
      message: msg,
      data
    } = await getNoticeDetail({
      id: route.params.id
    });
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    detail.value = data;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-loading="loading" class="main bg-bg_color m-6! p-8">
    <template v-if="detail">
      <h2 class="text-center text-xl font-bold">{{ detail.title }}</h2>
      <p class="text-center text-gray-500 my-3">
        发布时间：{{ dayjs(detail.publishTime).format("YYYY-MM-DD HH:mm:ss") }}
      </p>
      <el-divider />
      <p class="whitespace-pre-wrap leading-7">{{ detail.content }}</p>
      <template v-if="detail.attachments.length">
        <h3 class="font-bold mt-6 mb-2">
          附件（{{ detail.attachments.length }}）
        </h3>
        <div v-for="file in detail.attachments" :key="file.url" class="mb-1">
          <el-link type="primary" :href="file.url" target="_blank">
            {{ file.name }}
          </el-link>
          <span class="text-gray-500 ml-2">{{ formatSize(file.size) }}</span>
        </div>
      </template>
    </template>
    <el-empty v-else-if="!loading" description="内容不存在" />
  </div>
</template>
