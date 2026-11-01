<script setup lang="ts">
import { h, ref } from "vue";
import { message } from "@/utils/message";
import { setToken } from "@/utils/auth";
import { changePassword } from "@/api/user";
import { addDialog } from "@/components/ReDialog";
import { deviceDetection } from "@pureadmin/utils";
import PasswordForm from "./PasswordForm.vue";

defineOptions({
  name: "AccountManagement"
});

const formRef = ref();

function openPasswordDialog() {
  addDialog({
    title: "修改密码",
    width: "480px",
    draggable: true,
    closeOnClickModal: false,
    props: {
      formInline: { oldPassword: "", newPassword: "", repeatPassword: "" }
    },
    contentRenderer: () => h(PasswordForm, { ref: formRef, formInline: null }),
    beforeSure: (done, { options }) => {
      formRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const { oldPassword, newPassword } = options.props.formInline as {
          oldPassword: string;
          newPassword: string;
        };
        const result = await changePassword({ oldPassword, newPassword });
        if (result.code !== 0) {
          message(result.message, { type: "error" });
          return;
        }
        // 修改密码后旧令牌全部失效，换成新令牌
        setToken(result.data as any);
        message("密码修改成功", { type: "success" });
        done();
      });
    }
  });
}
</script>

<template>
  <div :class="['min-w-45', deviceDetection() ? 'max-w-full' : 'max-w-[70%]']">
    <h3 class="my-8!">账户管理</h3>
    <div class="flex items-center">
      <div class="flex-1">
        <p>账户密码</p>
        <el-text class="mx-1" type="info">定期修改密码可保护账户安全</el-text>
      </div>
      <el-button type="primary" text @click="openPasswordDialog">
        修改
      </el-button>
    </div>
    <el-divider />
  </div>
</template>

<style lang="scss" scoped>
.el-divider--horizontal {
  border-top: 0.1px var(--el-border-color) var(--el-border-style);
}
</style>
