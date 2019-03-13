export { ClusterOverview } from './ClusterOverview';

// TODO move all these mocked data to component fixtures once they are not needed in web-ui
// we do not include fixture files in build so we cannot reuse their mocked data
export const capacityStats = {
  stats: {
    cpuStats: {
      title: 'CPU',
      unit: 'Ghz',
      data: {
        total: 4.3,
        used: 2.2,
      },
    },
    memoryStats: {
      title: 'Memory',
      unit: 'Ti',
      data: {
        total: 200,
        used: 80,
      },
    },
    storageStats: {
      title: 'Storage',
      unit: 'Ti',
      data: {
        total: 800,
        used: 400,
      },
    },
    networkStats: {
      title: 'Network',
      unit: 'GBps',
      data: {
        total: 10,
        used: 3,
      },
    },
  },
  loaded: true,
};

export const detailsData = {
  data: {
    name: 'cluster-name',
    provider: 'Bare Metal',
    openshiftVersion: 'v4.0',
    dockerVersion: 'v1.12.5',
    osVendor: 'RHEL Server',
  },
  loaded: true,
};

export const complianceData = {
  data: {
    healthy: true,
    message: 'All nodes compliant',
  },
  loaded: true,
};

export const utilizationStats = {
  stats: {
    cpuStats: {
      title: 'CPU',
      unit: '%',
      data: [20, 50, 15, 70, 10],
    },
    ioStats: {
      title: 'I/O',
      unit: 'MBps',
      data: [12000, 10000, 5000, 20000],
    },
    latencyStats: {
      title: 'Latency',
      unit: 'ms',
      data: [2.5, 1, 20, 3.5],
    },
  },
  loaded: true,
};
