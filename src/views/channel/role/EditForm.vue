<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  formInline: { id?: number; name: string; remark: string };
}>();

const ruleFormRef = ref();
const form = ref(props.formInline);
const rules = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }]
};

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="form"
    :rules="rules"
    label-width="82px"
    class="channel-dialog-form"
  >
    <el-form-item label="角色名称" prop="name">
      <el-input
        v-model="form.name"
        maxlength="20"
        show-word-limit
        placeholder="请输入角色名称"
      />
    </el-form-item>
    <el-form-item label="备注">
      <el-input
        v-model="form.remark"
        type="textarea"
        maxlength="50"
        show-word-limit
        placeholder="请输入备注信息"
      />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" src="../library/utils/search.scss"></style>
