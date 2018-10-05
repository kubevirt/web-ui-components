import React from 'react';
import { shallow } from 'enzyme';
import { isString } from 'lodash';
import { WizardPattern } from 'patternfly-react';
import { CreateVmWizard } from '../CreateVmWizard';
import * as request from '../../../../k8s/request';
import { rhelHighPerformance } from '../../../../k8s/mock_templates/rhel-high-p.template';
import { namespaces } from '../../NewVmWizard/fixtures/NewVmWizard.fixture';
import {
  templates,
  TEMPLATE_FLAVOR_LABEL,
  CUSTOM_FLAVOR,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_VM,
  PROVISION_SOURCE_TEMPLATE,
  PROVISION_SOURCE_PXE,
  baseTemplates,
  userTemplates
} from '../../../../constants';

const onHide = () => {};

const testCreateVmWizard = () => (
  <CreateVmWizard onHide={onHide} templates={templates} namespaces={namespaces} k8sCreate={() => {}} />
);

describe('<CreateVmWizard />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateVmWizard());
    expect(component).toMatchSnapshot();
  });
  it('is visible when mounted', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.find(WizardPattern).props().show).toBeTruthy();
  });
  it('is not valid when initially open', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.state().wizardValid).toBeFalsy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();
  });
  it('onFormChange updates state', () => {
    const nameValue = 'someName';
    const component = shallow(testCreateVmWizard());
    component.instance().onFormChange(nameValue, 'name');
    expect(component.state().basicVmSettings.name).toEqual({ value: nameValue });
  });
  it('required property is validated', () => {
    const component = shallow(testCreateVmWizard());
    component.instance().onFormChange('', 'name');
    expect(component.state().basicVmSettings.name).toEqual({ value: '', validMsg: 'Name is required' });
  });
  it('cpu field validation is triggered', () => {
    const component = shallow(testCreateVmWizard());
    component.instance().onFormChange('someCpu', 'cpu');
    expect(component.state().basicVmSettings.cpu).toEqual({ value: 'someCpu', validMsg: 'CPUs must be a number' });
  });
  it('memory field validation is triggered', () => {
    const component = shallow(testCreateVmWizard());
    component.instance().onFormChange('someMemory', 'memory');
    expect(component.state().basicVmSettings.memory).toEqual({
      value: 'someMemory',
      validMsg: 'Memory (GB) must be a number'
    });
  });
  it('is valid when all required fields are filled', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.state().wizardValid).toBeFalsy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();

    component.instance().onFormChange('name', 'name');
    component.instance().onFormChange('namespace', 'namespace');
    component.instance().onFormChange('PXE', 'imageSourceType');
    component.instance().onFormChange('operatingSystem', 'operatingSystem');
    component.instance().onFormChange('flavor', 'flavor');
    component.instance().onFormChange('workloadProfile', 'workloadProfile');

    expect(component.state().wizardValid).toBeTruthy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeFalsy();

    // new required field will become visible
    component.instance().onFormChange('URL', 'imageSourceType');

    expect(component.state().wizardValid).toBeFalsy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();
  });
  it('isImageSourceType', () => {
    const component = shallow(testCreateVmWizard());

    const basicVmSettings = {
      imageSourceType: {
        value: 'shouldReturnTrue'
      }
    };
    expect(component.instance().isImageSourceType(basicVmSettings, undefined)).toBeFalsy();
    expect(component.instance().isImageSourceType(basicVmSettings, 'shouldReturnTrue')).toBeTruthy();

    basicVmSettings.imageSourceType.value = 'shouldReturnFalse';
    expect(component.instance().isImageSourceType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings.imageSourceType.value = undefined;
    expect(component.instance().isImageSourceType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings.imageSourceType = undefined;
    expect(component.instance().isImageSourceType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    expect(component.instance().isImageSourceType(undefined, 'thisIsNotTheValue')).toBeFalsy();
  });
  it('isFlavorType', () => {
    const component = shallow(testCreateVmWizard());
    const basicVmSettings = {
      flavor: {
        value: 'shouldReturnTrue'
      }
    };
    expect(component.instance().isFlavorType(basicVmSettings, undefined)).toBeFalsy();
    expect(component.instance().isFlavorType(basicVmSettings, 'shouldReturnTrue')).toBeTruthy();

    basicVmSettings.flavor.value = 'shouldReturnFalse';
    expect(component.instance().isFlavorType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings.flavor.value = undefined;
    expect(component.instance().isFlavorType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    basicVmSettings.flavor = undefined;
    expect(component.instance().isFlavorType(basicVmSettings, 'thisIsNotTheValue')).toBeFalsy();
    expect(component.instance().isFlavorType(undefined, 'thisIsNotTheValue')).toBeFalsy();
  });
  it('getFlavorLabel', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.instance().getFlavorLabel()).toBeUndefined();

    component.setState({ basicVmSettings: {} });
    expect(component.instance().getFlavorLabel()).toBeUndefined();

    const value = 'someFlavor';
    component.setState({
      basicVmSettings: {
        flavor: {
          value
        }
      }
    });
    expect(component.instance().getFlavorLabel()).toEqual(`${TEMPLATE_FLAVOR_LABEL}/${value}`);

    component.setState({
      basicVmSettings: {
        flavor: {
          value: CUSTOM_FLAVOR
        }
      }
    });
    expect(component.instance().getFlavorLabel()).toBeUndefined();
  });
  it('getWorkloadLabel', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.instance().getWorkloadLabel()).toBeUndefined();

    component.setState({ basicVmSettings: {} });
    expect(component.instance().getWorkloadLabel()).toBeUndefined();

    const value = 'someWorkload';
    component.setState({
      basicVmSettings: {
        workloadProfile: {
          value
        }
      }
    });
    expect(component.instance().getWorkloadLabel()).toEqual(`${TEMPLATE_WORKLOAD_LABEL}/${value}`);
  });
  it('getOsLabel', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.instance().getOsLabel()).toBeUndefined();

    component.setState({ basicVmSettings: {} });
    expect(component.instance().getOsLabel()).toBeUndefined();

    const value = 'someOs';
    component.setState({
      basicVmSettings: {
        operatingSystem: {
          value
        }
      }
    });
    expect(component.instance().getOsLabel()).toEqual(`${TEMPLATE_OS_LABEL}/${value}`);
  });
  it('getTemplate', () => {
    const component = shallow(testCreateVmWizard());
    component.setProps({ templates });

    expect(component.instance().getTemplate(TEMPLATE_TYPE_BASE)).toEqual(baseTemplates);
    expect(component.instance().getTemplate(TEMPLATE_TYPE_VM)).toEqual(userTemplates);
    expect(component.instance().getTemplate('someType')).toHaveLength(0);
  });

  it('getOperatingSystems', () => {
    const fedora = ['fedora23', 'fedora24', 'fedora25', 'fedora26', 'fedora27', 'fedora28', 'fedora29'];
    const rhel = ['rhel7.0'];
    const ubuntu = ['ubuntu18.04'];
    const component = shallow(testCreateVmWizard());

    expect(
      component
        .instance()
        .getOperatingSystems()
        .sort()
    ).toEqual([...fedora, ...rhel, ...ubuntu].sort());

    const basicVmSettings = {
      workloadProfile: {
        value: 'generic'
      }
    };

    component.setState({ basicVmSettings });
    expect(
      component
        .instance()
        .getOperatingSystems()
        .sort()
    ).toEqual([...fedora, ...rhel, ...ubuntu].sort());

    basicVmSettings.workloadProfile.value = 'high-performance';
    component.setState({ basicVmSettings });
    expect(component.instance().getOperatingSystems()).toEqual([...rhel]);

    basicVmSettings.flavor = {
      value: 'medium'
    };
    component.setState({ basicVmSettings });
    expect(component.instance().getOperatingSystems()).toEqual([...rhel]);

    delete basicVmSettings.workloadProfile;
    component.setState({ basicVmSettings });
    expect(component.instance().getOperatingSystems()).toEqual([...rhel]);

    basicVmSettings.flavor.value = 'small';
    basicVmSettings.workloadProfile = {
      value: 'generic'
    };
    component.setState({ basicVmSettings });
    expect(
      component
        .instance()
        .getOperatingSystems()
        .sort()
    ).toEqual([...fedora, ...rhel, ...ubuntu].sort());
  });

  it('getFlavors', () => {
    const mediumFlavor = 'medium';
    const smallFlavor = 'small';
    const component = shallow(testCreateVmWizard());

    expect(
      component
        .instance()
        .getFlavors()
        .sort()
    ).toEqual([CUSTOM_FLAVOR, mediumFlavor, smallFlavor].sort());

    const basicVmSettings = {
      workloadProfile: {
        value: 'generic'
      }
    };

    component.setState({ basicVmSettings });
    expect(
      component
        .instance()
        .getFlavors()
        .sort()
    ).toEqual([CUSTOM_FLAVOR, smallFlavor].sort());

    basicVmSettings.workloadProfile.value = 'high-performance';
    component.setState({ basicVmSettings });
    expect(
      component
        .instance()
        .getFlavors()
        .sort()
    ).toEqual([CUSTOM_FLAVOR, mediumFlavor].sort());

    delete basicVmSettings.workloadProfile;
    basicVmSettings.operatingSystem = {
      value: 'fedora24'
    };
    component.setState({ basicVmSettings });
    expect(
      component
        .instance()
        .getFlavors()
        .sort()
    ).toEqual([CUSTOM_FLAVOR, smallFlavor].sort());

    basicVmSettings.operatingSystem.value = 'rhel7.0';
    component.setState({ basicVmSettings });
    expect(
      component
        .instance()
        .getFlavors()
        .sort()
    ).toEqual([CUSTOM_FLAVOR, smallFlavor, mediumFlavor].sort());

    basicVmSettings.workloadProfile = {
      value: 'high-performance'
    };
    component.setState({ basicVmSettings });
    expect(
      component
        .instance()
        .getFlavors()
        .sort()
    ).toEqual([CUSTOM_FLAVOR, mediumFlavor].sort());
  });
  it('getWorkloadProfiles', () => {
    const highPerformance = 'high-performance';
    const generic = 'generic';
    const component = shallow(testCreateVmWizard());

    expect(
      component
        .instance()
        .getWorkloadProfiles()
        .sort()
    ).toEqual([highPerformance, generic].sort());

    const basicVmSettings = {
      operatingSystem: {
        value: 'fedora24'
      }
    };
    component.setState({ basicVmSettings });
    expect(component.instance().getWorkloadProfiles()).toEqual([generic]);

    basicVmSettings.operatingSystem.value = 'rhel7.0';
    component.setState({ basicVmSettings });
    expect(
      component
        .instance()
        .getWorkloadProfiles()
        .sort()
    ).toEqual([generic, highPerformance].sort());

    basicVmSettings.operatingSystem.value = 'rhel7.0';
    basicVmSettings.flavor = {
      value: 'medium'
    };
    component.setState({ basicVmSettings });
    expect(component.instance().getWorkloadProfiles()).toEqual([highPerformance]);

    basicVmSettings.flavor.value = 'small';
    component.setState({ basicVmSettings });
    expect(component.instance().getWorkloadProfiles()).toEqual([generic]);
  });
  it('getName', () => {
    const component = shallow(testCreateVmWizard());
    const name = 'someName';
    const resource = {
      metadata: {
        name
      }
    };
    expect(component.instance().getName(resource)).toEqual(name);
  });
  it('dropdown values are strings', () => {
    const component = shallow(testCreateVmWizard());
    const formFields = component.instance().basicFormFields;
    const dropdownFields = Object.keys(formFields).filter(field => formFields[field].type === 'dropdown');
    dropdownFields.forEach(dropdown => {
      const formDropdown = formFields[dropdown];
      const values = typeof formDropdown.values === 'function' ? formDropdown.values() : formDropdown.values;
      values.forEach(value => {
        expect(isString(value)).toBeTruthy();
      });
    });
  });
  it('onStepChanged', () => {
    const component = shallow(testCreateVmWizard());

    // eslint-disable-next-line import/namespace
    request.createVM = (create, basicVmSettings) => {
      expect(basicVmSettings.chosenTemplate).toEqual(userTemplates[0]);
      return new Promise(() => {});
    };
    component.setState({
      basicVmSettings: {
        name: {
          value: 'userTemplate'
        },
        namespace: {
          value: 'namespace'
        },
        imageSourceType: {
          value: PROVISION_SOURCE_TEMPLATE
        },
        userTemplate: {
          value: 'linux-template'
        },
        cpu: {
          value: '1'
        },
        memory: {
          value: '3'
        }
      }
    });
    component.instance().onStepChanged(1);
    expect(component.state().activeStepIndex).toEqual(1);

    // eslint-disable-next-line import/namespace
    request.createVM = (create, basicVmSettings) => {
      expect(basicVmSettings.chosenTemplate).toEqual(rhelHighPerformance);
      return new Promise(() => {});
    };
    component.setState({
      basicVmSettings: {
        name: {
          value: 'userTemplate'
        },
        namespace: {
          value: 'namespace'
        },
        imageSourceType: {
          value: PROVISION_SOURCE_PXE
        },
        workloadProfile: {
          value: 'high-performance'
        },
        flavor: {
          value: 'medium'
        },
        operatingSystem: {
          value: 'rhel7.0'
        }
      }
    });
    component.instance().onStepChanged(1);
  });
});
