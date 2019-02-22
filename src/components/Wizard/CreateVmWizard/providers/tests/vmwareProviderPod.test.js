import { getDefaultSecretName, getImportProviderSecretObject, getV2VVMwareObject } from '../vmwareProviderPod';
import { SecretModel, V2VVMwareModel } from '../../../../../models';
import { VCENTER_TEMPORARY_LABEL } from '../../../../../constants';

describe('VMWareProviderPod()', () => {
  it('returns default secret name correctly', () => {
    expect(getDefaultSecretName({ username: 'a', url: 'url' })).toBe('url-a');
    expect(getDefaultSecretName({ username: 'a', url: 'https://url' })).toBe('url-a');
    expect(getDefaultSecretName({ username: 'a', url: 'http://url' })).toBe('url-a');
    expect(getDefaultSecretName({ username: 'a', url: 'https://url.com/' })).toBe('url.com-a');
    expect(getDefaultSecretName({ username: 'a', url: 'https://url.com/foo' })).toBe('url.com-a');
    expect(getDefaultSecretName({ username: 'a@b', url: 'https://url.com/foo/bar' })).toBe('url.com-a-at-b');
  });
  it('generates Secret object', () => {
    const secret = getImportProviderSecretObject({
      url: 'url',
      username: 'user',
      password: 'pwd',
      secretName: 'secret-name',
      namespace: 'my-namespace',
      isTemporary: true,
    });
    expect(secret).toMatchObject({
      kind: SecretModel.kind,
      apiVersion: SecretModel.apiVersion,
      metadata: {
        generateName: 'secret-name',
        namespace: 'my-namespace',
        labels: {
          [VCENTER_TEMPORARY_LABEL]: 'true',
        },
      },
      type: 'Opaque',
      data: {
        username: btoa('user'),
        password: btoa('pwd'),
        url: btoa('url'),
      },
    });
  });
  it('generates V2VVMWare object', () => {
    const v2vvmware = getV2VVMwareObject({
      name: 'name',
      namespace: 'my-namespace',
      connectionSecretName: 'secret-name',
      isTemporary: true,
    });
    expect(v2vvmware).toMatchObject({
      kind: V2VVMwareModel.kind,
      apiVersion: `${V2VVMwareModel.apiGroup}/${V2VVMwareModel.apiVersion}`,
      metadata: {
        generateName: 'name',
        namespace: 'my-namespace',
        labels: {
          [VCENTER_TEMPORARY_LABEL]: 'true',
        },
      },
      spec: {
        connection: 'secret-name',
      },
    });
  });
});
