import { RoleBindingModel, RoleModel, ServiceAccountModel } from '../../../models';

export const buildServiceAccountRoleBinding = ({ name, generateName, namespace, serviceAccountName, roleName }) => ({
  apiVersion: `${RoleBindingModel.apiGroup}/${RoleBindingModel.apiVersion}`,
  kind: RoleBindingModel.kind,
  metadata: {
    namespace,
    generateName,
    name,
  },
  subjects: [
    {
      kind: ServiceAccountModel.kind,
      name: serviceAccountName,
    },
  ],
  roleRef: {
    kind: RoleModel.kind,
    name: roleName,
    apiGroup: RoleModel.apiGroup,
  },
});
