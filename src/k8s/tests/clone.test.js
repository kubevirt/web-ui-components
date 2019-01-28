import { cloneDeep } from 'lodash';
import { noop } from 'patternfly-react';

import { cloneVm, cloneDisks } from '../clone';
import { DataVolumeModel } from '../../models';
import { emptyVm } from '../../tests/mocks/vm/empty_vm.mock';
import { getName, getNamespace, getDescription, getVolumes } from '../../utils';
import { addPvcVolume, addDisk, addDataVolumeTemplate, addDataVolume } from '../request';
import { pvcDisk, dataVolumeTemplate, dataVolumeDisk } from '../../tests/forms_mocks/disk.mock';
import { persistentVolumeClaims } from '../../tests/mocks/persistentVolumeClaim';
import { dataVolumes } from '../../tests/mocks/dataVolume';
import { k8sCreate } from '../../tests/k8sCreate';

describe('clone.js - cloneVm', () => {
  it('clone vm without devices', async () => {
    const result = await cloneVm(k8sCreate, cloneDeep(emptyVm), 'newname', 'newnamespace', 'newdesc', false, []);
    expect(getName(result)).toEqual('newname');
    expect(getNamespace(result)).toEqual('newnamespace');
    expect(getDescription(result)).toEqual('newdesc');
  });

  it('clone vm with pvc disks', async () => {
    const vmWithPvc = cloneDeep(emptyVm);
    addDisk(vmWithPvc, null, pvcDisk, noop);
    addPvcVolume(vmWithPvc, pvcDisk, noop);

    const disks = [
      {
        volumeName: pvcDisk.name,
        result: { metadata: { name: 'somename' } },
      },
    ];

    const result = await cloneVm(k8sCreate, vmWithPvc, 'newname', 'newnamespace', 'newdesc', false, disks);
    const vmVolumes = getVolumes(result);
    expect(vmVolumes.find(v => v.name === disks[0].volumeName).dataVolume.name).toEqual(getName(disks[0].result));
  });

  it('clone vm with datavolume templates', async () => {
    const vmWithDvTemplate = cloneDeep(emptyVm);
    addDisk(vmWithDvTemplate, null, dataVolumeTemplate, noop);
    addDataVolumeTemplate(vmWithDvTemplate, dataVolumeTemplate, noop);
    addDataVolume(vmWithDvTemplate, dataVolumeTemplate, noop);

    const disks = [
      {
        volumeName: dataVolumeTemplate.name,
        result: { metadata: { name: 'somename' } },
      },
    ];

    const result = await cloneVm(k8sCreate, vmWithDvTemplate, 'newname', 'newnamespace', 'newdesc', false, disks);
    const vmVolumes = getVolumes(result);
    expect(vmVolumes.find(v => v.name === disks[0].volumeName).dataVolume.name).toEqual(getName(disks[0].result));
  });

  it('clone vm with datavolumes', async () => {
    const vmWithDv = cloneDeep(emptyVm);
    addDisk(vmWithDv, null, dataVolumeDisk, noop);
    addDataVolume(vmWithDv, dataVolumeDisk, noop);

    const disks = [
      {
        volumeName: dataVolumeDisk.name,
        result: { metadata: { name: 'somename' } },
      },
    ];

    const result = await cloneVm(k8sCreate, vmWithDv, 'newname', 'newnamespace', 'newdesc', false, disks);
    const vmVolumes = getVolumes(result);
    expect(vmVolumes.find(v => v.name === disks[0].volumeName).dataVolume.name).toEqual(getName(disks[0].result));
  });
});

describe('clone.js - cloneDisks', () => {
  it('clones datavolume', async () => {
    const vmWithDv = cloneDeep(emptyVm);
    const dvDisk = { name: 'dvdiskName', dvName: getName(dataVolumes.urlSuccess) };
    addDisk(vmWithDv, null, dvDisk, noop);
    addDataVolume(vmWithDv, dvDisk, noop);

    const dvDiskUrl = { name: 'dvdiskNameUrl', dvName: getName(dataVolumes.url) };
    addDisk(vmWithDv, null, dvDiskUrl, noop);
    addDataVolume(vmWithDv, dvDiskUrl, noop);

    const pvDisk = { name: getName(persistentVolumeClaims[0]), claimName: getName(persistentVolumeClaims[0]) };
    addDisk(vmWithDv, null, pvDisk, noop);
    addPvcVolume(vmWithDv, pvDisk, noop);

    const clones = cloneDisks(k8sCreate, vmWithDv, 'newnamespace', persistentVolumeClaims, Object.values(dataVolumes));
    const results = await Promise.all(clones.map(r => r.promise));

    expect(results).toHaveLength(3);

    expect(results[0].kind).toEqual(DataVolumeModel.kind);
    expect(results[0].apiVersion).toEqual(`${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`);
    expect(results[0].spec.source.pvc).toEqual({
      name: getName(persistentVolumeClaims[0]),
      namespace: getNamespace(persistentVolumeClaims[0]),
    });

    expect(results[1].kind).toEqual(DataVolumeModel.kind);
    expect(results[1].apiVersion).toEqual(`${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`);
    expect(results[1].spec.source.pvc).toEqual({
      name: getName(dataVolumes.urlSuccess),
      namespace: getNamespace(vmWithDv),
    });

    expect(results[2].kind).toEqual(DataVolumeModel.kind);
    expect(results[2].apiVersion).toEqual(`${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`);
    expect(results[2].spec.source.http.url).toEqual(dataVolumes.url.spec.source.http.url);
  });
});
