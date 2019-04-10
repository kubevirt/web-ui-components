import { RoleModel } from '../../../../models';

export const buildV2VRole = ({ namespace }) => ({
  apiVersion: `${RoleModel.apiGroup}/${RoleModel.apiVersion}`,
  kind: RoleModel.kind,
  metadata: {
    creationTimestamp: null,
    namespace,
    generateName: 'kubevirt-v2v-conversion-',
  },
  rules: [
    {
      apiGroups: [''],
      resources: ['pods'],
      verbs: ['patch', 'get'],
    },
    {
      apiGroups: ['security.openshift.io'],
      resources: ['securitycontextconstraints'],
      verbs: ['*'],
    },
  ],
});
