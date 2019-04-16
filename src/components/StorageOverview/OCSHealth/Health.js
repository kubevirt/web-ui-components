import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContextGenericConsumer } from '../StorageOverviewContext';
import { HealthItem } from '../../Dashboard/Health/HealthItem';
import { HealthBody } from '../../Dashboard/Health/HealthBody';

import { HEALTHY, DEGRADED, ERROR, UNKNOWN } from './strings';
import { InlineLoading } from '../../Loading';

const OCSHealthStatus = {
  0: {
    message: HEALTHY,
    iconname: 'check-circle',
    classname: 'ok',
  },
  1: {
    message: DEGRADED,
    iconname: 'exclamation-circle',
    classname: 'warning',
  },
  2: {
    message: ERROR,
    iconname: 'exclamation-triangle',
    classname: 'error',
  },
  3: {
    message: UNKNOWN,
    iconname: 'exclamation-triangle',
    classname: 'error',
  },
};

export const OCSHealth = ({ data, loaded }) => {
  const value = get(data, 'healthy.data.result[0].value[1]');
  const status = OCSHealthStatus[value] || OCSHealthStatus[3];
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Health</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody isLoading={!loaded} LoadingComponent={InlineLoading}>
        <HealthBody>
          <HealthItem
            message={data ? status.message : null}
            icon={data ? status.iconname : null}
            classname={data ? status.classname : null}
          />
        </HealthBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

OCSHealth.defaultProps = {
  loaded: false,
};

OCSHealth.propTypes = {
  data: PropTypes.object.isRequired,
  loaded: PropTypes.bool,
};

const OCSHealthConnected = () => (
  <StorageOverviewContextGenericConsumer Component={OCSHealth} dataPath="ocsHealthData" />
);

export default OCSHealthConnected;
