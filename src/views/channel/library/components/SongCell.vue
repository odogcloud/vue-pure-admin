<script setup lang="ts">
defineProps<{ row: any }>();
</script>

<template>
  <div class="text-left leading-6">
    <div class="truncate text-primary" :title="row.name">{{ row.name }}</div>
    <div :class="row.released ? 'text-green-500' : 'text-orange-400'">
      ({{ row.released ? "已发行" : "未发行" }})
    </div>
    <div class="truncate">词：{{ row.lyricist || "-" }}</div>
    <div class="truncate">曲：{{ row.composer || "-" }}</div>
    <div>合作类型：{{ row.cooperationTypes?.join("、") || "-" }}</div>
  </div>
</template>
