import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Button, Alert, FieldLevelHelp } from 'patternfly-react';
import classNames from 'classnames';

import { VmStatuses } from '../../VmStatus';
import { getVmStatus, VM_STATUS_OFF } from '../../../utils/status/vm';
import {
  getCpu,
  getMemory,
  getNodeName,
  getOperatingSystem,
  getVmTemplate,
  getWorkloadProfile,
  getVmiIpAddresses,
  getOperatingSystemName,
  getHostName,
  getFlavor,
  getId,
  getDescription,
} from '../../../selectors';
import {
  getUpdateDescriptionPatch,
  getUpdateFlavorPatch,
  retrieveVmTemplate,
  getUpdateCpuMemoryPatch,
  prefixedId,
} from '../../../utils';
import { VirtualMachineModel } from '../../../models';
import { CUSTOM_FLAVOR, DASHES } from '../../../constants';
import { settingsValue, selectVm } from '../../../k8s/selectors';
import { Flavor } from '../Flavor';
import { Description } from '../Description';
import { Loading } from '../../Loading';
import { DESCRIPTION_KEY, FLAVOR_KEY } from '../common/constants';
import { BootOrder } from '../BootOrder';
import { getBootableDevicesInOrder } from '../../../k8s/vmBuilder';

export const isVmOff = vmStatus => vmStatus.status === VM_STATUS_OFF;

export class VmDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      updating: false,
      k8sError: null,
      form: {},
    };
  }

  setEditing = editing =>
    this.setState({
      editing,
    });

  onFormChange = (formKey, newValue, key, valid) =>
    this.setState(state => ({
      form: {
        ...state.form,
        [formKey]: {
          value: {
            ...(get(state.form[formKey], 'value') || {}),
            [key]: newValue,
          },
          valid,
        },
      },
    }));

  onLoadError = error =>
    this.setState({
      k8sError: error,
    });

  updateVmDetails = () => {
    this.setEditing(false);
    const vmPatch = [];

    const descriptionForm = settingsValue(this.state.form, DESCRIPTION_KEY);
    const flavorForm = settingsValue(this.state.form, FLAVOR_KEY);

    const descriptionPatch = getUpdateDescriptionPatch(this.props.vm, settingsValue(descriptionForm, 'description'));
    vmPatch.push(...descriptionPatch);

    const flavor = settingsValue(flavorForm, 'flavor');
    let cpu;
    let memory;
    if (flavor !== CUSTOM_FLAVOR && flavorForm.template) {
      const templateVm = selectVm(flavorForm.template.objects);
      cpu = getCpu(templateVm);
      memory = getMemory(templateVm);
    } else {
      cpu = settingsValue(flavorForm, 'cpu');
      memory = `${settingsValue(flavorForm, 'memory')}G`;
    }

    if (flavor && cpu && memory) {
      const flavorPatch = getUpdateFlavorPatch(this.props.vm, flavor);
      const cpuMemPatch = getUpdateCpuMemoryPatch(this.props.vm, cpu, memory);
      vmPatch.push(...flavorPatch);
      vmPatch.push(...cpuMemPatch);
    }

    if (vmPatch.length > 0) {
      this.setState({
        updating: true,
        k8sError: null,
      });
      const updatePromise = this.props.k8sPatch(VirtualMachineModel, this.props.vm, vmPatch);
      updatePromise
        .then(() => this.setState({ updating: false }))
        .catch(error =>
          this.setState({ updating: false, k8sError: error.message || 'An error occurred. Please try again.' })
        );
    }
  };

  onErrorDismiss = () =>
    this.setState({
      k8sError: null,
    });

  isFormValid = () => Object.keys(this.state.form).every(key => this.state.form[key].valid);

  componentDidUpdate() {
    const { pods, importerPods, migrations, vm } = this.props;
    if (this.state.editing && !isVmOff(getVmStatus(vm, pods, migrations, importerPods))) {
      this.setEditing(false);
    }
  }

  render() {
    const {
      pods,
      importerPods,
      migrations,
      NodeLink,
      vm,
      vmi,
      PodResourceLink,
      NamespaceResourceLink,
      LoadingComponent,
      k8sGet,
      overview,
    } = this.props;

    const vmStatus = getVmStatus(vm, pods, migrations, importerPods);
    const { launcherPod } = vmStatus;
    const vmIsOff = isVmOff(vmStatus);
    const nodeName = getNodeName(launcherPod);
    const ipAddresses = vmIsOff ? [] : getVmiIpAddresses(vmi);
    const hostName = getHostName(launcherPod);
    const fqdn = vmIsOff || !hostName ? DASHES : hostName;
    const template = getVmTemplate(vm);
    const id = getId(vm);
    const sortedBootableDevices = getBootableDevicesInOrder(vm);
    const editButton = (
      <Fragment>
        {!vmIsOff && (
          <div className="kubevirt-vm-details__edit-info">
            <FieldLevelHelp placement="top" content="Please turn off the VM before editing" />
          </div>
        )}
        <Button disabled={this.state.updating || !vmIsOff} onClick={() => this.setEditing(true)}>
          Edit
        </Button>
      </Fragment>
    );
    const cancelSaveButton = (
      <Fragment>
        <Button onClick={() => this.setEditing(false)}>Cancel</Button>
        <Button bsStyle="primary" disabled={!this.isFormValid()} onClick={this.updateVmDetails}>
          Save
        </Button>
      </Fragment>
    );
    const header = (
      <Fragment>
        <h1 className="co-m-pane__heading">
          Virtual Machine Overview
          <div>{this.state.editing ? cancelSaveButton : editButton}</div>
        </h1>
        {this.state.k8sError && <Alert onDismiss={this.onErrorDismiss}>{this.state.k8sError}</Alert>}
      </Fragment>
    );

    return (
      <Fragment>
        {!overview && header}
        <div className={classNames('kubevirt-vm-details__content', { 'kubevirt-vm-details--with-border': overview })}>
          <dl
            className={classNames('kubevirt-vm-details__name-list', {
              'kubevirt-vm-details--with-border': overview,
              'kubevirt-vm-details__item--hidden': overview && !getDescription(vm),
            })}
          >
            <dt className={classNames({ 'kubevirt-vm-details__item--hidden': overview })}>Name</dt>
            <dd id={prefixedId(id, 'name')} className={classNames({ 'kubevirt-vm-details__item--hidden': overview })}>
              {vm.metadata.name}
            </dd>
            <dt className={classNames({ 'kubevirt-vm-details__item--hidden': overview })}>Description</dt>
            <dd>
              <div className="kubevirt-vm-details__description">
                <Description
                  editing={this.state.editing}
                  updating={this.state.updating}
                  LoadingComponent={LoadingComponent}
                  formValues={settingsValue(this.state.form, DESCRIPTION_KEY)}
                  onFormChange={(newValue, key, valid) => this.onFormChange('description', newValue, key, valid)}
                  obj={vm}
                  id={prefixedId(id, 'description')}
                />
              </div>
            </dd>
          </dl>
          <div className="kubevirt-vm-details__details">
            <dl className="kubevirt-vm-details__details-list">
              <dt>Status</dt>
              <dd>
                <VmStatuses vm={vm} pods={pods} importerPods={importerPods} migrations={migrations} />
              </dd>

              <dt>Operating System</dt>
              <dd id={prefixedId(id, 'os')}>{getOperatingSystemName(vm) || getOperatingSystem(vm) || DASHES}</dd>

              <dt>IP Addresses</dt>
              <dd id={prefixedId(id, 'ip-addresses')}>{ipAddresses.length > 0 ? ipAddresses.join(', ') : DASHES}</dd>

              <dt>Workload Profile</dt>
              <dd id={prefixedId(id, 'workload-profile')}>{getWorkloadProfile(vm) || DASHES}</dd>

              <dt>Template</dt>
              <dd id={prefixedId(id, 'template')}>{template ? `${template.namespace}/${template.name}` : DASHES}</dd>
            </dl>
            <div className="kubevirt-vm-details__other-details">
              <dl className="kubevirt-vm-details__details-list">
                <dt>FQDN</dt>
                <dd id={prefixedId(id, 'fqdn')}>{fqdn}</dd>

                <dt>Namespace</dt>
                <dd id={prefixedId(id, 'namespace')}>{NamespaceResourceLink ? <NamespaceResourceLink /> : DASHES}</dd>

                <dt>Pod</dt>
                <dd id={prefixedId(id, 'pod')}>{PodResourceLink ? <PodResourceLink pod={launcherPod} /> : DASHES}</dd>

                <dt>Boot Order</dt>
                <dd id={prefixedId(id, 'boot-order')}>
                  {sortedBootableDevices.length > 0 ? <BootOrder bootableDevices={sortedBootableDevices} /> : DASHES}
                </dd>
              </dl>
              <dl className="kubevirt-vm-details__details-list">
                <dt>Node</dt>
                <dd id={prefixedId(id, 'node')}>{nodeName && NodeLink ? <NodeLink name={nodeName} /> : DASHES}</dd>

                <dt>Flavor</dt>
                <dd>
                  <Flavor
                    flavor={getFlavor(vm) || CUSTOM_FLAVOR}
                    id={id}
                    vm={vm}
                    editing={this.state.editing}
                    updating={this.state.updating}
                    LoadingComponent={LoadingComponent}
                    onFormChange={(newValue, key, valid) => this.onFormChange('flavor', newValue, key, valid)}
                    retrieveVmTemplate={() => retrieveVmTemplate(k8sGet, vm)}
                    formValues={settingsValue(this.state.form, FLAVOR_KEY)}
                    onLoadError={this.onLoadError}
                  />
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

VmDetails.propTypes = {
  vm: PropTypes.object.isRequired,
  vmi: PropTypes.object,
  pods: PropTypes.array,
  importerPods: PropTypes.array,
  migrations: PropTypes.array,
  NodeLink: PropTypes.func,
  NamespaceResourceLink: PropTypes.func,
  PodResourceLink: PropTypes.func,
  k8sPatch: PropTypes.func.isRequired,
  k8sGet: PropTypes.func.isRequired,
  LoadingComponent: PropTypes.func,
  overview: PropTypes.bool,
};

VmDetails.defaultProps = {
  vmi: undefined,
  pods: undefined,
  importerPods: undefined,
  migrations: undefined,
  NamespaceResourceLink: undefined,
  PodResourceLink: undefined,
  LoadingComponent: Loading,
  NodeLink: undefined,
  overview: false,
};
