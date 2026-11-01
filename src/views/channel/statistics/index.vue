<script setup lang="ts">
import { ref } from "vue";
import Panel from "./Panel.vue";

defineOptions({
  name: "ChannelStatistics"
});

const activeTab = ref("customer");
</script>

<template>
  <div class="main bg-bg_color m-6! p-5">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="客户统计" name="customer" lazy>
        <Panel type="customer" />
      </el-tab-pane>
      <el-tab-pane label="频道用户统计" name="member" lazy>
        <Panel type="member" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
