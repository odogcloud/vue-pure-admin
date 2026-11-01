<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  formInline: { note: string };
  summary: string;
  label: string;
  required: boolean;
}>();

const ruleFormRef = ref();
const form = ref(props.formInline);
const rules = {
  note: [
    {
      required: props.required,
      message: `请填写${props.label}`,
      trigger: "blur"
    }
  ]
};

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="form"
    :rules="rules"
    label-position="top"
    class="channel-dialog-form"
  >
    <p class="mb-4">{{ summary }}</p>
    <el-form-item :label="`${label}：`" prop="note">
      <el-input
        v-model="form.note"
        type="textarea"
        :rows="4"
        maxlength="500"
        show-word-limit
        :placeholder="`请输入${label}`"
      />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" src="../library/utils/search.scss"></style>
