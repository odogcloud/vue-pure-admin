<script setup lang="ts">
import { ref } from "vue";

type Playlist = { id: number; name: string };

const props = defineProps<{
  formInline: { playlistIds: number[] };
  playlists: Playlist[];
  recents: Playlist[];
}>();

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const rules = {
  playlistIds: [
    {
      type: "array" as const,
      required: true,
      min: 1,
      message: "请选择歌单",
      trigger: "change"
    }
  ]
};

function toggleRecent(id: number) {
  const ids = newFormInline.value.playlistIds;
  newFormInline.value.playlistIds = ids.includes(id)
    ? ids.filter(item => item !== id)
    : [...ids, id];
}

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
    class="channel-dialog-form"
  >
    <el-form-item label="最近加入的歌单">
      <div class="flex flex-wrap gap-2">
        <el-tag
          v-for="item in recents"
          :key="item.id"
          class="cursor-pointer"
          :effect="
            newFormInline.playlistIds.includes(item.id) ? 'dark' : 'light'
          "
          @click="toggleRecent(item.id)"
        >
          {{ item.name }}
        </el-tag>
        <span v-if="!recents.length" class="text-gray-500">-</span>
      </div>
    </el-form-item>

    <el-form-item label="选择收录的歌单" prop="playlistIds">
      <el-select
        v-model="newFormInline.playlistIds"
        multiple
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

<style lang="scss" src="../utils/search.scss"></style>
