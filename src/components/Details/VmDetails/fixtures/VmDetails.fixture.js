import { VmDetails } from '../VmDetails';
import { PodModel } from '../../../../models';
import { cloudInitTestVm } from '../../../../k8s/mock_vm/cloudInitTestVm.vm';
import { cloudInitTestVmi } from '../../../../k8s/mock_vmi/cloudInitTestVmi.vmi';
import { cloudInitTestPod } from '../../../../k8s/mock_pod/cloudInitTestPod.pod';

export default {
  component: VmDetails,
  props: {
    cloudInitTestVm,
    vms: [cloudInitTestVm],
    cloudInitTestVmi,
    vmis: [cloudInitTestVmi],
    cloudInitTestPod,
    pods: [cloudInitTestPod],
    PodModel,
  },
};
