import { Url } from '../Url';
import { LONG_ISO_URL } from '../../../../tests/mocks/user_template/url.mock';

export default [
  {
    name: 'long',
    component: Url,
    props: {
      url: LONG_ISO_URL,
    },
  },
  {
    name: 'short',
    component: Url,
    props: {
      url: LONG_ISO_URL,
      short: true,
    },
  },
];
