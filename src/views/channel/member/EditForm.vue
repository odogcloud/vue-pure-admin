<script setup lang="ts">
import { ref } from "vue";

const NO_ROLE = "none";

const props = defineProps<{
  formInline: { roleId: number | typeof NO_ROLE };
  memberName: string;
  roles: Array<{ id: number; name: string }>;
}>();

const form = ref(props.formInline);
</script>

<template>
  <el-form :model="form" label-position="top" class="channel-dialog-form">
    <div class="mb-4">
      <b class="mr-3">频道成员:</b>
      <span>{{ memberName }}</span>
    </div>
    <el-form-item label="成员角色" required>
      <el-select v-model="form.roleId" class="w-full">
        <el-option
          v-for="item in roles"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
        <el-option label="无" :value="NO_ROLE" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" src="../library/utils/search.scss"></style>
