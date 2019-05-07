import { DetailItem } from '../DetailItem';
import { InlineLoading } from '../../../Loading';

export default [
  {
    component: DetailItem,
    name: 'Detail item',
    props: {
      title: 'title1',
      value: 'value1',
      isLoading: false,
      LoadingComponent: InlineLoading,
    },
  },
  {
    component: DetailItem,
    name: 'Loading detail item',
    props: {
      title: 'title1',
      value: 'value1',
      isLoading: true,
      LoadingComponent: InlineLoading,
    },
  },
  {
    component: DetailItem,
    name: 'Not available detail item',
    props: {
      title: 'title1',
      isLoading: false,
      LoadingComponent: InlineLoading,
    },
  },
];
