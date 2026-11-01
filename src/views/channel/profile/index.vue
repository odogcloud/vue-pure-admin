<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import { setToken } from "@/utils/auth";
import { addDialog } from "@/components/ReDialog";
import { useUserStoreHook } from "@/store/modules/user";
import { changePassword, getMine, updateMine } from "@/api/user";
import PasswordForm from "@/views/account-settings/components/PasswordForm.vue";
import { sureCancelButtons } from "../library/utils/dialog";

defineOptions({
  name: "ChannelProfile"
});

const passwordFormRef = ref();
const loading = ref(true);
const editingName = ref(false);
const savingName = ref(false);
const nameInput = ref("");
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

function startEditName() {
  nameInput.value = profile.nickname;
  editingName.value = true;
}

async function saveName() {
  const nickname = nameInput.value.trim();
  if (!nickname) {
    message("请输入用户名", { type: "warning" });
    return;
  }
  savingName.value = true;
  try {
    const { username: _username, ...rest } = profile;
    const result = await updateMine({ ...rest, nickname });
    if (result.code !== 0) {
      message(result.message, { type: "error" });
      return;
    }
    profile.nickname = nickname;
    useUserStoreHook().SET_NICKNAME(nickname);
    editingName.value = false;
    message("修改成功", { type: "success" });
  } finally {
    savingName.value = false;
  }
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
      <div>
        <template v-if="editingName">
          <el-input
            v-model="nameInput"
            maxlength="50"
            class="profile-row__input"
            @keydown.enter.prevent="saveName"
          />
          <div>
            <el-button
              link
              type="primary"
              :loading="savingName"
              @click="saveName"
            >
              确定
            </el-button>
          </div>
        </template>
        <template v-else>
          <div>{{ profile.nickname || "-" }}</div>
          <el-button link type="primary" @click="startEditName">编辑</el-button>
        </template>
      </div>
    </div>
    <div class="profile-row">
      <span class="profile-row__label">登录邮箱</span>
      <div>{{ maskedEmail }}</div>
    </div>
    <div class="profile-row">
      <span class="profile-row__label">登录密码</span>
      <div>
        <div>******</div>
        <el-button link type="primary" @click="openPassword">编辑</el-button>
      </div>
    </div>
    <div class="profile-row">
      <span class="profile-row__label">手机号</span>
      <div>{{ profile.phone }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px 0;
  line-height: 24px;

  &__label {
    width: 90px;
    font-weight: 700;
    text-align: right;
  }

  &__input {
    width: 240px;
  }
}
</style>
