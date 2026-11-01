<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import dayjs from "dayjs";
import { useClipboard } from "@vueuse/core";
import type { FormInstance, FormRules } from "element-plus";
import { message } from "@/utils/message";
import {
  getApplyCode,
  getMyChannels,
  updateChannelName,
  type ApplyCode,
  type MyChannel
} from "@/api/channels";
import {
  getCurrentChannelId,
  removeCurrentChannelId,
  setCurrentChannelId
} from "@/utils/channel";

defineOptions({ name: "ChannelBar" });

const channels = ref<MyChannel[]>([]);
const currentId = ref<number>();
const current = computed(() =>
  channels.value.find(item => item.id === currentId.value)
);

const nameVisible = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({ name: "" });
const rules: FormRules = {
  name: [{ required: true, whitespace: true, message: "请输入频道名称" }]
};

const codeVisible = ref(false);
const applyCode = ref<ApplyCode>();
const expireText = computed(() =>
  applyCode.value
    ? dayjs(applyCode.value.expiresAt).format("YYYY-MM-DD HH:mm:ss")
    : ""
);
const { copy } = useClipboard({ legacy: true });

const errorText = (error: any) => error?.response?.data?.message ?? "操作失败";

/** 保存的频道已失效时改用第一个可用频道 */
const loadChannels = async () => {
  const { data } = await getMyChannels();
  channels.value = data ?? [];
  const stored = getCurrentChannelId();
  const active = channels.value.filter(item => item.status === "active");
  if (active.some(item => item.id === stored)) {
    currentId.value = stored;
    return;
  }
  const next = active[0];
  if (!next) {
    removeCurrentChannelId();
    return;
  }
  currentId.value = next.id;
  setCurrentChannelId(next.id);
  // 后端默认使用第一个频道，不一致时才需要重新加载数据
  if (stored != null || channels.value[0].id !== next.id) {
    window.location.reload();
  }
};

const onSwitch = (id: number) => {
  setCurrentChannelId(id);
  window.location.reload();
};

const openName = () => {
  form.name = current.value?.name ?? "";
  nameVisible.value = true;
};

const saveName = async () => {
  if (!(await formRef.value?.validate().catch(() => false))) return;
  saving.value = true;
  try {
    const name = form.name.trim();
    const res = await updateChannelName({ id: currentId.value, name });
    if (res.code !== 0) {
      message(res.message, { type: "error" });
      return;
    }
    current.value.name = name;
    nameVisible.value = false;
    message("修改成功", { type: "success" });
  } catch (error) {
    message(errorText(error), { type: "error" });
  } finally {
    saving.value = false;
  }
};

const openCode = async () => {
  try {
    const res = await getApplyCode({ id: currentId.value });
    if (res.code !== 0) {
      message(res.message, { type: "error" });
      return;
    }
    applyCode.value = res.data;
    codeVisible.value = true;
  } catch (error) {
    message(errorText(error), { type: "error" });
  }
};

const copyCode = async () => {
  await copy(applyCode.value.code);
  message("复制成功", { type: "success" });
};

onMounted(() => {
  loadChannels().catch(error => message(errorText(error), { type: "error" }));
});
</script>

<template>
  <div class="channel-bar">
    <span class="whitespace-nowrap">切换频道：</span>
    <el-select
      :model-value="currentId"
      class="channel-select"
      placeholder="暂无频道"
      @change="onSwitch"
    >
      <el-option
        v-for="item in channels"
        :key="item.id"
        :label="item.name"
        :value="item.id"
        :disabled="item.status !== 'active'"
      />
    </el-select>
    <template v-if="current">
      <el-button link type="primary" @click="openName">编辑</el-button>
      <span class="whitespace-nowrap">
        状态：{{ current.status === "active" ? "正常" : "已停用" }}
      </span>
      <el-button type="primary" plain @click="openCode">频道申请码</el-button>
    </template>

    <el-dialog
      v-model="nameVisible"
      title="编辑频道名称"
      width="460px"
      append-to-body
      draggable
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="频道名称" prop="name">
          <el-input
            v-model="form.name"
            maxlength="20"
            show-word-limit
            placeholder="请输入频道名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="saving" @click="saveName">
          确 定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="codeVisible"
      title="频道申请码"
      width="460px"
      append-to-body
      draggable
    >
      <el-form v-if="applyCode" label-width="100px">
        <el-form-item label="频道名称">{{ applyCode.name }}</el-form-item>
        <el-form-item label="频道申请码">{{ applyCode.code }}</el-form-item>
      </el-form>
      <p v-if="applyCode" class="channel-code-hint">
        该申请码有效期{{ applyCode.validDays }}天 将会在：{{
          expireText
        }}失效，需客户尽快使用 申请码加入频道
      </p>
      <template #footer>
        <el-button type="primary" @click="copyCode">复制申请码</el-button>
        <el-button @click="codeVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.channel-bar {
  float: left;
  display: flex;
  gap: 12px;
  align-items: center;
  height: 48px;
  margin-left: 24px;
  font-size: 14px;
  color: var(--el-text-color-regular);

  .el-button + .el-button {
    margin-left: 0;
  }
}

.channel-select {
  width: 180px;
}

.channel-code-hint {
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-color-danger);
}
</style>
