import {
  CUSTOM_FLAVOR,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_VM,
  templates,
  userTemplates,
  baseTemplates
} from '../../constants';
import {
  isFlavorType,
  getWorkloadLabel,
  getOsLabel,
  getFlavorLabel,
  getFlavors,
  getOperatingSystems,
  getWorkloadProfiles,
  isImageSourceType
} from '../selectors';
import { getTemplate } from '../../utils/templates';

describe('selectors.js', () => {
  it('isImageSourceType', () => {
    const basicVmSettings = {
      imageSourceType: {
        value: 'shouldReturnTrue'
      }
    };
    expect(isImageSourceType(basicVmSettings, undefined)).toBeFalsy();
    expect(isImageSourceType(basicVmSettings, 'shouldReturnTrue')).toBeTruthy();

    basicVmSettings.imageSourceType.value = 'shouldReturnFalse';
    expect(isImageSourceType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings.imageSourceType.value = undefined;
    expect(isImageSourceType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings.imageSourceType = undefined;
    expect(isImageSourceType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    expect(isImageSourceType(undefined, 'thisIsNotTheValue')).toBeFalsy();
  });
  it('isFlavorType', () => {
    const basicVmSettings = {
      flavor: {
        value: 'shouldReturnTrue'
      }
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
          value
        }
      })
    ).toEqual(`${TEMPLATE_FLAVOR_LABEL}/${value}`);

    expect(
      getFlavorLabel({
        flavor: {
          value: CUSTOM_FLAVOR
        }
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
          value
        }
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
          value
        }
      })
    ).toEqual(`${TEMPLATE_OS_LABEL}/${value}`);
  });

  it('getTemplate', () => {
    expect(getTemplate(templates, TEMPLATE_TYPE_BASE)).toEqual(baseTemplates);
    expect(getTemplate(templates, TEMPLATE_TYPE_VM)).toEqual(userTemplates);
    expect(getTemplate(templates, 'someType')).toHaveLength(0);
  });

  it('getOperatingSystems', () => {
    const fedora = ['fedora23', 'fedora24', 'fedora25', 'fedora26', 'fedora27', 'fedora28', 'fedora29'];
    const rhel = ['rhel7.0'];
    const ubuntu = ['ubuntu18.04'];
    const windows = ['win2k12r2', 'win2k8r2', 'win2k8', 'win10'];

    expect(getOperatingSystems({}, templates).sort()).toEqual([...fedora, ...rhel, ...ubuntu, ...windows].sort());

    const basicVmSettings = {
      workloadProfile: {
        value: 'generic'
      }
    };

    expect(getOperatingSystems(basicVmSettings, templates).sort()).toEqual(
      [...fedora, ...rhel, ...ubuntu, ...windows].sort()
    );

    basicVmSettings.workloadProfile.value = 'high-performance';

    expect(getOperatingSystems(basicVmSettings, templates).sort()).toEqual([...rhel]);

    basicVmSettings.flavor = {
      value: 'medium'
    };

    expect(getOperatingSystems(basicVmSettings, templates)).toEqual([...rhel]);

    delete basicVmSettings.workloadProfile;

    expect(getOperatingSystems(basicVmSettings, templates)).toEqual([...rhel, ...windows]);

    basicVmSettings.flavor.value = 'small';
    basicVmSettings.workloadProfile = {
      value: 'generic'
    };

    expect(getOperatingSystems(basicVmSettings, templates).sort()).toEqual([...fedora, ...rhel, ...ubuntu].sort());
  });

  it('getFlavors', () => {
    const mediumFlavor = 'medium';
    const smallFlavor = 'small';

    expect(getFlavors({}, templates).sort()).toEqual([CUSTOM_FLAVOR, mediumFlavor, smallFlavor].sort());

    const basicVmSettings = {
      workloadProfile: {
        value: 'generic'
      }
    };

    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, smallFlavor, mediumFlavor].sort());

    basicVmSettings.workloadProfile.value = 'high-performance';
    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, mediumFlavor].sort());

    delete basicVmSettings.workloadProfile;
    basicVmSettings.operatingSystem = {
      value: 'fedora24'
    };
    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, smallFlavor].sort());

    basicVmSettings.operatingSystem.value = 'rhel7.0';
    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, smallFlavor, mediumFlavor].sort());

    basicVmSettings.workloadProfile = {
      value: 'high-performance'
    };
    expect(getFlavors(basicVmSettings, templates).sort()).toEqual([CUSTOM_FLAVOR, mediumFlavor].sort());
  });

  it('getWorkloadProfiles', () => {
    const highPerformance = 'high-performance';
    const generic = 'generic';

    expect(getWorkloadProfiles({}, templates).sort()).toEqual([highPerformance, generic].sort());

    const basicVmSettings = {
      operatingSystem: {
        value: 'fedora24'
      }
    };
    expect(getWorkloadProfiles(basicVmSettings, templates)).toEqual([generic]);

    basicVmSettings.operatingSystem.value = 'rhel7.0';
    expect(getWorkloadProfiles(basicVmSettings, templates).sort()).toEqual([generic, highPerformance].sort());

    basicVmSettings.operatingSystem.value = 'rhel7.0';
    basicVmSettings.flavor = {
      value: 'medium'
    };
    expect(getWorkloadProfiles(basicVmSettings, templates)).toEqual([highPerformance]);

    basicVmSettings.flavor.value = 'small';
    expect(getWorkloadProfiles(basicVmSettings, templates)).toEqual([generic]);
  });
});
