export { ClusterOverview } from './ClusterOverview';
export { ClusterOverviewContext } from './ClusterOverviewContext';

// TODO move all these mocked data to component fixtures once they are not needed in web-ui
// we do not include fixture files in build so we cannot reuse their mocked data
export const complianceData = {
  data: {
    healthy: true,
    message: 'All nodes compliant',
  },
  loaded: true,
};
