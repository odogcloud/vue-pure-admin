<script setup lang="ts">
import { onMounted, ref } from "vue";
import { message } from "@/utils/message";
import { hasPerms } from "@/utils/auth";
import {
  addCompanyMember,
  getCompanyMembers,
  removeCompanyMember
} from "@/api/company";

const props = defineProps<{ companyId: number }>();

const STATUS_TEXT = { active: "正常", disabled: "已停用", pending: "待激活" };

const canWrite = hasPerms("company:write");
const members = ref([]);
const loading = ref(false);
const username = ref("");

const load = async () => {
  loading.value = true;
  try {
    const { data } = await getCompanyMembers({ id: props.companyId });
    members.value = data ?? [];
  } finally {
    loading.value = false;
  }
};

const onAdd = async () => {
  const { code, message: text } = await addCompanyMember({
    id: props.companyId,
    username: username.value
  });
  if (code !== 0) {
    message(text, { type: "error" });
    return;
  }
  username.value = "";
  message("添加成功", { type: "success" });
  load();
};

const onRemove = async row => {
  const { code, message: text } = await removeCompanyMember({
    id: props.companyId,
    userId: row.id
  });
  if (code !== 0) {
    message(text, { type: "error" });
    return;
  }
  message("移除成功", { type: "success" });
  load();
};

onMounted(load);
</script>

<template>
  <div>
    <div v-if="canWrite" class="flex gap-2 mb-3">
      <el-input
        v-model="username"
        clearable
        placeholder="请输入完整的用户名称"
        @keyup.enter="onAdd"
      />
      <el-button type="primary" :disabled="!username.trim()" @click="onAdd">
        添加成员
      </el-button>
    </div>
    <el-table v-loading="loading" :data="members" border max-height="360">
      <el-table-column prop="username" label="用户名称" min-width="120" />
      <el-table-column prop="nickname" label="用户昵称" min-width="100" />
      <el-table-column label="角色" min-width="110">
        <template #default="{ row }">{{ row.roleName ?? "无角色" }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">{{ STATUS_TEXT[row.status] }}</template>
      </el-table-column>
      <el-table-column v-if="canWrite" label="操作" width="70">
        <template #default="{ row }">
          <el-popconfirm
            :title="`确认移除 ${row.username} 吗？`"
            @confirm="onRemove(row)"
          >
            <template #reference>
              <el-button link type="danger">移除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
