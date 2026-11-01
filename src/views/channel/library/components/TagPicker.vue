<script setup lang="ts">
import { ref } from "vue";
import { deleteRecentTag } from "@/api/channel";

const tags = defineModel<string[]>({ required: true });
const recentTags = defineModel<string[]>("recentTags", { required: true });

defineProps<{
  hotTags: string[];
  aiTags?: string[];
  label: string;
  hint: string;
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
  <el-form-item label="热门标签">
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
      <span class="text-gray-500 text-sm">{{ tip }}</span>
    </div>
  </el-form-item>

  <el-form-item v-if="aiTags?.length" label="AI标签">
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
      <span class="text-gray-500 text-sm">{{ tip }}</span>
    </div>
  </el-form-item>

  <el-form-item label="最近使用">
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
      <span class="text-gray-500 text-sm">{{ tip }}</span>
    </div>
  </el-form-item>

  <el-form-item :label="label" prop="tags">
    <div class="w-full">
      <el-input
        v-model="inputValue"
        maxlength="14"
        show-word-limit
        placeholder="请输入标签"
        @keydown.enter.prevent="handleEnter"
      />
      <div class="text-gray-500 text-sm">{{ hint }}</div>
      <div class="flex flex-wrap gap-2 mt-1">
        <el-tag v-for="tag in tags" :key="tag" closable @close="removeTag(tag)">
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </el-form-item>
</template>
