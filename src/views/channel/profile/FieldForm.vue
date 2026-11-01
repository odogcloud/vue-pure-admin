<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  formInline: { value: string };
  label: string;
  maxlength: number;
  required: boolean;
}>();

const ruleFormRef = ref();
const form = ref(props.formInline);
const rules = {
  value: props.required
    ? [
        {
          required: true,
          message: `请输入${props.label}`,
          trigger: "blur"
        }
      ]
    : []
};

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="70px">
    <el-form-item :label="label" prop="value">
      <el-input
        v-model="form.value"
        :maxlength="maxlength"
        show-word-limit
        :placeholder="`请输入${label}`"
      />
    </el-form-item>
  </el-form>
</template>
