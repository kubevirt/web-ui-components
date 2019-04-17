import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContextGenericConsumer } from '../StorageOverviewContext';
import { HealthItem, LOADING_STATE } from '../../Dashboard/Health/HealthItem';
import { HealthBody } from '../../Dashboard/Health/HealthBody';
import { InlineLoading } from '../../Loading';
import { getOCSHealthState } from '../../Dashboard/Health/utils';

export const OCSHealth = ({ response, LoadingComponent }) => {
  const state = getOCSHealthState(response);
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Health</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody isLoading={state.state === LOADING_STATE} LoadingComponent={LoadingComponent}>
        <HealthBody>
          <HealthItem message={state.message} state={state.state} />
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
