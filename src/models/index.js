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
  apiVersion: 'v1alpha2',
  path: 'virtualmachines',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachines',
  abbr: 'VM',
  namespaced: true,
  kind: 'VirtualMachine',
  id: 'virtualmachine',
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
  apiVersion: 'v1alpha2',
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
