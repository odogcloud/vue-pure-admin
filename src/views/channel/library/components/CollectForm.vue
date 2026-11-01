<script setup lang="ts">
import { ref } from "vue";

type Playlist = { id: number; name: string };

const props = defineProps<{
  formInline: { playlistId: number | null };
  playlists: Playlist[];
  recents: Playlist[];
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
    label-width="120px"
  >
    <el-form-item label="最近加入的歌单">
      <div class="flex flex-wrap gap-2">
        <el-tag
          v-for="item in recents"
          :key="item.id"
          class="cursor-pointer"
          :effect="newFormInline.playlistId === item.id ? 'dark' : 'light'"
          @click="newFormInline.playlistId = item.id"
        >
          {{ item.name }}
        </el-tag>
        <span v-if="!recents.length" class="text-gray-500">-</span>
      </div>
    </el-form-item>

    <el-form-item label="选择收录的歌单" prop="playlistId">
      <el-select
        v-model="newFormInline.playlistId"
        placeholder="请选择"
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
