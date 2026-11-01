import "./reset.css";
import dayjs from "dayjs";
import roleForm from "../form/role.vue";
import editForm from "../form/index.vue";
import { message } from "@/utils/message";
import userAvatar from "@/assets/user.jpg";
import { usePublicHooks } from "../../hooks";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { hasPerms } from "@/utils/auth";
import type { FormItemProps, RoleFormItemProps } from "../utils/types";
import {
  getKeyList,
  isAllEmpty,
  hideTextAtIndex,
  deviceDetection
} from "@pureadmin/utils";
import {
  assignUser,
  createUser,
  deleteUsers,
  getUserList,
  getUserOptions,
  resetUserPassword,
  updateUser,
  updateUserStatus
} from "@/api/system";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElProgress,
  ElMessageBox
} from "element-plus";
import {
  type Ref,
  h,
  ref,
  toRaw,
  watch,
  computed,
  reactive,
  onMounted
} from "vue";

export function useUser(tableRef: Ref) {
  const form = reactive({
    username: "",
    phone: "",
    status: ""
  });
  const formRef = ref();
  const ruleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const canWrite = computed(() => hasPerms("user:write"));
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "用户编号",
      prop: "id",
      width: 90
    },
    {
      label: "用户头像",
      prop: "avatar",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.avatar || userAvatar}
          preview-src-list={Array.of(row.avatar || userAvatar)}
          class="size-6 rounded-full align-middle"
        />
      ),
      width: 90
    },
    {
      label: "用户名称",
      prop: "username",
      minWidth: 130
    },
    {
      label: "用户昵称",
      prop: "nickname",
      minWidth: 130
    },
    {
      label: "角色",
      prop: "roleName",
      minWidth: 110,
      formatter: ({ roleName }) => roleName ?? "无角色"
    },
    {
      label: "所属频道",
      prop: "channelNames",
      minWidth: 130,
      formatter: ({ channelNames }) => channelNames.join("、") || "-"
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 90,
      formatter: ({ phone }) =>
        phone ? hideTextAtIndex(phone, { start: 3, end: 6 }) : "-"
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          disabled={!canWrite.value}
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "创建时间",
      minWidth: 90,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "h-5!",
      "reset-margin",
      "text-gray-500!",
      "dark:text-white!",
      "dark:hover:text-primary!"
    ];
  });
  // 重置的新密码
  const pwdForm = reactive({
    newPwd: ""
  });
  const pwdProgress = [
    { color: "#e74242", text: "非常弱" },
    { color: "#EFBD47", text: "弱" },
    { color: "#ffa500", text: "一般" },
    { color: "#1bbf1b", text: "强" },
    { color: "#008000", text: "非常强" }
  ];
  // 当前密码强度（0-4）
  const curScore = ref();
  const roleOptions = ref([]);
  const channelOptions = ref([]);
  const zxcvbnFactory = new ZxcvbnFactory();

  /** 调用接口并提示结果，成功返回 true */
  async function runAction(
    action: () => Promise<{ code: number; message: string }>,
    success: string
  ) {
    try {
      const { code, message: text } = await action();
      if (code !== 0) {
        message(text, { type: "error" });
        return false;
      }
      message(success, { type: "success" });
      return true;
    } catch (error: any) {
      message(error?.response?.data?.message ?? "操作失败", { type: "error" });
      return false;
    }
  }

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.username
      }</strong>用户吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        switchLoadMap.value[index] = { loading: true };
        const done = await runAction(
          () =>
            updateUserStatus({
              id: row.id,
              status: row.status === 1 ? "active" : "disabled"
            }),
          "已成功修改用户状态"
        );
        switchLoadMap.value[index] = { loading: false };
        if (!done) row.status = row.status === 0 ? 1 : 0;
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  async function handleDelete(row) {
    const done = await runAction(
      () => deleteUsers({ ids: [row.id] }),
      "删除成功"
    );
    if (done) onSearch();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  async function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    const done = await runAction(
      () => deleteUsers({ ids: getKeyList(curSelected, "id") }),
      "删除成功"
    );
    if (!done) return;
    tableRef.value.getTableRef().clearSelection();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    try {
      const {
        code,
        data,
        message: text
      } = await getUserList({
        ...toRaw(form),
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage
      });
      if (code === 0) {
        dataList.value = data.list.map(row => ({
          ...row,
          // 开关只有启用和停用，待激活显示为停用
          status: row.status === "active" ? 1 : 0
        }));
        pagination.total = data.total;
        pagination.pageSize = data.pageSize;
        pagination.currentPage = data.currentPage;
      } else {
        message(text, { type: "error" });
      }
    } catch (error: any) {
      message(error?.response?.data?.message ?? "查询失败", { type: "error" });
    }

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    pagination.currentPage = 1;
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          title,
          id: row?.id,
          roleOptions: roleOptions.value,
          channelOptions: channelOptions.value,
          roleId: null,
          channelIds: [],
          nickname: row?.nickname ?? "",
          username: row?.username ?? "",
          password: "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          status: row?.status ?? 1,
          description: row?.description ?? ""
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done_, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        FormRef.validate(async valid => {
          if (!valid) return;
          const { nickname, username, phone, email, description } = curData;
          const profile = { nickname, username, phone, email, description };
          const done = await runAction(
            () =>
              title === "新增"
                ? createUser({
                    ...profile,
                    password: curData.password,
                    status: curData.status === 1 ? "active" : "disabled",
                    roleId: curData.roleId,
                    channelIds: curData.channelIds
                  })
                : updateUser({ ...profile, id: curData.id }),
            `${title}成功`
          );
          if (!done) return;
          done_();
          onSearch(); // 刷新表格数据
        });
      }
    });
  }

  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd)
        ? -1
        : zxcvbnFactory.check(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row) {
    addDialog({
      title: `重置 ${row.username} 用户的密码`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <>
          <ElForm ref={ruleFormRef} model={pwdForm}>
            <ElFormItem
              prop="newPwd"
              rules={[
                {
                  required: true,
                  message: "请输入新密码",
                  trigger: "blur"
                },
                {
                  pattern: /^[^\u4E00-\u9FA5]{8,18}$/,
                  message: "密码应为 8-18 位",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwd}
                placeholder="请输入新密码"
              />
            </ElFormItem>
          </ElForm>
          <div class="my-4 flex">
            {pwdProgress.map(({ color, text }, idx) => (
              <div
                class="w-[19vw]"
                style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
              >
                <ElProgress
                  striped
                  striped-flow
                  duration={curScore.value === idx ? 6 : 0}
                  percentage={curScore.value >= idx ? 100 : 0}
                  color={color}
                  stroke-width={10}
                  show-text={false}
                />
                <p
                  class="text-center"
                  style={{ color: curScore.value === idx ? color : "" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </>
      ),
      closeCallBack: () => (pwdForm.newPwd = ""),
      beforeSure: done => {
        ruleFormRef.value.validate(async valid => {
          if (!valid) return;
          const success = await runAction(
            () => resetUserPassword({ id: row.id, password: pwdForm.newPwd }),
            `已成功重置 ${row.username} 用户的密码`
          );
          if (success) done(); // 关闭弹框
        });
      }
    });
  }

  /** 分配角色和频道 */
  function handleRole(row) {
    addDialog({
      title: `分配 ${row.username} 用户的角色和频道`,
      props: {
        formInline: {
          username: row?.username ?? "",
          nickname: row?.nickname ?? "",
          roleOptions: roleOptions.value ?? [],
          channelOptions: channelOptions.value ?? [],
          roleId: row.roleId ?? null,
          channelIds: [...row.channelIds]
        }
      },
      width: "400px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: async (done, { options }) => {
        const curData = options.props.formInline as RoleFormItemProps;
        const success = await runAction(
          () =>
            assignUser({
              id: row.id,
              roleId: curData.roleId || null,
              channelIds: curData.channelIds
            }),
          "分配成功"
        );
        if (!success) return;
        done(); // 关闭弹框
        onSearch();
      }
    });
  }

  onMounted(async () => {
    onSearch();
    if (!canWrite.value) return;
    try {
      const { data } = await getUserOptions();
      roleOptions.value = data?.roles ?? [];
      channelOptions.value = data?.channels ?? [];
    } catch (error: any) {
      message(error?.response?.data?.message ?? "加载选项失败", {
        type: "error"
      });
    }
  });

  return {
    form,
    loading,
    columns,
    dataList,
    selectedNum,
    pagination,
    buttonClass,
    canWrite,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    handleDelete,
    handleReset,
    handleRole,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
