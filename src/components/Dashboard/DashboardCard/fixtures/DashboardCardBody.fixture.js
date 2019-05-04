import DashboardCardBody from '../DashboardCardBody';

export default [
  {
    component: DashboardCardBody,
    name: 'Card body',
    props: { children: ['content'] },
  },
  {
    component: DashboardCardBody,
    name: 'Loading card body',
    props: { children: ['content'], isLoading: true },
  },
];
