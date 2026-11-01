<script setup lang="ts">
import { ref } from "vue";
import { NOTIFY_TYPES } from "./types";

const props = defineProps<{
  formInline: { id?: number; name: string; email: string; types: string[] };
}>();

const ruleFormRef = ref();
const form = ref(props.formInline);
const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email" as const, message: "邮箱格式不正确", trigger: "blur" }
  ],
  types: [
    {
      type: "array" as const,
      required: true,
      min: 1,
      message: "请选择提醒",
      trigger: "change"
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
    label-width="70px"
    class="channel-dialog-form"
  >
    <el-form-item label="姓名" prop="name">
      <el-input v-model="form.name" placeholder="请输入姓名" maxlength="50" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item label="提醒" prop="types">
      <div class="w-full">
        <el-select
          v-model="form.types"
          multiple
          placeholder="请选择提醒"
          class="w-full"
        >
          <el-option
            v-for="item in NOTIFY_TYPES"
            :key="item.value"
            v-bind="item"
          />
        </el-select>
        <div class="notify-hint">添加后客户相关操作，会收到邮件提醒</div>
      </div>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
.notify-hint {
  margin-top: 4px;
  font-size: 12px;
  line-height: 20px;
  color: var(--el-text-color-secondary);
}
</style>

<style lang="scss" src="../library/utils/search.scss"></style>
