<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  formInline: {
    nickname: string;
    username: string;
    password: string;
    phone: string;
    email: string;
    accountType: string;
    roleId: number | null;
  };
  roles: Array<{ id: number; name: string; assignable?: boolean }>;
}>();

const ruleFormRef = ref();
const form = ref(props.formInline);
const rules = {
  nickname: [{ required: true, message: "请输入成员昵称", trigger: "blur" }],
  username: [{ required: true, message: "请输入登录账号", trigger: "blur" }],
  password: [
    { required: true, message: "请输入登录密码", trigger: "blur" },
    {
      pattern: /^[^一-龥]{8,18}$/,
      message: "密码应为 8-18 位",
      trigger: "blur"
    }
  ],
  email: [
    { type: "email" as const, message: "邮箱格式不正确", trigger: "blur" }
  ]
};

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="90px">
    <el-form-item label="成员昵称" prop="nickname">
      <el-input
        v-model="form.nickname"
        maxlength="50"
        placeholder="请输入成员昵称"
      />
    </el-form-item>
    <el-form-item label="登录账号" prop="username">
      <el-input
        v-model="form.username"
        maxlength="100"
        placeholder="请输入登录账号"
      />
    </el-form-item>
    <el-form-item label="登录密码" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        show-password
        placeholder="8-18 位，至少包含数字、字母、符号中的两种"
      />
    </el-form-item>
    <el-form-item label="手机号码">
      <el-input
        v-model="form.phone"
        maxlength="30"
        placeholder="请输入手机号码"
      />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item label="成员类型">
      <el-radio-group v-model="form.accountType">
        <el-radio value="member">成员</el-radio>
        <el-radio value="artist">艺人</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="用户角色">
      <el-select
        v-model="form.roleId"
        clearable
        placeholder="不选择时只能新增和提交自己的歌曲"
        class="w-full"
      >
        <el-option
          v-for="item in roles.filter(role => role.assignable)"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
