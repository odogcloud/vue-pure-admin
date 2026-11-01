/** 客户权限表单的校验规则 */
export const grantRules = {
  scope: [{ required: true, message: "请选择客户权限", trigger: "change" }],
  playlistIds: [
    {
      type: "array" as const,
      required: true,
      min: 1,
      message: "请选择分享的歌单",
      trigger: "change"
    }
  ],
  expireDate: [
    { required: true, message: "请选择分享截止时间", trigger: "change" }
  ]
};
