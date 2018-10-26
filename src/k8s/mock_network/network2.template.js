export const network2 = {
  apiVersion: 'k8s.cni.cncf.io/v1',
  kind: 'NetworkAttachmentDefinition',
  metadata: {
    name: 'pxe-net-conf2'
  },
  spec: {
    config: '{ "cniVersion": "0.3.1", "type": "ovs", "bridge": "br1" }'
  }
};
