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

export const OCSHealth = ({ response, LoadingComponent }) => {
  const state = getOCSHealthStatus(response);
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Health</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody isLoading={state.state === LOADING_STATE} LoadingComponent={LoadingComponent}>
        <HealthBody>
          <HealthItem
            message={state.message}
            state={state.state}
          />
        </HealthBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

OCSHealth.defaultProps = {
  response: null,
  LoadingComponent: InlineLoading,
};

OCSHealth.propTypes = {
  response: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const OCSHealthConnected = () => (
  <StorageOverviewContextGenericConsumer Component={OCSHealth} dataPath="ocsHealthData" />
);

export default OCSHealthConnected;
