import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import VMWareControllerStatusRowComponent from '../VMWareControllerStatusRow';
import {
  vmWareDeploymentFailed,
  vmWareDeploymentProgressing,
  vmWareDeploymentFailedPod,
} from '../../../../../../tests/mocks/v2v';

const VMWareControllerStatusRow = props => (
  <BrowserRouter>
    <VMWareControllerStatusRowComponent {...props} />
  </BrowserRouter>
);

export default [
  {
    name: 'Deploying',
    component: VMWareControllerStatusRow,
    props: {
      deployment: vmWareDeploymentProgressing,
    },
  },
  {
    name: 'Deployment failed',
    component: VMWareControllerStatusRow,
    props: {
      deployment: vmWareDeploymentFailed,
    },
  },
  {
    name: 'Deployment Pod failed',
    component: VMWareControllerStatusRow,
    props: {
      deployment: vmWareDeploymentProgressing,
      deploymentPods: [vmWareDeploymentFailedPod],
    },
  },
];
