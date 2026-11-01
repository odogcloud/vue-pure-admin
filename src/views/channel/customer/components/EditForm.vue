<script setup lang="ts">
import { ref } from "vue";
import GrantFields, { type Grant } from "./GrantFields.vue";
import { grantRules } from "../utils/rules";

const props = defineProps<{
  formInline: Grant;
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
    <GrantFields v-model="form" :playlists="playlists" />
  </el-form>
</template>

<style lang="scss" src="../../library/utils/search.scss"></style>
