import { DeploymentModel, RoleModel, ServiceAccountModel, RoleBindingModel } from '../../../../models';
import { buildServiceAccount, buildServiceAccountRoleBinding } from '../../../../k8s/objects';
import { buildVmWareRole, buildVmWareDeployment } from '../../../../k8s/objects/v2v/vmware';
import { V2VVMWARE_DEPLOYMENT_NAME } from '../../../../k8s/requests/v2v/constants';

const { info, warn } = console;

const rejectLogger = title => reason => warn(`Failed to create ${title}, reason`, reason);

// The controller is namespace-scoped, especially due to security reasons
// Let's make sure its started within the desired namespace (which is not by default).
// The V2VVmware CRD is expected to be already created within the cluster (by Web UI installation)
export const startV2VVMWareController = async ({ k8sCreate, k8sGet, namespace }) => {
  try {
    await k8sGet(DeploymentModel, V2VVMWARE_DEPLOYMENT_NAME, namespace);
  } catch {
    // Deployment does not exist or does not have permissions to see Deployments in this namespace
    // TODO: notify the user in other way not just the console.log

    info('V2V VMWare controller deployment not found, so creating one ...');
    const params = { k8sCreate, namespace, name: V2VVMWARE_DEPLOYMENT_NAME };

    createServiceAccount(params).catch(rejectLogger('Service Account'));
    createRole(params).catch(rejectLogger('Role'));
    createRoleBinding(params).catch(rejectLogger('Role Binding'));
    createOperator(params).catch(rejectLogger('V2V VMWare controller'));
  }
};

const createServiceAccount = ({ k8sCreate, ...params }) => k8sCreate(ServiceAccountModel, buildServiceAccount(params));

const createRole = ({ k8sCreate, ...params }) => k8sCreate(RoleModel, buildVmWareRole(params));

const createRoleBinding = ({ k8sCreate, name, namespace }) =>
  k8sCreate(
    RoleBindingModel,
    buildServiceAccountRoleBinding({
      name,
      namespace,
      serviceAccountName: name,
      roleName: name,
    })
  );

// TODO: Do not use Deployment, just run the pod directly to simplify upgrades
const createOperator = ({ k8sCreate, ...params }) => k8sCreate(DeploymentModel, buildVmWareDeployment(params));
