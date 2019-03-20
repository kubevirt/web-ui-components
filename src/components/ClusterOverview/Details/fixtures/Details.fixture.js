import { Details } from '../Details';
import { InlineLoading } from '../../../Loading/Loading';

export const detailsData = {
  items: {
    item1: {
      title: 'title1',
      value: 'value1',
      isLoading: false,
    },
    item2: {
      title: 'title2',
      value: 'value2',
      isLoading: false,
    },
    item3: {
      title: 'title3',
      value: 'value3',
      isLoading: false,
    },
    item4: {
      title: 'title4',
      value: 'value4',
      isLoading: false,
    },
  },
  LoadingComponent: InlineLoading,
};

export const loadingDetailsData = {
  items: {
    item1: {
      title: 'title1',
      isLoading: true,
    },
    item2: {
      title: 'title2',
      isLoading: true,
    },
    item3: {
      title: 'title3',
      isLoading: true,
    },
    item4: {
      title: 'title4',
      isLoading: true,
    },
  },
  LoadingComponent: InlineLoading,
};

export default [
  {
    component: Details,
    props: { ...detailsData },
  },
  {
    component: Details,
    name: 'Loading details',
    props: { ...loadingDetailsData },
  },
];
