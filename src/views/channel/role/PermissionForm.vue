<script setup lang="ts">
import { ref } from "vue";
import type { PermissionGroup } from "@/api/role";

const props = defineProps<{
  formInline: { permissions: string[] };
  groups: PermissionGroup[];
}>();

const form = ref(props.formInline);
</script>

<template>
  <el-checkbox-group v-model="form.permissions">
    <div
      v-for="group in groups"
      :key="group.label"
      class="flex-bc py-2 border-b border-gray-100"
    >
      <span class="font-bold">{{ group.label }}</span>
      <div>
        <el-checkbox
          v-for="item in group.items"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </el-checkbox>
      </div>
    </div>
  </el-checkbox-group>
</template>
