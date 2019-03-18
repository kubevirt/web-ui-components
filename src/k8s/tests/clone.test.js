import { cloneDeep } from 'lodash';
import { noop } from 'patternfly-react';

import { clone } from '../clone';
import { emptyVm } from '../../tests/mocks/vm/empty_vm.mock';
import { getName, getNamespace, getDescription, getVolumes } from '../../selectors';
import { generateDiskName } from '../../utils';
import { addDisk, addDataVolumeTemplate, addDataVolume, addPvcVolume, getDataVolumeTemplateSpec } from '../vmBuilder';
import { pvcDisk, dataVolumeTemplate, dataVolumeDisk } from '../../tests/forms_mocks/disk.mock';
import { persistentVolumeClaims } from '../../tests/mocks/persistentVolumeClaim';
import { dataVolumes } from '../../tests/mocks/dataVolume';
import { k8sCreate, k8sPatch } from '../../tests/k8s';
import { DATA_VOLUME_SOURCE_BLANK } from '../../components/Wizard/CreateVmWizard/constants';

describe('clone.js - cloneVm', () => {
  it('clone vm without devices', async () => {
    const result = await clone(
      k8sCreate,
      k8sPatch,
      cloneDeep(emptyVm),
      'newname',
      'newnamespace',
      'newdesc',
      false,
      [],
      []
    );
    expect(getName(result)).toEqual('newname');
    expect(getNamespace(result)).toEqual('newnamespace');
    expect(getDescription(result)).toEqual('newdesc');
  });

  it('clone vm with pvc disks', async () => {
    const vmWithPvc = cloneDeep(emptyVm);
    addDisk(vmWithPvc, null, pvcDisk, noop);
    addPvcVolume(vmWithPvc, pvcDisk, noop);

    const result = await clone(
      k8sCreate,
      k8sPatch,
      vmWithPvc,
      'newname',
      'newnamespace',
      'newdesc',
      false,
      persistentVolumeClaims,
      []
    );
    const vmVolumes = getVolumes(result);
    expect(vmVolumes.find(v => v.name === pvcDisk.name).dataVolume.name).toEqual(
      generateDiskName(getName(vmWithPvc), pvcDisk.name, true)
    );
  });

  it('clone vm with datavolume templates', async () => {
    const vmWithDvTemplate = cloneDeep(emptyVm);
    addDisk(vmWithDvTemplate, null, dataVolumeTemplate, noop);
    const templateSpec = getDataVolumeTemplateSpec(dataVolumeTemplate, { type: DATA_VOLUME_SOURCE_BLANK });
    addDataVolumeTemplate(vmWithDvTemplate, templateSpec, noop);
    addDataVolume(vmWithDvTemplate, dataVolumeTemplate, noop);

    const result = await clone(
      k8sCreate,
      k8sPatch,
      vmWithDvTemplate,
      'newname',
      'newnamespace',
      'newdesc',
      false,
      persistentVolumeClaims,
      Object.values(dataVolumes)
    );

    const vmVolumes = getVolumes(result);
    expect(vmVolumes.find(v => v.name === dataVolumeTemplate.name).dataVolume.name).toEqual(
      generateDiskName(getName(vmWithDvTemplate), dataVolumeTemplate.dvName, true)
    );
  });

  it('clone vm with datavolumes', async () => {
    const vmWithDv = cloneDeep(emptyVm);
    addDisk(vmWithDv, null, dataVolumeDisk, noop);
    addDataVolume(vmWithDv, dataVolumeDisk, noop);

    const result = await clone(
      k8sCreate,
      k8sPatch,
      vmWithDv,
      'newname',
      'newnamespace',
      'newdesc',
      false,
      persistentVolumeClaims,
      Object.values(dataVolumes)
    );
    const vmVolumes = getVolumes(result);
    expect(vmVolumes.find(v => v.name === dataVolumeDisk.name).dataVolume.name).toEqual(
      generateDiskName(getName(vmWithDv), dataVolumeDisk.dvName, true)
    );
  });
});
