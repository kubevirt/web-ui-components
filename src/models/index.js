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
  id: 'virtualmachine'
};

export const ProcessedTemplatesModel = {
  apiVersion: 'v1',
  path: 'processedtemplates',
  apiGroup: 'template.openshift.io',
  namespaced: true
};
