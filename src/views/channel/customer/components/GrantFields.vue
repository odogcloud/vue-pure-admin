<script setup lang="ts">
import dayjs from "dayjs";

export type Grant = {
  scope: "all" | "partial";
  playlistIds: number[];
  showCooperation: number;
  expireDate: string;
};

const model = defineModel<Grant>({ required: true });

defineProps<{
  playlists: Array<{ id: number; name: string }>;
}>();

const quickDates = [
  { label: "3天", add: [3, "day"] },
  { label: "7天", add: [7, "day"] },
  { label: "15天", add: [15, "day"] },
  { label: "30天", add: [30, "day"] },
  { label: "3个月", add: [3, "month"] }
] as const;

function setQuickDate(add: readonly [number, "day" | "month"]) {
  model.value.expireDate = dayjs().add(add[0], add[1]).format("YYYY-MM-DD");
}
</script>

<template>
  <el-form-item label="客户权限：" prop="scope" label-position="top">
    <el-radio-group v-model="model.scope">
      <el-radio value="all">全频道歌单/歌曲</el-radio>
      <el-radio value="partial">部分歌单</el-radio>
    </el-radio-group>
  </el-form-item>

  <el-form-item
    v-if="model.scope === 'partial'"
    label="选择分享的歌单："
    prop="playlistIds"
    label-position="top"
  >
    <el-select
      v-model="model.playlistIds"
      multiple
      placeholder="请选择分享的歌单"
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

  <el-form-item prop="showCooperation" required label-position="top">
    <template #label>
      <span>合作类型</span>
      <span class="grant-hint ml-2">
        设置客户是否可以看到，歌曲的”合作类型“信息
      </span>
    </template>
    <el-radio-group v-model="model.showCooperation">
      <el-radio :value="1">显示合作类型</el-radio>
      <el-radio :value="0">不显示合作类型</el-radio>
    </el-radio-group>
  </el-form-item>

  <el-form-item
    label="设置分享截止时间："
    prop="expireDate"
    label-position="top"
  >
    <div class="w-full">
      <div class="flex flex-wrap gap-2 mb-2">
        <el-tag
          v-for="item in quickDates"
          :key="item.label"
          class="cursor-pointer"
          @click="setQuickDate(item.add)"
        >
          {{ item.label }}
        </el-tag>
      </div>
      <el-date-picker
        v-model="model.expireDate"
        type="date"
        format="YYYY/MM/DD"
        value-format="YYYY-MM-DD"
        placeholder="请选择分享截止时间"
        class="w-full!"
      />
      <div class="grant-hint mt-2">
        截止时间当天，客户可以看到。超过截止时间后，客户将看不到频道歌单/歌曲
      </div>
    </div>
  </el-form-item>
</template>

<style lang="scss" scoped>
.grant-hint {
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  color: var(--el-text-color-secondary);
}
</style>
