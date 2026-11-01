<script setup lang="ts">
import { ref } from "vue";
import { deleteRecentTag } from "@/api/channel";

const tags = defineModel<string[]>({ required: true });
const recentTags = defineModel<string[]>("recentTags", { required: true });

defineProps<{
  hotTags: string[];
  aiTags?: string[];
  label: string;
  hint?: string;
  /** 编辑歌曲页：提示同行显示、输入框带字数统计、标题在输入框上方 */
  stacked?: boolean;
}>();

const inputValue = ref("");
const tip = "（点击后将添加到【自定义标签】中）";

function addTag(tag: string) {
  const value = tag.trim();
  if (value && !tags.value.includes(value)) {
    tags.value = [...tags.value, value];
  }
}

function handleEnter() {
  addTag(inputValue.value);
  inputValue.value = "";
}

function removeTag(tag: string) {
  tags.value = tags.value.filter(item => item !== tag);
}

async function removeRecent(tag: string) {
  await deleteRecentTag({ tag });
  recentTags.value = recentTags.value.filter(item => item !== tag);
}
</script>

<template>
  <el-form-item label="热门标签：">
    <div class="w-full flex flex-wrap items-center gap-2">
      <el-tag
        v-for="tag in hotTags"
        :key="tag"
        type="warning"
        class="cursor-pointer"
        @click="addTag(tag)"
      >
        {{ tag }}
      </el-tag>
      <span :class="['text-gray-500', stacked ? '' : 'w-full mt-2']">
        {{ tip }}
      </span>
    </div>
  </el-form-item>

  <el-form-item v-if="aiTags?.length" label="AI标签：">
    <div class="w-full flex flex-wrap items-center gap-2">
      <el-tag
        v-for="tag in aiTags"
        :key="tag"
        type="warning"
        class="cursor-pointer"
        @click="addTag(tag)"
      >
        {{ tag }}
      </el-tag>
      <span :class="['text-gray-500', stacked ? '' : 'w-full mt-2']">
        {{ tip }}
      </span>
    </div>
  </el-form-item>

  <el-form-item label="最近使用：">
    <div class="w-full flex flex-wrap items-center gap-2">
      <el-tag
        v-for="tag in recentTags"
        :key="tag"
        type="warning"
        closable
        class="cursor-pointer"
        @click="addTag(tag)"
        @close="removeRecent(tag)"
      >
        {{ tag }}
      </el-tag>
      <span :class="['text-gray-500', stacked ? '' : 'w-full mt-2']">
        {{ tip }}
      </span>
    </div>
  </el-form-item>

  <el-form-item
    :label="label"
    prop="tags"
    :label-position="stacked ? 'top' : undefined"
  >
    <div :class="stacked ? 'w-full channel-field' : 'w-full'">
      <el-input
        v-model="inputValue"
        :maxlength="stacked ? 14 : undefined"
        :show-word-limit="stacked"
        :placeholder="stacked ? '' : '请输入标签'"
        @keydown.enter.prevent="handleEnter"
      />
      <div v-if="hint" class="text-gray-500 mt-2 leading-5">{{ hint }}</div>
      <div v-if="tags.length" class="flex flex-wrap gap-2 mt-2">
        <el-tag v-for="tag in tags" :key="tag" closable @close="removeTag(tag)">
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </el-form-item>
</template>
