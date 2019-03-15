import DashboardCardBody from '../DashboardCardBody';

export default [
  {
    component: DashboardCardBody,
    props: { children: ['content'] },
  },
  {
    name: 'loading',
    component: DashboardCardBody,
    props: { children: ['content'], isLoading: true },
  },
];
