import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { has, isNull } from 'lodash';
import { VmStatus } from '../../VmStatus';
import {
  getCloudInitData,
  getCpu,
  getDescription,
  getFlavor,
  getMemory,
  getNodeName,
  getOperatingSystem,
  getVmTemplate,
  getWorkloadProfile,
} from '../../../utils';
import { CUSTOM_FLAVOR } from '../../../constants';

const DASHES = '---';

const cloudInitInUse = vm => !isNull(getCloudInitData(vm));

const OnOffReporter = props => {
  const statusText = props.on ? 'On' : 'Off';
  const statusIcon = props.on ? 'pficon pficon-on' : 'pficon pficon-off';
  const statusColor = props.on ? '#3f9c35' : '#a30000';

  return (
    <span>
      <span style={{ color: `${statusColor}` }} className={statusIcon} /> {statusText}
    </span>
  );
};

OnOffReporter.propTypes = {
  on: PropTypes.bool.isRequired,
};

const VmStatusReporter = props => {
  const vmIsRunning = props.vm.spec.running;
  const statusText = vmIsRunning ? 'on' : 'off';
  const statusIcon = vmIsRunning ? 'pficon pficon-on' : 'pficon pficon-off';
  const statusColor = vmIsRunning ? '#3f9c35' : '#a30000';

  return (
    <span style={{ color: `${statusColor}` }}>
      <span className={statusIcon} /> {props.vm.metadata.name} is {statusText}
    </span>
  );
};

VmStatusReporter.propTypes = {
  vm: PropTypes.object.isRequired,
};

export const getVmIpAddresses = vmi => {
  let ipAddresses = [];
  if (has(vmi, 'status.interfaces')) {
    ipAddresses = vmi.status.interfaces.map(iface => iface.ipAddress);
  }

  return ipAddresses;
};

const Flavor = props => {
  const { vm } = props;
  const flavor = getFlavor(vm);
  if (!flavor) {
    return DASHES;
  }
  const isCustomFlavor = flavor === CUSTOM_FLAVOR;

  let resourceElement = null;
  if (isCustomFlavor) {
    const cpu = getCpu(vm);
    const memory = getMemory(vm);
    let resourceStr = '';
    resourceStr += cpu ? `${cpu} CPU` : '';
    resourceStr += memory ? `, ${memory} Memory` : '';
    resourceElement = <div>{resourceStr}</div>;
  }

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
  const ipAddresses = getVmIpAddresses(vmi);

  return (
    <Fragment>
      <div className="co-m-pane__body">
        <h1 className="co-m-pane__heading">Overview</h1>
        <div>
          <div className="row">
            {/* Description column */}
            <div className="col-sm-4">
              <div>
                <VmStatusReporter vm={vm} />
              </div>
              {!description || <div style={{ marginTop: '10px', marginRight: '40px' }}>{description}</div>}
            </div>

            {/* Details columns */}
            <div className="col-sm-8">
              <div className="row">
                {/* Details column 1 */}
                <div className="col-sm-4">
                  <dl>
                    <dt>Status</dt>
                    <dd>
                      <VmStatus
                        vm={props.vm}
                        launcherPod={launcherPod}
                        importerPod={importerPod}
                        migration={migration}
                      />
                    </dd>

                    <dt>Operating System</dt>
                    <dd>{getOperatingSystem(vm) || DASHES}</dd>

                    <dt>IP Addresses</dt>
                    <dd>{ipAddresses.length > 0 ? ipAddresses.toString() : DASHES}</dd>

                    <dt>Workload Profile</dt>
                    <dd>{getWorkloadProfile(vm) || DASHES}</dd>

                    <dt>Template</dt>
                    <dd>{getVmTemplate(vm) || DASHES}</dd>
                  </dl>
                </div>

                {/* Details column 2 */}
                <div className="col-sm-4">
                  <dt>FQDN</dt>
                  <dd>{launcherPod ? launcherPod.spec.hostname : DASHES}</dd>

                  <dt>Namespace</dt>
                  <dd>{NamespaceResourceLink}</dd>

                  <dt>Pod</dt>
                  <dd>{PodResourceLink}</dd>
                </div>

                {/* Details column 3 */}
                <div className="col-sm-4">
                  <dt>Cloud Init</dt>
                  <dd>
                    <OnOffReporter on={cloudInitInUse(vm)} />
                  </dd>

                  <dt>Node</dt>
                  <dd>{<NodeLink name={nodeName} />}</dd>

                  <dt>Flavor</dt>
                  <dd>{<Flavor vm={vm} />}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

VmDetails.propTypes = {
  vm: PropTypes.object.isRequired,
  vmi: PropTypes.object,
  launcherPod: PropTypes.object,
  importerPod: PropTypes.object,
  migration: PropTypes.object,
  NodeLink: PropTypes.func,
  NamespaceResourceLink: PropTypes.any,
  PodResourceLink: PropTypes.any,
};

VmDetails.defaultProps = {
  vmi: undefined,
  launcherPod: undefined,
  importerPod: undefined,
  migration: undefined,
  NodeLink: DASHES,
  NamespaceResourceLink: DASHES,
  PodResourceLink: DASHES,
};
