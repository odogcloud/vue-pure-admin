<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import Motion from "../utils/motion";
import { message } from "@/utils/message";
import { forgotPassword } from "@/api/user";
import type { FormInstance } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Message from "~icons/ep/message";

const { t } = useI18n();
const loading = ref(false);
const ruleForm = reactive({ email: "" });
const ruleFormRef = ref<FormInstance>();
const rules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email" as const, message: "邮箱格式不正确", trigger: "blur" }
  ]
};

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  const valid = await formEl.validate().catch(() => false);
  if (!valid) return;
  loading.value = true;
  try {
    const { code, message: msg } = await forgotPassword({ ...ruleForm });
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    message("如果该邮箱已注册，重置链接将发送到邮箱", { type: "success" });
    onBack();
  } catch {
    message("请求失败，请稍后再试", { type: "error" });
  } finally {
    loading.value = false;
  }
};

function onBack() {
  useUserStoreHook().SET_CURRENTPAGE(0);
}
</script>

<template>
  <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" size="large">
    <Motion>
      <el-form-item prop="email">
        <el-input
          v-model="ruleForm.email"
          clearable
          placeholder="请输入注册邮箱"
          :prefix-icon="useRenderIcon(Message)"
        />
      </el-form-item>
    </Motion>

    <Motion :delay="100">
      <el-form-item>
        <el-button
          class="w-full"
          size="default"
          type="primary"
          :loading="loading"
          @click="onSubmit(ruleFormRef)"
        >
          发送重置链接
        </el-button>
      </el-form-item>
    </Motion>

    <Motion :delay="150">
      <el-form-item>
        <el-button class="w-full" size="default" @click="onBack">
          {{ t("login.pureBack") }}
        </el-button>
      </el-form-item>
    </Motion>
  </el-form>
</template>
