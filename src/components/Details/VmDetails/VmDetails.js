import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Row, Col, Button, Alert, FieldLevelHelp } from 'patternfly-react';

import { VmStatuses, getVmStatusDetail } from '../../VmStatus';
import {
  getCpu,
  getMemory,
  getNodeName,
  getOperatingSystem,
  getVmTemplate,
  getWorkloadProfile,
  getVmiIpAddresses,
  getUpdateDescriptionPatch,
  getUpdateFlavorPatch,
  getOperatingSystemName,
} from '../../../utils';
import { VirtualMachineModel } from '../../../models';
import { CUSTOM_FLAVOR, DASHES, VM_STATUS_OFF } from '../../../constants';
import { settingsValue, selectVm } from '../../../k8s/selectors';
import { Flavor } from '../Flavor';
import { Description } from '../Description';
import { Loading } from '../../Loading';

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

    const descriptionForm = get(this.state.form.description, 'value');
    const flavorForm = get(this.state.form.flavor, 'value');

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
      const flavorPatch = getUpdateFlavorPatch(this.props.vm, flavor, cpu, memory);
      vmPatch.push(...flavorPatch);
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
    const { launcherPod, importerPods, migration, vm } = this.props;
    if (this.state.editing && !this.isVmOff(vm, launcherPod, importerPods, migration)) {
      this.setEditing(false);
    }
  }

  isVmOff = (vm, launcherPod, importerPods, migration) => {
    const statusDetail = getVmStatusDetail(vm, launcherPod, importerPods, migration);
    return statusDetail.status === VM_STATUS_OFF;
  };

  render() {
    const {
      launcherPod,
      importerPods,
      migration,
      NodeLink,
      vm,
      vmi,
      PodResourceLink,
      NamespaceResourceLink,
      LoadingComponent,
      k8sGet,
    } = this.props;
    const vmIsOff = this.isVmOff(vm, launcherPod, importerPods, migration);
    const nodeName = getNodeName(launcherPod);
    const ipAddresses = getVmiIpAddresses(vmi);
    const template = getVmTemplate(vm);
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

    return (
      <div className="co-m-pane__body">
        <h1 className="co-m-pane__heading">
          Virtual Machine Overview
          <div>{this.state.editing ? cancelSaveButton : editButton}</div>
        </h1>
        {this.state.k8sError && <Alert onDismiss={this.onErrorDismiss}>{this.state.k8sError}</Alert>}
        <Row>
          <Col lg={4} md={4} sm={4} xs={4} id="name-description-column">
            <dl>
              <dt>Name</dt>
              <dd>{vm.metadata.name}</dd>
              <dt>Description</dt>
              <dd>
                <div className="kubevirt-vm-details__description">
                  <Description
                    editing={this.state.editing}
                    updating={this.state.updating}
                    LoadingComponent={LoadingComponent}
                    formValues={get(this.state.form.description, 'value')}
                    onFormChange={(newValue, key, valid) => this.onFormChange('description', newValue, key, valid)}
                    vm={vm}
                  />
                </div>
              </dd>
            </dl>
          </Col>

          <Col lg={8} md={8} sm={8} xs={8} id="details-column">
            <Row>
              <Col lg={4} md={4} sm={4} xs={4} id="details-column-1">
                <dl>
                  <dt>Status</dt>
                  <dd>
                    <VmStatuses
                      vm={this.props.vm}
                      launcherPod={launcherPod}
                      importerPods={importerPods}
                      migration={migration}
                    />
                  </dd>

                  <dt>Operating System</dt>
                  <dd>{getOperatingSystemName(vm) || getOperatingSystem(vm) || DASHES}</dd>

                  <dt>IP Addresses</dt>
                  <dd>{ipAddresses.length > 0 ? ipAddresses.join(', ') : DASHES}</dd>

                  <dt>Workload Profile</dt>
                  <dd>{getWorkloadProfile(vm) || DASHES}</dd>

                  <dt>Template</dt>
                  <dd>{template ? `${template.namespace}/${template.name}` : DASHES}</dd>
                </dl>
              </Col>

              <Col lg={4} md={4} sm={4} xs={4} id="details-column-2">
                <dl>
                  <dt>FQDN</dt>
                  <dd>{get(launcherPod, 'spec.hostname', DASHES)}</dd>

                  <dt>Namespace</dt>
                  <dd>{NamespaceResourceLink ? <NamespaceResourceLink /> : DASHES}</dd>

                  <dt>Pod</dt>
                  <dd>{PodResourceLink ? <PodResourceLink /> : DASHES}</dd>
                </dl>
              </Col>

              <Col lg={4} md={4} sm={4} xs={4} id="details-column-3">
                <dl>
                  <dt>Node</dt>
                  <dd>{nodeName && NodeLink ? <NodeLink name={nodeName} /> : DASHES}</dd>

                  <dt>Flavor</dt>
                  <dd>
                    <Flavor
                      vm={vm}
                      editing={this.state.editing}
                      updating={this.state.updating}
                      LoadingComponent={LoadingComponent}
                      onFormChange={(newValue, key, valid) => this.onFormChange('flavor', newValue, key, valid)}
                      k8sGet={k8sGet}
                      formValues={get(this.state.form.flavor, 'value')}
                      onLoadError={this.onLoadError}
                    />
                  </dd>
                </dl>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

VmDetails.propTypes = {
  vm: PropTypes.object.isRequired,
  vmi: PropTypes.object,
  launcherPod: PropTypes.object,
  importerPods: PropTypes.array,
  migration: PropTypes.object,
  NodeLink: PropTypes.func,
  NamespaceResourceLink: PropTypes.func,
  PodResourceLink: PropTypes.func,
  k8sPatch: PropTypes.func.isRequired,
  k8sGet: PropTypes.func.isRequired,
  LoadingComponent: PropTypes.func,
};

VmDetails.defaultProps = {
  vmi: undefined,
  launcherPod: undefined,
  importerPods: undefined,
  migration: undefined,
  NamespaceResourceLink: undefined,
  PodResourceLink: undefined,
  LoadingComponent: Loading,
  NodeLink: undefined,
};
