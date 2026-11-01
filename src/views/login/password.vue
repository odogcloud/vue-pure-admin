<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FormInstance } from "element-plus";
import { message } from "@/utils/message";
import { activateAccount, resetPassword } from "@/api/user";
import { REGEXP_PWD } from "./utils/rule";

defineOptions({
  name: "PasswordToken"
});

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const isActivate = computed(() => route.name === "ActivateAccount");
const form = reactive({ password: "", repeatPassword: "" });
const rules = {
  password: [
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
        value === form.password
          ? callback()
          : callback(new Error("两次输入的密码不一致")),
      trigger: "blur"
    }
  ]
};

async function onSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  loading.value = true;
  try {
    const submit = isActivate.value ? activateAccount : resetPassword;
    const { code, message: msg } = await submit({
      token: route.params.token,
      password: form.password
    });
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    message("设置成功，请重新登录", { type: "success" });
    router.push("/login");
  } catch {
    message("请求失败，请稍后再试", { type: "error" });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex-c h-screen">
    <el-card class="w-100">
      <template #header>
        {{ isActivate ? "激活账号" : "重置密码" }}
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="form.password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="repeatPassword">
          <el-input v-model="form.repeatPassword" show-password />
        </el-form-item>
        <el-button
          type="primary"
          class="w-full"
          :loading="loading"
          @click="onSubmit"
        >
          确定
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>
