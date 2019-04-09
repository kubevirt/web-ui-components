import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Icon, UtilizationBar } from 'patternfly-react';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContext } from '../StorageOverviewContext';
import { InlineLoading } from '../../Loading';
import { getCapacityStats } from '../../../selectors/prometheus/selectors';

const DataResiliencyStatusBody = ({ isResilient }) =>
  isResilient ? (
    <Fragment>
      <div className="kubevirt-data-resiliency__status-title-ok">Your data is resilient</div>
      <div className="kubevirt-data-resiliency__icon-ok">
        <Icon type="fa" name="check-circle" size="5x" />
      </div>
    </Fragment>
  ) : (
    <Fragment>
      <div className="kubevirt-data-resiliency__icon-error">
        <Icon type="fa" name="exclamation-triangle" size="5x" />
      </div>
      <div className="kubevirt-data-resiliency__status-title-error">No data available</div>
    </Fragment>
  );

const DataResiliencyBuildBody = ({ progressPercentage }) => (
  <Fragment>
    <div className="kubevirt-data-resiliency__title">Rebuilding data resiliency</div>
    <UtilizationBar
      className="kubevirt-data-resiliency__utilization-bar"
      now={progressPercentage}
      description="Rebuilding in Progress"
      descriptionPlacementTop
      label={`${progressPercentage}%`}
    />
  </Fragment>
);

export const DataResiliency = ({ totalPgRaw, cleanAndActivePgRaw, LoadingComponent }) => {
  const totalPg = getCapacityStats(totalPgRaw);
  const cleanAndActivePg = getCapacityStats(cleanAndActivePgRaw);
  const progressPercentage =
    totalPg && cleanAndActivePg ? Number(((cleanAndActivePg / totalPg) * 100).toFixed(1)) : null;

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Data Resiliency</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody
        className="kubevirt-data-resiliency__dashboard-body"
        isLoading={!(totalPgRaw && cleanAndActivePgRaw)}
        LoadingComponent={LoadingComponent}
      >
        {progressPercentage === 100 || !progressPercentage ? (
          <DataResiliencyStatusBody isResilient={progressPercentage} />
        ) : (
          <DataResiliencyBuildBody progressPercentage={progressPercentage} />
        )}
      </DashboardCardBody>
    </DashboardCard>
  );
};

DataResiliency.defaultProps = {
  totalPgRaw: null,
  cleanAndActivePgRaw: null,
  LoadingComponent: InlineLoading,
};

DataResiliencyStatusBody.defaultProps = {
  isResilient: null,
};

DataResiliencyBuildBody.defaultProps = {
  progressPercentage: null,
};

DataResiliency.propTypes = {
  totalPgRaw: PropTypes.object,
  cleanAndActivePgRaw: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

DataResiliencyBuildBody.propTypes = {
  progressPercentage: PropTypes.number,
};

DataResiliencyStatusBody.propTypes = {
  isResilient: PropTypes.number,
};

export const DataResiliencyConnected = () => (
  <StorageOverviewContext.Consumer>{props => <DataResiliency {...props} />}</StorageOverviewContext.Consumer>
);
