<script setup lang="ts">
import { ref } from "vue";
import ApplyTab from "./apply.vue";
import MineTab from "./mine.vue";

defineOptions({
  name: "ChannelCustomer"
});

const activeTab = ref("apply");
</script>

<template>
  <div class="main bg-bg_color m-6! p-5">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="客户申请" name="apply" lazy>
        <ApplyTab />
      </el-tab-pane>
      <el-tab-pane label="我的客户" name="mine" lazy>
        <MineTab />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
