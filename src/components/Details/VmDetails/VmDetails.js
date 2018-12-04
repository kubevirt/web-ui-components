import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { forEach, get, has } from 'lodash';
import { FieldLevelHelp } from 'patternfly-react';
import { PodModel, VirtualMachineInstanceMigrationModel, VirtualMachineModel } from '../../../models';
import { VmStatus } from '../../VmStatus';

const DASHES = '---';
const VIRT_LAUNCHER_POD_PREFIX = 'virt-launcher-';
const IMPORTER_DV_POD_PREFIX = 'importer-datavolume-';

const cloudInitInUse = vm => {
  let inUse = false;

  // Get volumes with 'cloudInitNoCloud' property
  const volumes = get(vm, 'spec.template.spec.volumes', []);
  const cloudInitVolumes = volumes
    .map(vol => (has(vol, 'cloudInitNoCloud') ? vol.name : null))
    .filter(name => name !== null);

  if (cloudInitVolumes.length === 0) {
    return inUse;
  }

  // Check for disks using a volume with 'cloudInitNoCloud' property
  const disks = get(vm, 'spec.template.spec.domain.devices.disks', []);
  inUse = forEach(disks, disk => cloudInitVolumes.includes(disk.volumeName)).reduce(
    (acc, currValue) => acc && currValue
  );

  return inUse;
};

const getPod = (vm, resources, podNamePrefix) => {
  const podData = getFlattenForKind(PodModel.kind, resources);
  return findPod(podData, vm.metadata.name, podNamePrefix);
};

const getMigration = (vm, resources) => {
  const migrationData = getFlattenForKind(VirtualMachineInstanceMigrationModel.kind, resources);
  return findVMIMigration(migrationData, vm.metadata.name);
};

export const findVMIMigration = (data, vmiName) => {
  if (!data || !data.items) {
    return null;
  }
  const migrations = data.items.filter(m => m.spec.vmiName === vmiName);
  return migrations.find(m => !get(m, 'status.completed') && !get(m, 'status.failed'));
};

const StateColumn = props => {
  if (props.loaded) {
    const vm = getFlattenForKind(VirtualMachineModel.kind, props.resources);
    if (vm) {
      return (
        <VmStatus
          vm={vm}
          launcherPod={getPod(vm, props.resources, VIRT_LAUNCHER_POD_PREFIX)}
          importerPod={getPod(vm, props.resources, IMPORTER_DV_POD_PREFIX)}
          migration={getMigration(vm, props.resources)}
        />
      );
    }
  }
  return DASHES;
};

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

const NodeResourceLink = props => {
  const { loaded, vm, NodeLink, resources } = props;
  let nodeName = null;

  if (loaded) {
    const pod = getPod(vm, resources, VIRT_LAUNCHER_POD_PREFIX);
    nodeName = pod ? pod.spec.nodeName : null;
  }

  return nodeName ? <NodeLink name={nodeName} /> : DASHES;
};

NodeResourceLink.propTypes = {
  loaded: PropTypes.bool.isRequired,
  vm: PropTypes.object.isRequired,
  NodeLink: PropTypes.func.isRequired,
  resources: PropTypes.array.isRequired,
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
  const { loaded, NodeLink, resources, ResourceLink, vm } = props;
  const pod = getPod(vm, resources, VIRT_LAUNCHER_POD_PREFIX);

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
              <dd>{get(vm, 'metadata.annotations.description', DASHES)}</dd>
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
                      <StateColumn vm={vm} loaded={props.loaded} resources={props.resources} />
                    </dd>

                    <dt>Operating System</dt>
                    <dd>{get(vm, 'metadata.annotations["os.template.cnv.io"]', DASHES)}</dd>

                    <dt>IP Addresses</dt>
                    <dd>IP Address List</dd>

                    <dt>Workload Profile</dt>
                    <dd>{get(vm, 'metadata.annotations["workload.template.cnv.io"]', DASHES)}</dd>

                    <dt>Template</dt>
                    <dd>{get(vm, 'metadata.annotations["template.cnv.ui"]', DASHES)}</dd>
                  </dl>
                </div>

                {/* Details column 2 */}
                <div className="col-sm-4">
                  <dt>FQDN</dt>
                  <dd>{pod ? pod.spec.hostname : DASHES}</dd>

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
                  <dd>
                    <NodeResourceLink loaded={loaded} vm={vm} resources={resources} NodeLink={NodeLink} />
                  </dd>

                  <dt>Flavor</dt>
                  <dd>{get(vm, 'metadata.annotations["flavor.template.cnv.io"]', DASHES)}</dd>
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
  NodeLink: PropTypes.func.isRequired,
  resources: PropTypes.array,
  ResourceLink: PropTypes.func.isRequired,
  vm: PropTypes.object.isRequired,
};

VmDetails.defaultProps = {
  vmis: [],
  loaded: false,
  resources: [],
};
