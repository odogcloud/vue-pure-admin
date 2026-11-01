<script setup lang="ts">
import dayjs from "dayjs";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getNotices } from "@/api/home";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Paperclip from "~icons/ep/paperclip";
import ArrowRight from "~icons/ep/arrow-right";

const props = defineProps<{ type: 1 | 2; title: string }>();

const router = useRouter();
const loading = ref(true);
const list = ref([]);
const page = reactive({ total: 0, pageSize: 5, currentPage: 1 });

async function load() {
  loading.value = true;
  try {
    const { code, data } = await getNotices({
      type: props.type,
      pageSize: page.pageSize,
      currentPage: page.currentPage
    });
    if (code === 0) {
      list.value = data.list;
      page.total = data.total;
    }
  } finally {
    loading.value = false;
  }
}

function view(item) {
  router.push({
    name: "NoticeDetail",
    params: { type: String(item.type), id: String(item.id) }
  });
}

onMounted(load);
</script>

<template>
  <div v-loading="loading">
    <h3 class="notice-title">{{ title }}</h3>
    <el-empty v-if="!loading && !list.length" description="暂无内容" />
    <div
      v-for="item in list"
      :key="item.id"
      class="notice-item"
      @click="view(item)"
    >
      <span class="notice-item__name" :title="item.title">
        {{ item.title }}
      </span>
      <component
        :is="useRenderIcon(Paperclip)"
        v-if="item.hasAttachment"
        class="notice-item__icon"
      />
      <span class="notice-item__date">
        {{ dayjs(item.publishTime).format("YYYY-MM-DD") }}
      </span>
      <component :is="useRenderIcon(ArrowRight)" class="notice-item__icon" />
    </div>
    <el-pagination
      v-if="page.total"
      v-model:current-page="page.currentPage"
      background
      size="small"
      layout="total, prev, pager, next"
      :page-size="page.pageSize"
      :total="page.total"
      class="justify-end mt-4"
      @current-change="load"
    />
  </div>
</template>

<style lang="scss" scoped>
.notice-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
}

.notice-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:hover {
    color: var(--el-color-primary);
  }

  &__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__icon {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }

  &__date {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}
</style>
