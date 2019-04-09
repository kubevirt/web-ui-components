export const STORAGE_PROMETHEUS_QUERIES = {
  // from storage
  CEPH_STATUS_QUERY: 'ceph_health_status',
  STORAGE_CEPH_CAPACITY_TOTAL_QUERY: 'ceph_cluster_total_bytes',
  STORAGE_CEPH_CAPACITY_USED_QUERY: 'ceph_cluster_total_used_bytes',
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
