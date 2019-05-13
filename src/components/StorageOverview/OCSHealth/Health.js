import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { HealthItem, LOADING_STATE } from '../../Dashboard/Health/HealthItem';
import { HealthBody } from '../../Dashboard/Health/HealthBody';
import { InlineLoading } from '../../Loading';
import { getOCSHealthState } from '../../Dashboard/Health/utils';
import { StorageOverviewContext } from '../StorageOverviewContext';

export const OCSHealth = ({ ocsHealthResponse, LoadingComponent }) => {
  const state = getOCSHealthState(ocsHealthResponse);
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
  ocsHealthResponse: null,
  LoadingComponent: InlineLoading,
};

OCSHealth.propTypes = {
  ocsHealthResponse: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const OCSHealthConnected = () => (
  <StorageOverviewContext.Consumer>{props => <OCSHealth {...props} />}</StorageOverviewContext.Consumer>
);
