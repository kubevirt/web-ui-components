import React from 'react';
import PropTypes from 'prop-types';

import { NodeStatus } from '../NodeStatus';
import { NodeMaintenance } from '../../../models';

const maintenance = {
  kind: NodeMaintenance.kind,
  apiVersion: `${NodeMaintenance.apiGroup}/${NodeMaintenance.apiVersion}`,
  metadata: {
    name: 'nodemaintenance-fooNodeName',
    creationTimestamp: '2019-04-25T18:49:13Z',
  },
  spec: {
    nodeName: 'fooNodeName',
    reason: 'some reason',
  },
};

const maintenanceWithDeletionTimestamp = {
  kind: NodeMaintenance.kind,
  apiVersion: `${NodeMaintenance.apiGroup}/${NodeMaintenance.apiVersion}`,
  metadata: {
    name: 'nodemaintenance-fooNodeName',
    creationTimestamp: '2019-04-25T18:49:13Z',
    deletionTimestamp: '2019-04-26T18:49:13Z',
  },
  spec: {
    nodeName: 'fooNodeName',
    reason: 'some reason',
  },
};

const node = {
  metadata: {
    name: 'fooNodeName',
  },
};

const Timestamp = ({ timestamp }) => <span>{timestamp}</span>;
Timestamp.propTypes = {
  timestamp: PropTypes.string.isRequired,
};

export default [
  {
    component: NodeStatus,
    name: 'Under Maintenance',
    props: {
      node,
      maintenances: [maintenance],
      TimestampComponent: Timestamp,
    },
  },
  {
    component: NodeStatus,
    name: 'Stopping Maintenance',
    props: {
      node,
      maintenances: [maintenanceWithDeletionTimestamp],
      TimestampComponent: Timestamp,
    },
  },
];
