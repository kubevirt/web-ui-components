import { DeploymentModel, RoleModel, ServiceAccountModel, RoleBindingModel, findModel } from '../../../models';
import { buildServiceAccount, buildServiceAccountRoleBinding } from '../../objects';
import { buildVmWareRole, buildVmWareDeployment } from '../../objects/v2v/vmware';
import { V2VVMWARE_DEPLOYMENT_NAME } from './constants';
import { getDeploymentContainer } from '../../../selectors/deployment';
import { getContainerImage } from '../../../selectors/pod';
import { buildAddOwnerReferencesPatch, buildOwnerReference } from '../../util';
import { getName } from '../../../selectors';
import { getKubevirtV2vVmwareContainerImage } from '../../../config';

const { info } = console;

const OLD_VERSION = 'OLD_VERSION';

// The controller is namespace-scoped, especially due to security reasons
// Let's make sure its started within the desired namespace (which is not by default).
// The V2VVmware CRD is expected to be already created within the cluster (by Web UI installation)
export const startV2VVMWareController = async ({ namespace }, { k8sGet, k8sCreate, k8sKill, k8sPatch }) => {
  if (!namespace) {
    throw new Error('V2V VMWare: namespace must be selected');
  }

  const name = V2VVMWARE_DEPLOYMENT_NAME;
  let activeDeployment;

  try {
    activeDeployment = await k8sGet(DeploymentModel, name, namespace);

    if (getContainerImage(getDeploymentContainer(activeDeployment, name)) !== getKubevirtV2vVmwareContainerImage()) {
      throw new Error(OLD_VERSION);
    }
  } catch (e) {
    // Deployment does not exist or does not have permissions to see Deployments in this namespace
    info(
      e && e.message === OLD_VERSION
        ? 'updating V2V VMWare controller'
        : 'V2V VMWare controller deployment not found, so creating one ...'
    );

    await [cleanupOldDeployment, resolveRolesAndServiceAccount, startVmWare].reduce(
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
      Promise.resolve({ activeDeployment, namespace, name })
    );
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

const startVmWare = async ({ name, namespace, serviceAccount, role, roleBinding }, { k8sCreate, k8sPatch }) => {
  const deployment = await k8sCreate(DeploymentModel, buildVmWareDeployment({ name, namespace }));

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
