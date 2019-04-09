import { getVmStatus, VM_STATUS_ALL_ERROR, VM_STATUS_ALL_PROGRESS } from '../../../utils/status/vm';
import { getPodStatus, POD_STATUS_ALL_ERROR, POD_STATUS_ALL_PROGRESS } from '../../../utils/status/pod';
import { getNodeStatus, NODE_STATUS_ALL_ERROR, NODE_STATUS_ALL_WARN } from '../../../utils/status/node';
import { getPvcStatus, PVC_STATUS_ALL_ERROR, PVC_STATUS_ALL_PROGRESS } from '../../../utils/status/pvc';
import { getHostStatus, HOST_STATUS_ALL_ERROR, HOST_STATUS_ALL_WARN } from '../../../utils/status/host';
import { getPvStatus, PV_STATUS_ALL_ERROR, PV_STATUS_ALL_PROGRESS } from '../../../utils/status/pv';

// same as InventoryItemStatus props
export const STATUS_RESULT_OK = 'ok';
export const STATUS_RESULT_WARN = 'warn';
export const STATUS_RESULT_ERROR = 'error';
export const STATUS_RESULT_IN_PROGRESS = 'inProgress';

const mapStatuses = (entities, mapEntityToStatusResult) => {
  const result = {
    [STATUS_RESULT_OK]: 0,
    [STATUS_RESULT_WARN]: 0,
    [STATUS_RESULT_ERROR]: 0,
    [STATUS_RESULT_IN_PROGRESS]: 0,
    count: null,
  };

  if (entities) {
    entities.forEach(entity => {
      const resolvedStatusResult = (mapEntityToStatusResult && mapEntityToStatusResult(entity)) || STATUS_RESULT_OK;
      result[resolvedStatusResult]++;
    });
    result.count = entities.length;
  }

  return result;
};

const resolveStatusResult = (status, mapper) =>
  Object.keys(mapper).find(key => mapper[key].includes(status)) || STATUS_RESULT_OK;

export const mapNodesToProps = nodes =>
  mapStatuses(nodes, node =>
    resolveStatusResult(getNodeStatus(node).status, {
      [STATUS_RESULT_ERROR]: NODE_STATUS_ALL_ERROR,
      [STATUS_RESULT_WARN]: NODE_STATUS_ALL_WARN,
    })
  );

export const mapVmsToProps = (vms, pods, migrations) =>
  mapStatuses(vms, vm =>
    resolveStatusResult(getVmStatus(vm, pods, migrations).status, {
      [STATUS_RESULT_ERROR]: VM_STATUS_ALL_ERROR,
      [STATUS_RESULT_IN_PROGRESS]: VM_STATUS_ALL_PROGRESS,
    })
  );

export const mapPvcsToProps = pvcs =>
  mapStatuses(pvcs, pvc =>
    resolveStatusResult(getPvcStatus(pvc).status, {
      [STATUS_RESULT_ERROR]: PVC_STATUS_ALL_ERROR,
      [STATUS_RESULT_IN_PROGRESS]: PVC_STATUS_ALL_PROGRESS,
    })
  );

export const mapPvsToProps = pvs =>
  mapStatuses(pvs, pv =>
    resolveStatusResult(getPvStatus(pv).status, {
      [STATUS_RESULT_ERROR]: PV_STATUS_ALL_ERROR,
      [STATUS_RESULT_IN_PROGRESS]: PV_STATUS_ALL_PROGRESS,
    })
  );

export const mapPodsToProps = pods =>
  mapStatuses(pods, pod =>
    resolveStatusResult(getPodStatus(pod).status, {
      [STATUS_RESULT_ERROR]: POD_STATUS_ALL_ERROR,
      [STATUS_RESULT_IN_PROGRESS]: POD_STATUS_ALL_PROGRESS,
    })
  );

export const mapHostsToProps = hosts =>
  mapStatuses(hosts, host =>
    resolveStatusResult(getHostStatus(host).status, {
      [STATUS_RESULT_ERROR]: HOST_STATUS_ALL_ERROR,
      [STATUS_RESULT_WARN]: HOST_STATUS_ALL_WARN,
    })
  );
