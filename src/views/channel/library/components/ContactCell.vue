<script setup lang="ts">
defineProps<{ row: any }>();
</script>

<template>
  <div class="text-left leading-6">
    <div>
      {{ row.contactName }} ({{
        row.submitType === "author" ? "作者" : "厂牌"
      }})
    </div>
    <div v-if="row.contactPhone">{{ row.contactPhone }}</div>
    <div v-if="row.contactEmail">{{ row.contactEmail }}</div>
  </div>
</template>
