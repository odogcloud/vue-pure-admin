<script setup lang="ts">
import { ref } from "vue";
import GrantFields, { type Grant } from "./GrantFields.vue";
import { grantRules } from "../utils/rules";

const props = defineProps<{
  formInline: Grant & { action: "approve" | "reject" };
  customer: string;
  playlists: Array<{ id: number; name: string }>;
}>();

const ruleFormRef = ref();
const form = ref(props.formInline);

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
    <el-form-item label="客户：" label-position="top">
      {{ customer }}
    </el-form-item>
    <el-form-item label="处理结果：" required label-position="top">
      <el-radio-group v-model="form.action">
        <el-radio value="approve">同意</el-radio>
        <el-radio value="reject">拒绝</el-radio>
      </el-radio-group>
    </el-form-item>
    <GrantFields
      v-if="form.action === 'approve'"
      v-model="form"
      :playlists="playlists"
    />
  </el-form>
</template>

<style lang="scss" src="../../library/utils/search.scss"></style>
