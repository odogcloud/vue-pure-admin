<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import { setToken } from "@/utils/auth";
import { addDialog } from "@/components/ReDialog";
import { useUserStoreHook } from "@/store/modules/user";
import { changePassword, getMine, updateMine } from "@/api/user";
import PasswordForm from "@/views/account-settings/components/PasswordForm.vue";
import { sureCancelButtons } from "../library/utils/dialog";
import FieldForm from "./FieldForm.vue";

defineOptions({
  name: "ChannelProfile"
});

const fieldFormRef = ref();
const passwordFormRef = ref();
const loading = ref(true);
const profile = reactive({
  avatar: "",
  username: "",
  nickname: "",
  email: "",
  phone: "",
  description: ""
});

/** 邮箱只显示前 3 位和域名 */
const maskedEmail = computed(() => {
  const [name, domain] = profile.email.split("@");
  if (!domain) return "-";
  return `${name.slice(0, 3)}****@${domain}`;
});

async function load() {
  loading.value = true;
  try {
    const { code, data } = await getMine();
    if (code === 0) Object.assign(profile, data);
  } finally {
    loading.value = false;
  }
}

function openField(
  title: string,
  label: string,
  field: "nickname" | "phone",
  maxlength: number
) {
  addDialog({
    title,
    width: "480px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: { value: profile[field] }
    },
    contentRenderer: () =>
      h(FieldForm, {
        ref: fieldFormRef,
        formInline: null,
        label,
        maxlength,
        required: field === "nickname"
      }),
    beforeSure: (done, { options }) => {
      fieldFormRef.value.getRef().validate(async valid => {
        if (!valid) return;
        const { value } = options.props.formInline as { value: string };
        const { username: _username, ...rest } = profile;
        const result = await updateMine({ ...rest, [field]: value.trim() });
        if (result.code !== 0) {
          message(result.message, { type: "error" });
          return;
        }
        profile[field] = value.trim();
        if (field === "nickname") {
          useUserStoreHook().SET_NICKNAME(profile.nickname);
        }
        message("修改成功", { type: "success" });
        done();
      });
    }
  });
}

function openPassword() {
  addDialog({
    title: "修改密码",
    width: "480px",
    draggable: true,
    closeOnClickModal: false,
    footerButtons: sureCancelButtons,
    props: {
      formInline: { oldPassword: "", newPassword: "", repeatPassword: "" }
    },
    contentRenderer: () =>
      h(PasswordForm, { ref: passwordFormRef, formInline: null }),
    beforeSure: (done, { options }) => {
      passwordFormRef.value.getRef().validate(async valid => {
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

onMounted(load);
</script>

<template>
  <div v-loading="loading" class="main bg-bg_color m-6! p-8">
    <div class="profile-row">
      <span class="profile-row__label">用户名</span>
      <span class="profile-row__value">{{ profile.nickname || "-" }}</span>
      <el-button
        link
        type="primary"
        @click="openField('修改用户名', '用户名', 'nickname', 50)"
      >
        编辑
      </el-button>
    </div>
    <div class="profile-row">
      <span class="profile-row__label">登录邮箱</span>
      <span class="profile-row__value">{{ maskedEmail }}</span>
    </div>
    <div class="profile-row">
      <span class="profile-row__label">登录密码</span>
      <span class="profile-row__value">******</span>
      <el-button link type="primary" @click="openPassword">编辑</el-button>
    </div>
    <div class="profile-row">
      <span class="profile-row__label">手机号</span>
      <span class="profile-row__value">{{ profile.phone || "-" }}</span>
      <el-button
        link
        type="primary"
        @click="openField('修改手机号', '手机号', 'phone', 30)"
      >
        编辑
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-row {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &__label {
    width: 90px;
    font-weight: 700;
  }

  &__value {
    min-width: 240px;
  }
}
</style>
