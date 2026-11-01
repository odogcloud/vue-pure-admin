import { type ButtonProps, closeDialog } from "@/components/ReDialog";

const submit: ButtonProps["btnClick"] = ({ dialog: { options, index } }) => {
  options.beforeSure(() => closeDialog(options, index, { command: "sure" }), {
    options,
    index,
    closeLoading: () => {}
  });
};

/** 确定按钮在前、取消按钮在后的弹框底部 */
export const sureCancelButtons: ButtonProps[] = [
  { label: "确 定", type: "primary", btnClick: submit },
  {
    label: "取 消",
    btnClick: ({ dialog: { options, index } }) =>
      closeDialog(options, index, { command: "cancel" })
  }
];

/** 只有确定按钮的弹框底部 */
export const sureOnlyButtons: ButtonProps[] = [
  { label: "确定", type: "primary", btnClick: submit }
];
