import { DetailItem } from '../DetailItem';
import { InlineLoading } from '../../../Loading';

export default [
  {
    component: DetailItem,
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
];
