export const STORAGE_PROMETHEUS_QUERIES = {
  // from storage
  CEPH_STATUS_QUERY: 'ceph_health_status',
  STORAGE_CEPH_CAPACITY_TOTAL_QUERY: 'sum(max(kubelet_volume_stats_capacity_bytes) by (persistentvolumeclaim))',
  STORAGE_CEPH_CAPACITY_USED_QUERY: 'sum(max(kubelet_volume_stats_used_bytes) by (persistentvolumeclaim))',
  STORAGE_CEPH_CAPACITY_REQUESTED_QUERY:
    'sum(max(kube_persistentvolumeclaim_resource_requests_storage_bytes) by (persistentvolumeclaim))',
  STORAGE_CEPH_CAPACITY_VMS_QUERY:
    '(sort(topk(5, sum(avg_over_time(kube_persistentvolumeclaim_resource_requests_storage_bytes[1h]) * on (namespace,persistentvolumeclaim) group_left(pod) kube_pod_spec_volumes_persistentvolumeclaims_info{pod=~"virt-launcher-.*"}) by (pod))))',
  STORAGE_CEPH_CAPACITY_PODS_QUERY:
    '(sort(topk(5, sum(avg_over_time(kube_persistentvolumeclaim_resource_requests_storage_bytes[1h]) * on (namespace,persistentvolumeclaim) group_left(pod) kube_pod_spec_volumes_persistentvolumeclaims_info) by (pod))))',
  CEPH_OSD_UP_QUERY: 'sum(ceph_osd_up)',
  CEPH_OSD_DOWN_QUERY: 'count(ceph_osd_up == 0.0) OR vector(0)',

  // from cluster
  CAPACITY_STORAGE_TOTAL_BASE_CEPH_METRIC: 'ceph_cluster_total_bytes', // available with Ceph only
  CAPACITY_STORAGE_TOTAL_QUERY: 'ceph_cluster_total_bytes',
  CAPACITY_STORAGE_TOTAL_DEFAULT_QUERY: 'sum(node_filesystem_size_bytes)',
  UTILIZATION_STORAGE_USED_QUERY: 'ceph_cluster_total_used_bytes[60m:5m]',
  UTILIZATION_STORAGE_USED_DEFAULT_QUERY: '(sum(node_filesystem_size_bytes) - sum(node_filesystem_free_bytes))[60m:5m]',
  UTILIZATION_STORAGE_IORW_QUERY: '(sum(rate(ceph_pool_wr_bytes[1m]) + rate(ceph_pool_rd_bytes[1m])))[60m:1m]',
};
