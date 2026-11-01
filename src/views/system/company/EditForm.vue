<script setup lang="ts">
import { ref } from "vue";
import { CHANNEL_TYPES } from "./types";

const props = defineProps<{
  formInline: { id?: number; name: string; type: string };
}>();

const ruleFormRef = ref();
const form = ref(props.formInline);
const rules = {
  name: [
    {
      required: true,
      whitespace: true,
      message: "请输入频道名称",
      trigger: "blur"
    }
  ],
  type: [{ required: true, message: "请选择类型", trigger: "change" }]
};

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="频道名称" prop="name">
      <el-input
        v-model="form.name"
        maxlength="20"
        show-word-limit
        placeholder="请输入频道名称"
      />
    </el-form-item>
    <el-form-item label="类型" prop="type">
      <el-select v-model="form.type" class="w-full" placeholder="请选择类型">
        <el-option
          v-for="item in CHANNEL_TYPES"
          :key="item.value"
          v-bind="item"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
