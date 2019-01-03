import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Row, Col } from 'patternfly-react';
import { VmStatus } from '../../VmStatus';
import {
  getCpu,
  getDescription,
  getFlavor,
  getMemory,
  getNodeName,
  getOperatingSystem,
  getVmTemplate,
  getWorkloadProfile,
  getVmiIpAddresses,
} from '../../../utils';

const DASHES = '---';

const Flavor = props => {
  const { vm } = props;
  const flavor = getFlavor(vm);
  if (!flavor) {
    return DASHES;
  }
  const cpu = getCpu(vm);
  const memory = getMemory(vm);
  const cpuStr = cpu ? `${cpu} CPU` : '';
  const memoryStr = memory ? `${memory} Memory` : '';
  const resourceStr = cpuStr && memoryStr ? `${cpuStr}, ${memoryStr}` : `${cpuStr}${memoryStr}`;
  const resourceElement = resourceStr ? <div>{resourceStr}</div> : undefined;

  return (
    <Fragment>
      <div>{flavor}</div>
      {resourceElement}
    </Fragment>
  );
};

Flavor.propTypes = {
  vm: PropTypes.object.isRequired,
};

export const VmDetails = props => {
  const { launcherPod, importerPod, migration, NodeLink, vm, vmi, PodResourceLink, NamespaceResourceLink } = props;
  const nodeName = getNodeName(launcherPod);
  const description = getDescription(vm);
  const ipAddresses = getVmiIpAddresses(vmi);

  return (
    <div className="co-m-pane__body">
      <h1 className="co-m-pane__heading">Virtual Machine Overview</h1>
      <Row>
        <Col lg={4} md={4} sm={4} xs={4} id="name-description-column">
          <dl>
            <dt>Name</dt>
            <dd>{vm.metadata.name}</dd>
            <dt>Description</dt>
            <dd>
              <div className="kubevirt-vm-details__description">{description || 'VM has no description'}</div>
            </dd>
          </dl>
        </Col>

        <Col lg={8} md={8} sm={8} xs={8} id="details-column">
          <Row>
            <Col lg={4} md={4} sm={4} xs={4} id="details-column-1">
              <dl>
                <dt>Status</dt>
                <dd>
                  <VmStatus vm={props.vm} launcherPod={launcherPod} importerPod={importerPod} migration={migration} />
                </dd>

                <dt>Operating System</dt>
                <dd>{getOperatingSystem(vm) || DASHES}</dd>

                <dt>IP Addresses</dt>
                <dd>{ipAddresses.length > 0 ? ipAddresses.join(', ') : DASHES}</dd>

                <dt>Workload Profile</dt>
                <dd>{getWorkloadProfile(vm) || DASHES}</dd>

                <dt>Template</dt>
                <dd>{getVmTemplate(vm) || DASHES}</dd>
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
                <dd>{nodeName ? <NodeLink name={nodeName} /> : DASHES}</dd>

                <dt>Flavor</dt>
                <dd>
                  <Flavor vm={vm} />
                </dd>
              </dl>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

VmDetails.propTypes = {
  vm: PropTypes.object.isRequired,
  vmi: PropTypes.object,
  launcherPod: PropTypes.object,
  importerPod: PropTypes.object,
  migration: PropTypes.object,
  NodeLink: PropTypes.func.isRequired,
  NamespaceResourceLink: PropTypes.func,
  PodResourceLink: PropTypes.func,
};

VmDetails.defaultProps = {
  vmi: undefined,
  launcherPod: undefined,
  importerPod: undefined,
  migration: undefined,
  NamespaceResourceLink: undefined,
  PodResourceLink: undefined,
};
