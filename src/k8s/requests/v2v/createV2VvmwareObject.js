import { SecretModel, V2VVMwareModel } from '../../../models';
import { getName } from '../../../selectors';
import { getDefaultSecretName } from './utils';
import { buildV2VVMwareObject } from '../../objects/v2v/vmware/vmWareObject';
import { buildVMwareSecret } from '../../objects/v2v/vmware/vmWareSecret';
import { buildAddOwnerReferencesPatch, buildOwnerReference } from '../../util';

export const createV2VvmwareObjectWithSecret = async (
  { url, username, password, namespace },
  { k8sCreate, k8sPatch }
) => {
  const secretName = `temp-${getDefaultSecretName({ url, username })}-`;
  const secret = await k8sCreate(
    SecretModel,
    buildVMwareSecret({
      url,
      username,
      password,
      namespace,
      secretName,
      isTemporary: true, // do not list this temporary secret in the dropdown box
    })
  );

  const v2vvmware = await k8sCreate(
    V2VVMwareModel,
    buildV2VVMwareObject({
      generateName: `check-${getDefaultSecretName({ url, username })}-`,
      namespace,
      connectionSecretName: getName(secret),
      isTemporary: true, // remove this object automatically (by controller)
    })
  );

  if (v2vvmware) {
    const newOwnerReferences = [buildOwnerReference(v2vvmware)];
    const patches = [buildAddOwnerReferencesPatch(secret, newOwnerReferences)];
    await k8sPatch(SecretModel, secret, patches);
  }

  return v2vvmware;
};

// ATM, Kubernetes does not support deletion of CRs with a gracefulPeriod (delayed deletion).
// The only object with this support are PODs.
// More info: https://github.com/kubernetes/kubernetes/issues/56567
// Workaround: handle garbage collection on our own by:
// - set VCENTER_TEMPORARY_LABEL label to 'true'
// - controller will set deletionTimestamp label with RFC 3339 timestamp
// - controller will remove the object after the timeStamp
// - can be easily extended for delaying the deletionTimestamp (recently not needed, so not implemented)
export const createV2VvmwareObject = async ({ connectionSecretName, namespace }, { k8sCreate }) =>
  k8sCreate(
    V2VVMwareModel,
    buildV2VVMwareObject({
      generateName: `v2vvmware-${connectionSecretName}-`,
      namespace,
      connectionSecretName,
      isTemporary: true, // remove this object automatically (by controller)
    })
  );
