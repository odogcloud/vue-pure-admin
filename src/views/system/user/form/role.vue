<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { RoleFormProps } from "../utils/types";

const props = withDefaults(defineProps<RoleFormProps>(), {
  formInline: () => ({
    username: "",
    nickname: "",
    roleOptions: [],
    channelOptions: [],
    roleId: null,
    channelIds: []
  })
});

const newFormInline = ref(props.formInline);
</script>

<template>
  <el-form :model="newFormInline">
    <el-row :gutter="30">
      <!-- <re-col>
        <el-form-item label="用户名称" prop="username">
          <el-input disabled v-model="newFormInline.username" />
        </el-form-item>
      </re-col> -->
      <re-col>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="newFormInline.nickname" disabled />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="用户角色" prop="roleId">
          <el-select
            v-model="newFormInline.roleId"
            placeholder="无角色"
            class="w-full"
            clearable
          >
            <el-option
              v-for="(item, index) in newFormInline.roleOptions"
              :key="index"
              :value="item.id"
              :label="item.name"
            >
              {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="所属频道" prop="channelIds">
          <el-select
            v-model="newFormInline.channelIds"
            placeholder="请选择"
            class="w-full"
            clearable
            multiple
          >
            <el-option
              v-for="item in newFormInline.channelOptions"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
