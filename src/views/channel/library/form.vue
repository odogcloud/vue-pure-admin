<script setup lang="ts">
import { ref } from "vue";

type SongForm = {
  id: number;
  name: string;
  tags: string;
  reason: string;
  videoUrl: string;
};

const props = defineProps<{ formInline: SongForm }>();

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form ref="ruleFormRef" :model="newFormInline" label-width="110px">
    <el-form-item label="作品名称">
      <el-input v-model="newFormInline.name" disabled />
    </el-form-item>

    <el-form-item label="自定义标签">
      <el-input
        v-model="newFormInline.tags"
        clearable
        placeholder="请输入自定义标签"
      />
    </el-form-item>

    <el-form-item label="歌曲推荐理由">
      <el-input
        v-model="newFormInline.reason"
        type="textarea"
        placeholder="请输入歌曲推荐理由"
      />
    </el-form-item>

    <el-form-item label="视频链接">
      <el-input
        v-model="newFormInline.videoUrl"
        clearable
        placeholder="请输入视频链接"
      />
    </el-form-item>
  </el-form>
</template>
