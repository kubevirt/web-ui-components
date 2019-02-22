import { startV2VVMWareController } from '../v2vvmwareController';
import { DeploymentModel, RoleBindingModel, RoleModel, ServiceAccountModel } from '../../../../../models';

const k8sGetFailing = () => Promise.reject(new Error('Test-only: A dummy reason for failing k8sGet.'));

describe('namespace-local kubevirt-vmware deployment', () => {
  it('', () => {
    const k8sCreate = jest.fn().mockReturnValue(Promise.resolve());
    return startV2VVMWareController({
      k8sCreate,
      k8sGet: k8sGetFailing,
      namespace: 'my-namespace',
    }).then(result => {
      expect(k8sCreate.mock.calls).toHaveLength(4);
      expect(k8sCreate.mock.calls[0][0].kind).toBe(ServiceAccountModel.kind);
      expect(k8sCreate.mock.calls[1][0].kind).toBe(RoleModel.kind);
      expect(k8sCreate.mock.calls[2][0].kind).toBe(RoleBindingModel.kind);
      expect(k8sCreate.mock.calls[3][0].kind).toBe(DeploymentModel.kind);
      return result;
    });
  });
});
