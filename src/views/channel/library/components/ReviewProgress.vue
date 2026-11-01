<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  row: {
    reviewStatus: string;
    reviewTime?: string | null;
    rejectReason?: string;
  };
}>();

type StepState = "done" | "current" | "failed" | "waiting";

/** 被平台拒绝时有平台审核时间，被公司拒绝时没有 */
const rejectedByPlatform = computed(() => Boolean(props.row.reviewTime));

const states = computed<StepState[]>(() => {
  switch (props.row.reviewStatus) {
    case "draft":
      return ["current", "waiting", "waiting"];
    case "company_pending":
      return ["done", "current", "waiting"];
    case "pending":
      return ["done", "done", "current"];
    case "approved":
      return ["done", "done", "done"];
    case "rejected":
      return rejectedByPlatform.value
        ? ["done", "done", "failed"]
        : ["done", "failed", "waiting"];
    default:
      return ["waiting", "waiting", "waiting"];
  }
});

const steps = computed(() =>
  ["提交", "公司审核", "平台审核"].map((label, index) => ({
    label,
    state: states.value[index]
  }))
);

const summary = computed(() => {
  switch (props.row.reviewStatus) {
    case "draft":
      return "草稿，尚未提交";
    case "company_pending":
      return "等待公司审核";
    case "pending":
      return "等待平台审核";
    case "approved":
      return "平台审核通过";
    case "rejected":
      return rejectedByPlatform.value ? "平台已拒绝" : "公司已拒绝";
    default:
      return "";
  }
});

const MARKS: Record<StepState, string> = {
  done: "✓",
  current: "●",
  failed: "✕",
  waiting: "○"
};
</script>

<template>
  <div class="review-progress">
    <div class="review-progress__steps">
      <span
        v-for="step in steps"
        :key="step.label"
        :class="['review-progress__step', `is-${step.state}`]"
      >
        {{ MARKS[step.state] }} {{ step.label }}
      </span>
    </div>
    <div class="review-progress__summary">{{ summary }}</div>
    <div v-if="row.rejectReason" class="review-progress__reason">
      拒绝原因：{{ row.rejectReason }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.review-progress {
  font-size: 12px;
  line-height: 20px;
}

.review-progress__steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0 8px;
}

.review-progress__step {
  white-space: nowrap;

  &.is-done {
    color: var(--el-color-success);
  }

  &.is-current {
    font-weight: 600;
    color: var(--el-color-warning);
  }

  &.is-failed {
    font-weight: 600;
    color: var(--el-color-danger);
  }

  &.is-waiting {
    color: var(--el-text-color-placeholder);
  }
}

.review-progress__summary {
  color: var(--el-text-color-regular);
}

.review-progress__reason {
  color: var(--el-color-danger);
}
</style>
