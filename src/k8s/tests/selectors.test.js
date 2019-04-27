import {
  CUSTOM_FLAVOR,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_VM,
} from '../../constants';
import {
  getWorkloadLabel,
  getOsLabel,
  getFlavorLabel,
  getFlavors,
  getOperatingSystems,
  getWorkloadProfiles,
} from '../selectors';
import { getTemplate } from '../../utils/templates';
import { baseTemplates } from '../objects/template';
import { userTemplates } from '../../tests/mocks/user_template';

const templates = [...baseTemplates, ...userTemplates];

const osId = (os, nextOs) => os.id.localeCompare(nextOs.id);

describe('selectors.js', () => {
  it('getFlavorLabel', () => {
    expect(getFlavorLabel()).toBeUndefined();

    const value = 'someFlavor';
    expect(getFlavorLabel(value)).toEqual(`${TEMPLATE_FLAVOR_LABEL}/${value}`);

    expect(getFlavorLabel(CUSTOM_FLAVOR)).toBeUndefined();
  });
  it('getWorkloadLabel', () => {
    expect(getWorkloadLabel()).toBeUndefined();

    const value = 'someWorkload';
    expect(getWorkloadLabel(value)).toEqual(`${TEMPLATE_WORKLOAD_LABEL}/${value}`);
  });
  it('getOsLabel', () => {
    expect(getOsLabel()).toBeUndefined();

    const value = 'someOs';
    expect(getOsLabel(value)).toEqual(`${TEMPLATE_OS_LABEL}/${value}`);
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
    const rhel = [
      {
        id: 'rhel7.0',
        name: 'Red Hat Enterprise Linux 7.0',
      },
    ];
    const ubuntu = [
      {
        id: 'ubuntu18.04',
        name: 'Ubuntu 18.04 LTS',
      },
    ];
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

    const params = {
      workload: 'generic',
    };

    expect(getOperatingSystems(params, templates).sort(osId)).toEqual(
      [...fedora, ...rhel, ...ubuntu, ...windows].sort(osId)
    );

    params.workload = 'high-performance';

    expect(getOperatingSystems(params, templates).sort(osId)).toEqual([...rhel]);

    params.flavor = 'medium';

    expect(getOperatingSystems(params, templates)).toEqual([...rhel]);

    delete params.workload;

    expect(getOperatingSystems(params, templates).sort(osId)).toEqual([...rhel, ...windows].sort(osId));

    params.flavor = 'small';
    params.workload = 'generic';

    expect(getOperatingSystems(params, templates).sort(osId)).toEqual([...fedora, ...rhel, ...ubuntu].sort(osId));
  });

  it('getFlavors', () => {
    const mediumFlavor = 'medium';
    const smallFlavor = 'small';

    expect(getFlavors({}, templates).sort()).toEqual([CUSTOM_FLAVOR, mediumFlavor, smallFlavor].sort());

    const params = {
      workload: 'generic',
    };

    expect(getFlavors(params, templates).sort()).toEqual([CUSTOM_FLAVOR, smallFlavor, mediumFlavor].sort());

    params.workload = 'high-performance';
    expect(getFlavors(params, templates).sort()).toEqual([CUSTOM_FLAVOR, mediumFlavor].sort());

    delete params.workload;
    params.os = 'fedora24';
    expect(getFlavors(params, templates).sort()).toEqual([CUSTOM_FLAVOR, smallFlavor].sort());

    params.os = 'rhel7.0';
    expect(getFlavors(params, templates).sort()).toEqual([CUSTOM_FLAVOR, smallFlavor, mediumFlavor].sort());

    params.workload = 'high-performance';
    expect(getFlavors(params, templates).sort()).toEqual([CUSTOM_FLAVOR, mediumFlavor].sort());
  });

  it('getworkloads', () => {
    const highPerformance = 'high-performance';
    const generic = 'generic';

    expect(getWorkloadProfiles({}, templates).sort()).toEqual([highPerformance, generic].sort());

    const params = {
      os: 'fedora24',
    };
    expect(getWorkloadProfiles(params, templates)).toEqual([generic]);

    params.os = 'rhel7.0';
    expect(getWorkloadProfiles(params, templates).sort()).toEqual([generic, highPerformance].sort());

    params.os = 'rhel7.0';
    params.flavor = 'medium';
    expect(getWorkloadProfiles(params, templates)).toEqual([highPerformance]);

    params.flavor = 'small';
    expect(getWorkloadProfiles(params, templates)).toEqual([generic]);
  });
});
