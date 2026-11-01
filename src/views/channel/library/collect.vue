<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  formInline: { id: number; name: string; playlistId: number | null };
  playlists: Array<{ id: number; name: string }>;
}>();

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const rules = {
  playlistId: [{ required: true, message: "请选择歌单", trigger: "change" }]
};

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="rules"
    label-width="82px"
  >
    <el-form-item label="作品名称">
      <el-input v-model="newFormInline.name" disabled />
    </el-form-item>

    <el-form-item label="选择歌单" prop="playlistId">
      <el-select
        v-model="newFormInline.playlistId"
        placeholder="请选择歌单"
        class="w-full"
      >
        <el-option
          v-for="item in playlists"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
