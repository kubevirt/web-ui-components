import React from 'react';

import { DetailsBody } from '../DetailsBody';
import { DetailItem } from '../DetailItem';
import { InlineLoading } from '../../../Loading';

export default {
  component: DetailsBody,
  props: {
    children: <DetailItem key="name" title="Name" value="fooName" isLoading={false} LoadingComponent={InlineLoading} />,
  },
};
