import {
  CUSTOM_FLAVOR,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_VM,
} from '../../constants';
import {
  isFlavorType,
  getWorkloadLabel,
  getOsLabel,
  getFlavorLabel,
  getFlavors,
  getOperatingSystems,
  getWorkloadProfiles,
  isImageSourceType,
} from '../selectors';
import { getTemplate } from '../../utils/templates';
import { baseTemplates } from '../../tests/mocks/template';
import { userTemplates } from '../../tests/mocks/user_template';
import { PROVISION_SOURCE_TYPE_KEY } from '../../components/Wizard/CreateVmWizard/constants';

const templates = [...baseTemplates, ...userTemplates];

const osId = (os, nextOs) => os.id.localeCompare(nextOs.id);

describe('selectors.js', () => {
  it('isImageSourceType', () => {
    const basicVmSettings = {
      [PROVISION_SOURCE_TYPE_KEY]: {
        value: 'shouldReturnTrue',
      },
    };
    expect(isImageSourceType(basicVmSettings, undefined)).toBeFalsy();
    expect(isImageSourceType(basicVmSettings, 'shouldReturnTrue')).toBeTruthy();

    basicVmSettings[PROVISION_SOURCE_TYPE_KEY].value = 'shouldReturnFalse';
    expect(isImageSourceType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings[PROVISION_SOURCE_TYPE_KEY].value = undefined;
    expect(isImageSourceType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings[PROVISION_SOURCE_TYPE_KEY] = undefined;
    expect(isImageSourceType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    expect(isImageSourceType(undefined, 'thisIsNotTheValue')).toBeFalsy();
  });
  it('isFlavorType', () => {
    const basicVmSettings = {
      flavor: {
        value: 'shouldReturnTrue',
      },
    };
    expect(isFlavorType(basicVmSettings, undefined)).toBeFalsy();
    expect(isFlavorType(basicVmSettings, 'shouldReturnTrue')).toBeTruthy();

    basicVmSettings.flavor.value = 'shouldReturnFalse';
    expect(isFlavorType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings.flavor.value = undefined;
    expect(isFlavorType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings.flavor = undefined;
    expect(isFlavorType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    expect(isFlavorType(undefined, 'thisIsNotTheValue')).toBeFalsy();
  });
  it('getFlavorLabel', () => {
    expect(getFlavorLabel()).toBeUndefined();

    expect(getFlavorLabel({})).toBeUndefined();

    const value = 'someFlavor';
    expect(
      getFlavorLabel({
        flavor: {
          value,
        },
      })
    ).toEqual(`${TEMPLATE_FLAVOR_LABEL}/${value}`);

    expect(
      getFlavorLabel({
        flavor: {
          value: CUSTOM_FLAVOR,
        },
      })
    ).toBeUndefined();
  });
  it('getWorkloadLabel', () => {
    expect(getWorkloadLabel()).toBeUndefined();

    expect(getWorkloadLabel({})).toBeUndefined();

    const value = 'someWorkload';
    expect(
      getWorkloadLabel({
        workloadProfile: {
          value,
        },
      })
    ).toEqual(`${TEMPLATE_WORKLOAD_LABEL}/${value}`);
  });
  it('getOsLabel', () => {
    expect(getOsLabel()).toBeUndefined();

    expect(getOsLabel({})).toBeUndefined();

    const value = 'someOs';
    expect(
      getOsLabel({
        operatingSystem: {
          value,
        },
      })
    ).toEqual(`${TEMPLATE_OS_LABEL}/${value}`);
  });

  it('getTemplate', () => {
    expect(getTemplate(templates, TEMPLATE_TYPE_BASE)).toEqual(baseTemplates);
    expect(getTemplate(templates, TEMPLATE_TYPE_VM)).toEqual(userTemplates);
    expect(getTemplate(templates, 'someType')).toHaveLength(0);
  });

  it('getOperatingSystems', () => {
    const fedora = [
      {
        id: 'fedora23',
        name: 'Fedora 23',
      },
      {
        id: 'fedora24',
        name: 'Fedora 24',
      },
      {
        id: 'fedora25',
        name: 'Fedora 25',
      },
      {
        id: 'fedora26',
        name: 'Fedora 26',
      },
      {
        id: 'fedora27',
        name: 'Fedora 27',
      },
      {
        id: 'fedora28',
        name: 'Fedora 28',
      },
      {
        id: 'fedora29',
        name: 'Fedora 29',
      },
    ];
    const rhel = [{ id: 'rhel7.0', name: 'Red Hat Enterprise Linux 7.0' }];
    const ubuntu = [{ id: 'ubuntu18.04', name: 'Ubuntu 18.04 LTS' }];
    const windows = [
      {
        id: 'win2k12r2',
        name: 'Microsoft Windows Server 2012 R2',
      },
      {
        id: 'win2k8',
        name: 'Microsoft Windows Server 2008',
      },
      {
        id: 'win2k8r2',
        name: 'Microsoft Windows Server 2008 R2',
      },
      {
        id: 'win10',
        name: 'Microsoft Windows 10',
      },
    ];

    expect(getOperatingSystems({}, templates).sort(osId)).toEqual(
      [...fedora, ...rhel, ...ubuntu, ...windows].sort(osId)
    );

    const basicVmSettings = {
      workloadProfile: {
        value: 'generic',
      },
    };

    expect(getOperatingSystems(basicVmSettings, templates).sort(osId)).toEqual(
      [...fedora, ...rhel, ...ubuntu, ...windows].sort(osId)
    );

    basicVmSettings.workloadProfile.value = 'high-performance';

    expect(getOperatingSystems(basicVmSettings, templates).sort(osId)).toEqual([...rhel]);

    basicVmSettings.flavor = {
      value: 'medium',
    };

    expect(getOperatingSystems(basicVmSettings, templates)).toEqual([...rhel]);

    delete basicVmSettings.workloadProfile;

    expect(getOperatingSystems(basicVmSettings, templates).sort(osId)).toEqual([...rhel, ...windows].sort(osId));

    basicVmSettings.flavor.value = 'small';
    basicVmSettings.workloadProfile = {
      value: 'generic',
    };

    expect(getOperatingSystems(basicVmSettings, templates).sort(osId)).toEqual(
      [...fedora, ...rhel, ...ubuntu].sort(osId)
    );
  });

  it('getFlavors', () => {
    const mediumFlavor = 'medium';
    const smallFlavor = 'small';

    expect(getFlavors({}, templates).sort()).toEqual([CUSTOM_FLAVOR, mediumFlavor, smallFlavor].sort());

    const basicVmSettings = {
      workloadProfile: {
        value: 'generic',
      },
    };

    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, smallFlavor, mediumFlavor].sort());

    basicVmSettings.workloadProfile.value = 'high-performance';
    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, mediumFlavor].sort());

    delete basicVmSettings.workloadProfile;
    basicVmSettings.operatingSystem = {
      value: 'fedora24',
    };
    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, smallFlavor].sort());

    basicVmSettings.operatingSystem.value = 'rhel7.0';
    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, smallFlavor, mediumFlavor].sort());

    basicVmSettings.workloadProfile = {
      value: 'high-performance',
    };
    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, mediumFlavor].sort());
  });

  it('getWorkloadProfiles', () => {
    const highPerformance = 'high-performance';
    const generic = 'generic';

    expect(getWorkloadProfiles({}, templates).sort()).toEqual([highPerformance, generic].sort());

    const basicVmSettings = {
      operatingSystem: {
        value: 'fedora24',
      },
    };
    expect(getWorkloadProfiles(basicVmSettings, templates)).toEqual([generic]);

    basicVmSettings.operatingSystem.value = 'rhel7.0';
    expect(getWorkloadProfiles(basicVmSettings, templates).sort()).toEqual([generic, highPerformance].sort());

    basicVmSettings.operatingSystem.value = 'rhel7.0';
    basicVmSettings.flavor = {
      value: 'medium',
    };
    expect(getWorkloadProfiles(basicVmSettings, templates)).toEqual([highPerformance]);

    basicVmSettings.flavor.value = 'small';
    expect(getWorkloadProfiles(basicVmSettings, templates)).toEqual([generic]);
  });
});
