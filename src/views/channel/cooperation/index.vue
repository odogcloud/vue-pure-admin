<script setup lang="ts">
import { ref } from "vue";
import List from "./List.vue";

defineOptions({
  name: "ChannelCooperation"
});

const activeTab = ref("confirm");
</script>

<template>
  <div class="main bg-bg_color m-6! p-5">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待确权" name="confirm" lazy>
        <List stage="confirm" />
      </el-tab-pane>
      <el-tab-pane label="待交易" name="trade" lazy>
        <List stage="trade" />
      </el-tab-pane>
      <el-tab-pane label="完成交易" name="done" lazy>
        <List stage="done" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
