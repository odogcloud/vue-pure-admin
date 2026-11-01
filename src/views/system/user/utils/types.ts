interface FormItemProps {
  id?: number;
  /** 用于判断是`新增`还是`修改` */
  title: string;
  roleOptions: { id: number; name: string }[];
  channelOptions: { id: number; name: string }[];
  roleId: number | null;
  channelIds: number[];
  nickname: string;
  username: string;
  password: string;
  phone: string | number;
  email: string;
  status: number;
  description: string;
}
interface FormProps {
  formInline: FormItemProps;
}

interface RoleFormItemProps {
  username: string;
  nickname: string;
  /** 角色列表 */
  roleOptions: any[];
  channelOptions: { id: number; name: string }[];
  /** 选中的角色 */
  roleId: number | null;
  /** 选中的频道 */
  channelIds: number[];
}
interface RoleFormProps {
  formInline: RoleFormItemProps;
}

export type { FormItemProps, FormProps, RoleFormItemProps, RoleFormProps };
