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
import { HealthItem, OK_STATE, WARNING_STATE, ERROR_STATE, LOADING_STATE } from '../../Dashboard/Health/HealthItem';
import { HealthBody } from '../../Dashboard/Health/HealthBody';

import { HEALTHY, DEGRADED, ERROR, UNKNOWN } from './strings';
import { InlineLoading } from '../../Loading';

const OCSHealthStatus = {
  0: {
    message: HEALTHY,
    state: OK_STATE,
  },
  1: {
    message: DEGRADED,
    state: WARNING_STATE,
  },
  2: {
    message: ERROR,
    state: ERROR_STATE,
  },
  3: {
    message: UNKNOWN,
    state: ERROR_STATE,
  },
};

export const getOCSHealthStatus = ocsResponse => {
  if (!ocsResponse) {
    return {state: LOADING_STATE}
  }
  const value = get(ocsResponse, 'result[0].value[1]');
  return OCSHealthStatus[value] || OCSHealthStatus[3];
}

export const OCSHealth = ({ data, loaded }) => {
  const status = getOCSHealthStatus(get(data, 'healthy.data'));
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Health</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody isLoading={!loaded} LoadingComponent={InlineLoading}>
        <HealthBody>
          <HealthItem
            message={data ? status.message : null}
            state={data ? status.state : null}
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
