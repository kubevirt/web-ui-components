import { CloudInit } from '../cloudInit';

import { containerCloudTemplate } from '../../tests/mocks/user_template';
import { selectVm } from '../selectors';

const hostname = 'blue.castle';

/* eslint-disable no-multi-str */
const sshAuthorizedKeys =
  'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDbHPmk/9EQfmJPebLT7PT7dUYhdmqxTbjoSIxOAYUUt6WGbgD6YbyqM4nMWnzNjH/mto994HphNK/\
auWuQcpgD+QEwV2601lfela2tdjIetMBhxO2blMJPFI12xDrANW68yuyDR4PceHTBvpOrHm1lk/hB4fnGK2iuFe6WU5TGAUDLiG48u0TfEwJK7ROeDMzfp\
kJ8OkFEyUN/ixtSYoCC4FlG2H5MCUT4l1XuwOtX+W54QyyGYv2iKvqVB93evNDsA8L4zoijvy8BQevtLGpVg3A89sFtjFhjy5kSZb3MTcHuzLEMU3zfcY3\
F1/ngQwViBQU3zbZepOwhsLq8SqMUiuAf+VtabVYlObnac4ARaTL5GEDbDjHr5mqCWEvFzQXbFbbozA2LWDMRade0T9tGbaSJMQC8wpDCiEu/DLXgoKaos\
nEaQ4SlYu3t8OFD6Cn+FZWjhQGey+DcHa12qSLWsL6VuEP+7SA2G6mcsJtnFDw3PxlcRVMDGhP/UPxkMsfmPfWZEFV2xMgQUF1SsSbodWMK2XYHKKMTdCS\
qN6BacghiACcY/FJoP+DbDWX2V90GqTZJF+Ljl7zsGoLMrKGm85jn+QIAabNQxh9vdfdV9YeVdRURet0TyRCJNsNhMh/kEOh39LHs1rlEPlDMcKBINxbnf\
mMCvrfSo67Qfbdrw== testCloudInit@testCloudInit';
/* eslint-enable */

const comparePresentOriginal = (original, result) => {
  if (original) {
    expect(original).toBe(result);
  }
};

const testCloudInit = (cloudInit, originalDisk = null, originalVolume = null) => {
  const { volume, disk } = cloudInit.build();

  expect(volume).toMatchSnapshot();
  expect(disk).toMatchSnapshot();

  comparePresentOriginal(originalDisk, disk);
  comparePresentOriginal(originalVolume, volume);
};

describe('cloudInit.js', () => {
  it('creates predefined userData', () => {
    const cloudInit = new CloudInit();
    cloudInit.setPredefinedUserData({
      hostname,
      sshAuthorizedKeys,
    });

    testCloudInit(cloudInit);
  });

  it('sets userData', () => {
    const { domain, volumes } = selectVm(containerCloudTemplate.objects).spec.template.spec;
    const disk = domain.devices.disks[1];
    const volume = volumes[1];

    const cloudInit = new CloudInit({
      disk,
      volume,
    });

    cloudInit.setUserData('#!/usr/bin/env bash\necho hello!');

    testCloudInit(cloudInit, disk, volume);
  });
});
