<script setup lang="ts">
import { ref } from "vue";
import { CHANNEL_TYPES } from "@/views/system/company/types";

const props = defineProps<{
  formInline: { name: string; type: string };
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
  ]
};

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="升级为">
      <el-select v-model="form.type" class="w-full">
        <el-option
          v-for="item in CHANNEL_TYPES.filter(type => type.value !== 'artist')"
          :key="item.value"
          v-bind="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="频道名称" prop="name">
      <el-input
        v-model="form.name"
        maxlength="20"
        show-word-limit
        placeholder="请输入频道名称"
      />
    </el-form-item>
    <p class="text-sm text-gray-500">
      升级后会创建新频道，该用户成为频道成员并获得频道管理员角色。
    </p>
  </el-form>
</template>
