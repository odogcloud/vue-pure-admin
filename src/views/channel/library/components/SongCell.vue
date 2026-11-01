<script setup lang="ts">
defineProps<{ row: any }>();

const cooperationTips = [
  "授权：可授权现场表演、影视剧、综艺等，但不产生新的录音版本；",
  "重制：已发行的词曲（或者未发行的Demo）不转让，但是可以授权对方录制新的录音版本；",
  "改编：可以在原词曲上进行改编，比如重新填词；"
];
</script>

<template>
  <div class="text-left leading-6">
    <el-tooltip :content="row.name" placement="top">
      <el-link type="primary" underline="never" class="song-cell__name">
        {{ row.name }}
      </el-link>
    </el-tooltip>
    <span :class="row.released ? 'text-green-500' : 'text-orange-400'">
      ({{ row.released ? "已发行" : "未发行" }})
    </span>
    <div>
      <el-tooltip :content="row.lyricist || '-'" placement="top">
        <span class="song-cell__author">词：{{ row.lyricist || "-" }}</span>
      </el-tooltip>
      <el-tooltip :content="row.composer || '-'" placement="top">
        <span class="song-cell__author">曲：{{ row.composer || "-" }}</span>
      </el-tooltip>
    </div>
    <el-tooltip placement="top" popper-class="song-cell__tip">
      <template #content>
        <div v-for="tip in cooperationTips" :key="tip">{{ tip }}</div>
      </template>
      <div>合作类型：{{ row.cooperationTypes?.join("、") || "-" }}</div>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.song-cell__name {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;

  :deep(.el-link__inner) {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.song-cell__author {
  display: inline-block;
  max-width: 100%;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
}
</style>
