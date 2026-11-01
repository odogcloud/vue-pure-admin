<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  formInline: { id?: number; name: string; remark: string };
}>();

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const rules = {
  name: [{ required: true, message: "请输入歌单名称", trigger: "blur" }]
};

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="rules"
    label-width="82px"
  >
    <el-form-item label="歌单名称" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入歌单名称"
      />
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        placeholder="请输入备注"
      />
    </el-form-item>
  </el-form>
</template>
