import {
  DeploymentModel,
  RoleModel,
  ServiceAccountModel,
  RoleBindingModel,
  findModel,
  ConfigMapModel,
} from '../../../models';
import { buildServiceAccount, buildServiceAccountRoleBinding } from '../../objects';
import { buildVmWareRole, buildVmWareDeployment } from '../../objects/v2v/vmware';
import {
  V2VVMWARE_DEPLOYMENT_NAME,
  VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME,
  VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAMESPACE,
} from './constants';
import { getDeploymentContainer } from '../../../selectors/deployment';
import { getContainerImage } from '../../../selectors/pod';
import { buildAddOwnerReferencesPatch, buildOwnerReference } from '../../util';
import { getName } from '../../../selectors';
import { getKubevirtV2vVmwareContainerImage, getV2vImagePullPolicy } from '../../../selectors/v2v';

const { info } = console;

const OLD_VERSION = 'OLD_VERSION';

// prevent parallel execution of startV2VVMWareController()
const semaphors = {};

// The controller is namespace-scoped, especially due to security reasons
// Let's make sure its started within the desired namespace (which is not by default).
// The V2VVmware CRD is expected to be already created within the cluster (by Web UI installation)
// TODO: The controller should be deployed by a provider and not via following UI code.
export const startV2VVMWareController = async ({ namespace }, { k8sGet, k8sCreate, k8sKill, k8sPatch }) => {
  if (!namespace) {
    throw new Error('V2V VMWare: namespace must be selected');
  }

  if (semaphors[namespace]) {
    info(`startV2VVMWareController for "${namespace}" namespace already in progress. Skipping...`);
    return;
  }
  semaphors[namespace] = true;

  const name = V2VVMWARE_DEPLOYMENT_NAME;
  let activeDeployment;
  let kubevirtVmwareConfigMap;

  try {
    kubevirtVmwareConfigMap = await k8sGet(
      ConfigMapModel,
      VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME,
      VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAMESPACE
    );

    activeDeployment = await k8sGet(DeploymentModel, name, namespace);

    if (
      getContainerImage(getDeploymentContainer(activeDeployment, name)) !==
      getKubevirtV2vVmwareContainerImage(kubevirtVmwareConfigMap)
    ) {
      throw new Error(OLD_VERSION);
    }
  } catch (e) {
    // Deployment does not exist or does not have permissions to see Deployments in this namespace
    // TODO: notify the user in other way not just the console.log
    info(
      e && e.message === OLD_VERSION
        ? 'updating V2V VMWare controller'
        : 'V2V VMWare controller deployment not found, so creating one ...'
    );

    // TODO: do not fail if i.e. ServiceAccount already exists
    // TODO: notify user if deployment fails
    [cleanupOldDeployment, resolveRolesAndServiceAccount, startVmWare].reduce(
      async (lastResultPromise, stepFunction) => {
        const lastResult = await lastResultPromise;
        const nextResult = await stepFunction(lastResult, {
          k8sCreate,
          k8sPatch,
          k8sKill,
        });
        return {
          ...lastResult,
          ...nextResult,
        };
      },
      Promise.resolve({ activeDeployment, kubevirtVmwareConfigMap, namespace, name })
    );

    info(`startV2VVMWareController for "${namespace}" namespace finished.`);
  } finally {
    delete semaphors[namespace];
  }
};

const cleanupOldDeployment = async ({ activeDeployment }, { k8sKill }) => {
  if (activeDeployment) {
    await k8sKill(DeploymentModel, activeDeployment);
  }
  return null;
};

const resolveRolesAndServiceAccount = async ({ name, namespace }, { k8sCreate }) => {
  const serviceAccount = await k8sCreate(ServiceAccountModel, buildServiceAccount({ name, namespace }));
  const role = await k8sCreate(RoleModel, buildVmWareRole({ name, namespace }));

  const roleBinding = await k8sCreate(
    RoleBindingModel,
    buildServiceAccountRoleBinding({
      name,
      namespace,
      serviceAccountName: getName(serviceAccount),
      roleName: getName(role),
    })
  );

  return {
    serviceAccount,
    role,
    roleBinding,
  };
};

const startVmWare = async (
  { name, namespace, serviceAccount, role, roleBinding, kubevirtVmwareConfigMap },
  { k8sCreate, k8sPatch }
) => {
  const deployment = await k8sCreate(
    DeploymentModel,
    buildVmWareDeployment({
      name,
      namespace,
      image: getKubevirtV2vVmwareContainerImage(kubevirtVmwareConfigMap),
      imagePullPolicy: getV2vImagePullPolicy(kubevirtVmwareConfigMap),
    })
  );

  if (deployment) {
    const newOwnerReferences = [buildOwnerReference(deployment)];

    const patchPromises = [serviceAccount, role, roleBinding].map(object => {
      const patches = [buildAddOwnerReferencesPatch(object, newOwnerReferences)];
      return k8sPatch(findModel(object), object, patches);
    });
    await Promise.all(patchPromises);
  }

  return {
    deployment,
  };
};
