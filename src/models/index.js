/*
 * Copy & paste from
 *   - web-ui/frontend/public/models/index.ts
 *   - web-ui/frontend/public/kubevirt/models/vm.ts
 *
 * TODO: we should find a way to avoid duplicating this code
 */

export const VirtualMachineModel = {
  label: 'Virtual Machine',
  labelPlural: 'Virtual Machines',
  apiVersion: 'v1alpha3',
  path: 'virtualmachines',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachines',
  abbr: 'VM',
  namespaced: true,
  kind: 'VirtualMachine',
  id: 'virtualmachine',
};

export const BaremetalHostModel = {
  label: 'Bare Metal Host',
  labelPlural: 'Bare Metal Hosts',
  apiVersion: 'v1alpha1',
  path: 'baremetalhosts',
  apiGroup: 'metalkube.org',
  plural: 'baremetalhosts',
  abbr: 'BMH',
  namespaced: true,
  kind: 'BareMetalHost',
  id: 'baremetalhost',
};

export const ProcessedTemplatesModel = {
  apiVersion: 'v1',
  path: 'processedtemplates',
  apiGroup: 'template.openshift.io',
  namespaced: true,
};

export const VirtualMachineInstanceMigrationModel = {
  label: 'Virtual Machine Instance Migration',
  labelPlural: 'Virtual Machine Instance Migrations',
  apiVersion: 'v1alpha3',
  path: 'virtualmachineinstancemigrations',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachineinstancemigrations',
  abbr: 'VMIM',
  namespaced: true,
  kind: 'VirtualMachineInstanceMigration',
  id: 'virtualmachineinstancemigration',
};

export const PodModel = {
  apiVersion: 'v1',
  label: 'Pod',
  path: 'pods',
  plural: 'pods',
  abbr: 'P',
  namespaced: true,
  kind: 'Pod',
  id: 'pod',
  labelPlural: 'Pods',
};

export const ServiceModel = {
  apiVersion: 'v1',
  label: 'Service',
  path: 'services',
  plural: 'services',
  abbr: 'S',
  namespaced: true,
  kind: 'Service',
  id: 'service',
  labelPlural: 'Services',
};

export const RouteModel = {
  label: 'Route',
  labelPlural: 'Routes',
  apiGroup: 'route.openshift.io',
  apiVersion: 'v1',
  path: 'routes',
  plural: 'routes',
  abbr: 'RT',
  namespaced: true,
  kind: 'Route',
  id: 'route',
};

export const TemplateModel = {
  label: 'Template',
  labelPlural: 'Templates',
  apiVersion: 'v1',
  path: 'templates',
  apiGroup: 'template.openshift.io',
  plural: 'templates',
  namespaced: true,
  abbr: 'Template',
  kind: 'Template',
  id: 'template',
};

export const PersistentVolumeClaimModel = {
  label: 'Persistent Volume Claim',
  apiVersion: 'v1',
  path: 'persistentvolumeclaims',
  plural: 'persistentvolumeclaims',
  abbr: 'PVC',
  namespaced: true,
  kind: 'PersistentVolumeClaim',
  id: 'persistentvolumeclaim',
  labelPlural: 'Persistent Volume Claims',
};

export const DataVolumeModel = {
  label: 'Data Volume',
  labelPlural: 'Data Volumes',
  apiVersion: 'v1alpha1',
  path: 'datavolumes',
  apiGroup: 'cdi.kubevirt.io',
  plural: 'datavolumes',
  abbr: 'DV',
  namespaced: true,
  kind: 'DataVolume',
  id: 'datavolume',
  crd: true,
};

export const NamespaceModel = {
  apiVersion: 'v1',
  label: 'Namespace',
  path: 'namespaces',
  plural: 'namespaces',
  abbr: 'NS',
  kind: 'Namespace',
  id: 'namespace',
  labelPlural: 'Namespaces',
};

export const ProjectModel = {
  apiVersion: 'v1',
  apiGroup: 'project.openshift.io',
  label: 'Project',
  path: 'projects',
  plural: 'projects',
  abbr: 'PR',
  kind: 'Project',
  id: 'project',
  labelPlural: 'Projects',
};

export const SecretModel = {
  apiVersion: 'v1',
  label: 'Secret',
  path: 'secrets',
  plural: 'secrets',
  abbr: 'S',
  namespaced: true,
  kind: 'Secret',
  id: 'secret',
  labelPlural: 'Secrets',
};

export const V2VVMwareModel = {
  label: 'V2V VMWare Provider',
  labelPlural: 'V2V VMWare Providers',
  apiVersion: 'v1alpha1',
  path: 'v2vvmwares',
  apiGroup: 'kubevirt.io',
  plural: 'v2vvmwares',
  abbr: 'v2vVmw',
  namespaced: true,
  kind: 'V2VVmware',
  id: 'v2vvmware',
};

export const DeploymentModel = {
  label: 'Deployment',
  apiVersion: 'v1',
  path: 'deployments',
  apiGroup: 'apps',
  plural: 'deployments',
  abbr: 'D',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'Deployment',
  id: 'deployment',
  labelPlural: 'Deployments',
};

export const ServiceAccountModel = {
  apiVersion: 'v1',
  label: 'Service Account',
  path: 'serviceaccounts',
  plural: 'serviceaccounts',
  abbr: 'SA',
  namespaced: true,
  kind: 'ServiceAccount',
  id: 'serviceaccount',
  labelPlural: 'Service Accounts',
};

export const RoleModel = {
  label: 'Role',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1',
  path: 'roles',
  plural: 'roles',
  abbr: 'R',
  namespaced: true,
  kind: 'Role',
  id: 'role',
  labelPlural: 'Roles',
};

export const RoleBindingModel = {
  label: 'Role Binding',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1',
  path: 'rolebindings',
  plural: 'rolebindings',
  abbr: 'RB',
  namespaced: true,
  kind: 'RoleBinding',
  id: 'rolebinding',
  labelPlural: 'Role Bindings',
};

export const ConfigMapModel = {
  apiVersion: 'v1',
  label: 'Config Map',
  path: 'configmaps',
  plural: 'configmaps',
  abbr: 'CM',
  namespaced: true,
  kind: 'ConfigMap',
  id: 'configmap',
  labelPlural: 'Config Maps',
};
