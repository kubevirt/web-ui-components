import React from 'react';
import PropTypes from 'prop-types';

import { Services } from '../Services';
import { TEMPLATE_VM_NAME_LABEL } from '../../../../constants';

const vm = {
  metadata: {
    name: 'my-vm',
    namespace: 'my-namespace',
  },
};

export const services = [
  {
    metadata: {
      name: 'fooService',
    },
    spec: {
      selector: {
        [TEMPLATE_VM_NAME_LABEL]: 'my-vm',
      },
    },
  },
  {
    metadata: {
      name: 'fooService1',
    },
    spec: {
      selector: {
        [TEMPLATE_VM_NAME_LABEL]: 'my-vm',
      },
    },
  },
  {
    metadata: {
      name: 'fooService2',
    },
    spec: {
      selector: {
        [TEMPLATE_VM_NAME_LABEL]: 'fooName',
      },
    },
  },
];

export const ResourceLinkComponent = ({ name }) => (
  <div>
    <a>{name}</a>
  </div>
);

ResourceLinkComponent.propTypes = {
  name: PropTypes.string.isRequired,
};

export default [
  {
    component: Services,
    props: {
      services,
      vm,
      ResourceLinkComponent,
    },
  },
  {
    name: 'No services',
    component: Services,
    props: {
      services: [],
      vm,
      ResourceLinkComponent,
    },
  },
  {
    name: 'Loading services',
    component: Services,
    props: {
      vm,
      ResourceLinkComponent,
    },
  },
];
