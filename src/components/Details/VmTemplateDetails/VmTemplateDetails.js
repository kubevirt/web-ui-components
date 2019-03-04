import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Row, Col, Button, Alert } from 'patternfly-react';

import {
  getCpu,
  getMemory,
  getOperatingSystem,
  getWorkloadProfile,
  getUpdateDescriptionPatch,
  getUpdateFlavorPatch,
  getUpdateCpuMemoryPatch,
  getOperatingSystemName,
  retrieveVmTemplate,
  getFlavor,
  getVmTemplate,
  addPrefixToPatch,
  getId,
  prefixedId,
} from '../../../utils';
import { TemplateModel } from '../../../models';
import { CUSTOM_FLAVOR, DASHES } from '../../../constants';
import { settingsValue, selectVm } from '../../../k8s/selectors';
import { Flavor } from '../Flavor';
import { Description } from '../Description';
import { Loading } from '../../Loading';
import { TemplateSource } from '../../TemplateSource';
import { DESCRIPTION_KEY, FLAVOR_KEY } from '../common/constants';

export class VmTemplateDetails extends React.Component {
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
    const { vmTemplate } = this.props;
    const vm = selectVm(vmTemplate.objects);
    const vmIndex = vmTemplate.objects.indexOf(vm);

    this.setEditing(false);
    const vmTemplatePatch = [];

    const descriptionForm = settingsValue(this.state.form, DESCRIPTION_KEY);
    const flavorForm = settingsValue(this.state.form, FLAVOR_KEY);

    const descriptionPatch = getUpdateDescriptionPatch(vmTemplate, settingsValue(descriptionForm, 'description'));
    vmTemplatePatch.push(...descriptionPatch);

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
      const flavorPatch = getUpdateFlavorPatch(vmTemplate, flavor);
      const cpuMemPatch = getUpdateCpuMemoryPatch(vm, cpu, memory).map(patch =>
        addPrefixToPatch(`/objects/${vmIndex}`, patch)
      );
      vmTemplatePatch.push(...flavorPatch);
      vmTemplatePatch.push(...cpuMemPatch);
    }

    if (vmTemplatePatch.length > 0) {
      this.setState({
        updating: true,
        k8sError: null,
      });
      const updatePromise = this.props.k8sPatch(TemplateModel, vmTemplate, vmTemplatePatch);
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

  render() {
    const { vmTemplate, dataVolumes, NamespaceResourceLink, LoadingComponent, k8sGet } = this.props;
    const id = getId(vmTemplate);
    const vm = selectVm(vmTemplate.objects);
    const baseTemplate = getVmTemplate(vmTemplate);

    const editButton = (
      <Button disabled={this.state.updating} onClick={() => this.setEditing(true)}>
        Edit
      </Button>
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
          Virtual Machine Template Overview
          <div>{this.state.editing ? cancelSaveButton : editButton}</div>
        </h1>
        {this.state.k8sError && <Alert onDismiss={this.onErrorDismiss}>{this.state.k8sError}</Alert>}
        <Row>
          <Col lg={4} md={4} sm={4} xs={4} id="name-description-column">
            <dl>
              <dt>Name</dt>
              <dd id={prefixedId(id, 'name')}>{vmTemplate.metadata.name}</dd>
              <dt>Description</dt>
              <dd>
                <div className="kubevirt-vm-template-details__description">
                  <Description
                    editing={this.state.editing}
                    updating={this.state.updating}
                    LoadingComponent={LoadingComponent}
                    formValues={settingsValue(this.state.form, DESCRIPTION_KEY)}
                    onFormChange={(newValue, key, valid) => this.onFormChange('description', newValue, key, valid)}
                    obj={vmTemplate}
                    id={prefixedId(id, 'description')}
                  />
                </div>
              </dd>
            </dl>
          </Col>

          <Col lg={8} md={8} sm={8} xs={8} id="details-column">
            <Row>
              <Col lg={4} md={4} sm={4} xs={4} id="details-column-1">
                <dl>
                  <dt>Operating System</dt>
                  <dd id={prefixedId(id, 'os')}>
                    {getOperatingSystemName(vmTemplate) || getOperatingSystem(vmTemplate) || DASHES}
                  </dd>
                  <dt>Workload Profile</dt>
                  <dd id={prefixedId(id, 'workload-profile')}>{getWorkloadProfile(vmTemplate) || DASHES}</dd>
                  <dt>Base Template</dt>
                  <dd id={prefixedId(id, 'base-template')}>
                    {baseTemplate ? `${baseTemplate.namespace}/${baseTemplate.name}` : DASHES}
                  </dd>
                </dl>
              </Col>

              <Col lg={4} md={4} sm={4} xs={4} id="details-column-2">
                <dl>
                  <dt>Source</dt>
                  <dd>
                    <TemplateSource template={vmTemplate} dataVolumes={dataVolumes} detailed />
                  </dd>
                  <dt>Namespace</dt>
                  <dd id={prefixedId(id, 'namespace')}>{NamespaceResourceLink ? <NamespaceResourceLink /> : DASHES}</dd>
                </dl>
              </Col>

              <Col lg={4} md={4} sm={4} xs={4} id="details-column-3">
                <dl>
                  <dt>Flavor</dt>
                  <dd>
                    <Flavor
                      flavor={getFlavor(vmTemplate) || CUSTOM_FLAVOR}
                      vm={vm}
                      id={id}
                      editing={this.state.editing}
                      updating={this.state.updating}
                      LoadingComponent={LoadingComponent}
                      onFormChange={(newValue, key, valid) => this.onFormChange('flavor', newValue, key, valid)}
                      retrieveVmTemplate={() => retrieveVmTemplate(k8sGet, vmTemplate)}
                      formValues={settingsValue(this.state.form, FLAVOR_KEY)}
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

VmTemplateDetails.propTypes = {
  vmTemplate: PropTypes.object.isRequired,
  dataVolumes: PropTypes.array,
  NamespaceResourceLink: PropTypes.func,
  k8sGet: PropTypes.func.isRequired,
  k8sPatch: PropTypes.func.isRequired,
  LoadingComponent: PropTypes.func,
};

VmTemplateDetails.defaultProps = {
  dataVolumes: [],
  NamespaceResourceLink: undefined,
  LoadingComponent: Loading,
};
