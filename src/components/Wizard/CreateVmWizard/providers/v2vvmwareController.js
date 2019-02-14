import { DeploymentModel, RoleModel, ServiceAccountModel, RoleBindingModel } from '../../../../models';
import { V2VVMWARE_DEPLOYMENT_NAME } from '../constants';

const rejectLogger = title => reason => console.log(`Failed to create ${title}, reason`, reason);

// The controller is namespace-scoped, especially due to security reasons
// Let's make sure its started within the desired namespace (which is not by default).
// The V2VVmware CRD is expected to be already created within the cluster (by Web UI installation)
export const startV2VVMWareController = async ({ k8sCreate, k8sGet, namespace }) => {
  try {
    await k8sGet(DeploymentModel, V2VVMWARE_DEPLOYMENT_NAME, namespace);
  } catch { // Deployment does not exist
    console.info('V2V VMWare controller deployment not found, so creating one ...');
    const params = { k8sCreate, namespace };

    createServiceAccount(params).then(undefined, rejectLogger('Service Account'));
    createRole(params).then(undefined, rejectLogger('Role'));
    createRoleBinding(params).then(undefined, rejectLogger('Role Binding'));
    createOperator(params).then(undefined, rejectLogger('V2V VMWare controller'));
  }
};

const createServiceAccount = ({ k8sCreate, namespace }) => {
  return k8sCreate(ServiceAccountModel, {
    apiVersion: ServiceAccountModel.apiVersion,
    kind: ServiceAccountModel.kind,
    metadata: {
      name: V2VVMWARE_DEPLOYMENT_NAME,
      namespace,
    }
  });
};

const createRole = ({ k8sCreate, namespace }) => {
  return k8sCreate(RoleModel, {
    apiVersion: `${RoleModel.apiGroup}/${RoleModel.apiVersion}`,
    kind: RoleModel.kind,
    metadata: {
      name: V2VVMWARE_DEPLOYMENT_NAME,
      namespace,
    },
    rules: [
      {
        apiGroups: [''],
        attributeRestrictions: null,
        resources: [ // TODO: review what's really needed
          'configmaps',
          'endpoints',
          'events',
          'persistentvolumeclaims',
          'pods',
          'secrets',
          'services'
        ],
        verbs: ['*'],
      },
      {
        apiGroups: [''],
        attributeRestrictions: null,
        resources: ['namespaces'],
        verbs: ['get']
      },
      {
        apiGroups: ['apps'],
        attributeRestrictions: null,
        resources: [
          'daemonsets',
          'deployments',
          'replicasets',
          'statefulsets'
        ],
        verbs: ['*']
      },
      {
        apiGroups: ['monitoring.coreos.com'],
        attributeRestrictions: null,
        resources: ['servicemonitors'],
        verbs: [
          'create',
          'get'
        ]
      },
      {
        apiGroups: ['kubevirt.io'],
        attributeRestrictions: null,
        resources: ['*'],
        verbs: ['*']
      }
    ]
  });
};

const createRoleBinding = ({ k8sCreate, namespace }) => {
  return k8sCreate(RoleBindingModel, {
    kind: RoleBindingModel.kind,
    apiVersion: `${RoleBindingModel.apiGroup}/${RoleBindingModel.apiVersion}`,
    metadata: {
      name: V2VVMWARE_DEPLOYMENT_NAME,
      namespace,
    },
    roleRef: {
      kind: RoleModel.kind,
      name: V2VVMWARE_DEPLOYMENT_NAME,
      apiGroup: RoleModel.apiGroup,
    },
    subjects: [
      {
        kind: ServiceAccountModel.kind,
        name: V2VVMWARE_DEPLOYMENT_NAME
      }
    ],
  });
};

const createOperator = ({k8sCreate, namespace}) => {
  return k8sCreate(DeploymentModel, {
    apiVersion: `${DeploymentModel.apiGroup}/${DeploymentModel.apiVersion}`,
    kind: DeploymentModel.kind,
    metadata: {
      name: V2VVMWARE_DEPLOYMENT_NAME,
      namespace,
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          name: V2VVMWARE_DEPLOYMENT_NAME,
        }
      },
      template: {
        metadata: {
          labels: {
            name: V2VVMWARE_DEPLOYMENT_NAME,
          }
        },
        spec: {
          serviceAccountName: V2VVMWARE_DEPLOYMENT_NAME,
          containers: [
            {
              name: V2VVMWARE_DEPLOYMENT_NAME,
              image: 'quay.io/mareklibra/v2v-vmware:v0.0.1', // TODO: parametrize from configuration (Web UI's ConfigMap)
              imagePullPolicy: 'Always',
              command: ['v2v-vmware'],
              env: [
                {
                  name: 'WATCH_NAMESPACE',
                  valueFrom: {
                    fieldRef: {
                      apiVersion: "v1",
                      fieldPath: 'metadata.namespace'
                    }
                  }
                },
                {
                  name: 'POD_NAME',
                  valueFrom: {
                    fieldRef: {
                      apiVersion: 'v1',
                      fieldPath: 'metadata.name',
                    }
                  }
                },
                {
                  name: 'OPERATOR_NAME',
                  value: V2VVMWARE_DEPLOYMENT_NAME,
                }
              ],
            }
          ],
        }
      }
    },
  });
};
