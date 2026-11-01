<script setup lang="ts">
import { ref } from "vue";
import { REGEXP_PWD } from "@/views/login/utils/rule";

const props = defineProps<{
  formInline: {
    oldPassword: string;
    newPassword: string;
    repeatPassword: string;
  };
}>();

const ruleFormRef = ref();
const form = ref(props.formInline);
const rules = {
  oldPassword: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
  newPassword: [
    {
      validator: (_rule, value, callback) =>
        REGEXP_PWD.test(value)
          ? callback()
          : callback(
              new Error("密码应为 8-18 位数字、字母、符号的任意两种组合")
            ),
      trigger: "blur"
    }
  ],
  repeatPassword: [
    {
      validator: (_rule, value, callback) =>
        value === form.value.newPassword
          ? callback()
          : callback(new Error("两次输入的密码不一致")),
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
  <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="90px">
    <el-form-item label="当前密码" prop="oldPassword">
      <el-input v-model="form.oldPassword" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="form.newPassword" show-password />
    </el-form-item>
    <el-form-item label="确认密码" prop="repeatPassword">
      <el-input v-model="form.repeatPassword" show-password />
    </el-form-item>
  </el-form>
</template>
