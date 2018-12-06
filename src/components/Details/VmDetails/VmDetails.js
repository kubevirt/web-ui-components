import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FieldLevelHelp } from 'patternfly-react';
import { PodModel } from '../../../models';
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

const DASHES = '---';

const cloudInitInUse = vm => getCloudInitData(vm) !== null;

const getFlattenForKind = (kind, resources) => get(resources, kind, {}).data;

const findPod = (data, name) => {
  const pods = data.filter(p => p.metadata.name.startsWith(`virt-launcher-${name}-`));
  const runningPod = pods.find(p => get(p, 'status.phase') === 'Running' || get(p, 'status.phase') === 'Pending');

  return runningPod || pods.find(p => get(p, 'status.phase') === 'Failed' || get(p, 'status.phase') === 'Unknown');
};

const FirehoseResourceLink = props => {
  if (props.loaded) {
    const data = getFlattenForKind(props.kind, props.resources);

    if (data) {
      let resource = data[0];
      if (props.filter) {
        resource = props.filter(data);
      }
      if (resource) {
        const { name, namespace, uid } = resource.metadata;
        const kind = resource.metadata.kind ? resource.metadata.kind : PodModel.kind;
        return <props.ResourceLink kind={kind} name={name} namespace={namespace} title={uid} />;
      }
    }
  }
  return DASHES;
};

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

export const VmDetails = props => {
  const { launcherPod, importerPod, migration, loaded, NodeLink, resources, ResourceLink, vm } = props;
  const nodeName = getNodeName(launcherPod);
  const description = getDescription(vm);

  // TODO Fix FieldLevelHelp content for Status
  return (
    <Fragment>
      <div className="co-m-pane__body">
        <h1 className="co-m-pane__heading">Overview</h1>
        <div className="co-m-pane__body">
          <div className="row">
            {/* Description column */}
            <div className="col-sm-4">
              <div>
                <VmStatusReporter vm={vm} />
              </div>
              {!description || <div style={{ marginTop: '10px' }}>{description}</div>}
            </div>

            {/* Details columns */}
            <div className="col-sm-8">
              <div className="row">
                {/* Details column 1 */}
                <div className="col-sm-4">
                  <dl>
                    <dt>
                      Status
                      <FieldLevelHelp content={"This is the VM's status"} />
                    </dt>
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
                    <dd>IP Address List</dd>

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

                  <dt>Project</dt>
                  <dd>Project Information</dd>

                  <dt>Pod</dt>
                  <dd>
                    <FirehoseResourceLink
                      loaded={loaded}
                      resources={resources}
                      kind={PodModel.kind}
                      filter={data => findPod(data, vm.metadata.name)}
                      ResourceLink={ResourceLink}
                    />
                  </dd>
                </div>

                {/* Details column 3 */}
                <div className="col-sm-4">
                  <dt>Cloud Init</dt>
                  <dd>
                    <OnOffReporter on={cloudInitInUse(vm)} />
                  </dd>

                  <dt>Node</dt>
                  <dd>{nodeName ? <NodeLink name={nodeName} /> : DASHES}</dd>

                  <dt>Flavor</dt>
                  <dd>
                    <div>{getFlavor(vm)}</div>
                    <br />
                    <div>{`${getCpu(vm)} CPU, ${getMemory(vm)} MB`}</div>
                  </dd>
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
  loaded: PropTypes.bool,
  resources: PropTypes.object,
  vm: PropTypes.object.isRequired,
  NodeLink: PropTypes.func.isRequired,
  ResourceLink: PropTypes.func.isRequired,
  launcherPod: PropTypes.object,
  importerPod: PropTypes.object,
  migration: PropTypes.object,
};

VmDetails.defaultProps = {
  loaded: false,
  resources: {},
  launcherPod: undefined,
  importerPod: undefined,
  migration: undefined,
};
