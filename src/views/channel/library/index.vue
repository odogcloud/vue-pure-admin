<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import SongTab from "./song/index.vue";
import PlaylistTab from "./playlist/index.vue";

defineOptions({
  name: "ChannelLibrary"
});

const route = useRoute();
const activeTab = ref(route.query.tab === "playlist" ? "playlist" : "song");
</script>

<template>
  <div class="main bg-bg_color m-6! p-5">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="频道曲库" name="song" lazy>
        <SongTab />
      </el-tab-pane>
      <el-tab-pane label="频道歌单" name="playlist" lazy>
        <PlaylistTab />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
