<script setup lang="ts">
import { ref } from "vue";
import { message } from "@/utils/message";
import { searchCustomer } from "@/api/customer";
import GrantFields, { type Grant } from "./GrantFields.vue";
import { grantRules } from "../utils/rules";

const props = defineProps<{
  formInline: Grant & { customerId: number | null };
  playlists: Array<{ id: number; name: string }>;
}>();

const ruleFormRef = ref();
const form = ref(props.formInline);
const email = ref("");
const searching = ref(false);
const searched = ref(false);
const result = ref<{
  name: string;
  company: string;
  email: string;
  added: boolean;
} | null>(null);

async function onSearch() {
  const value = email.value.trim();
  if (!value) {
    message("请输入客户完整邮箱", { type: "warning" });
    return;
  }
  searching.value = true;
  try {
    const { code, message: msg, data } = await searchCustomer({ email: value });
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    searched.value = true;
    result.value = data;
    form.value.customerId = data && !data.added ? data.id : null;
  } finally {
    searching.value = false;
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
    :model="form"
    :rules="grantRules"
    class="channel-dialog-form"
  >
    <el-form-item label="输入客户信息：" label-position="top">
      <div class="flex w-full gap-2">
        <el-input
          v-model="email"
          placeholder="请输入客户[完整邮箱]后点击搜索"
          @keydown.enter.prevent="onSearch"
        />
        <el-button type="primary" :loading="searching" @click="onSearch">
          搜索
        </el-button>
      </div>
      <div class="mt-2 w-full">
        <span>搜索结果：</span>
        <span v-if="result">
          {{ result.name }}
          <template v-if="result.company">（{{ result.company }}）</template>
          {{ result.email }}
          <el-tag v-if="result.added" type="warning" class="ml-1"
            >已添加</el-tag
          >
        </span>
        <span v-else>{{ searched ? "未找到该客户" : "暂无" }}</span>
      </div>
    </el-form-item>

    <GrantFields v-if="form.customerId" v-model="form" :playlists="playlists" />
  </el-form>
</template>

<style lang="scss" src="../../library/utils/search.scss"></style>
