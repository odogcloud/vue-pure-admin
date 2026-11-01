<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  formInline: { weight: number };
}>();

const newFormInline = ref(props.formInline);
</script>

<template>
  <el-form :model="newFormInline" label-width="90px">
    <el-form-item label="推荐权重">
      <div class="w-full">
        <el-input-number
          v-model="newFormInline.weight"
          :min="0"
          placeholder="歌单内权重数值数值越大，显示越靠前"
          class="w-full!"
        />
        <div class="text-gray-500 text-sm mt-1">
          权重只作用于当前歌单，如需修改标签、歌曲推荐理由、视频...请前往【频道曲库】中进行修改
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>
