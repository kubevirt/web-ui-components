import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'patternfly-react';

import { DASHES } from '../../../constants';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';

const DetailItem = ({ title, value, isLoading, LoadingComponent }) => {
  const description = value ? (
    <OverlayTrigger
      overlay={<Tooltip id={`tooltip-for-${title}`}>{value}</Tooltip>}
      placement="top"
      trigger={['hover', 'focus']}
      rootClose={false}
    >
      <span>{value}</span>
    </OverlayTrigger>
  ) : (
    DASHES
  );
  return (
    <React.Fragment>
      <dt className="kubevirt-detail__item-title">{title}</dt>
      <dd className="kubevirt-detail__item-value">{isLoading ? <LoadingComponent /> : description}</dd>
    </React.Fragment>
  );
};

DetailItem.defaultProps = {
  value: null,
};

DetailItem.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

const DetailsBody = ({ items, LoadingComponent }) => (
  <dl>
    {Object.keys(items).map(key => (
      <DetailItem
        key={key}
        title={items[key].title}
        value={items[key].value}
        isLoading={items[key].isLoading}
        LoadingComponent={LoadingComponent}
      />
    ))}
  </dl>
);

DetailsBody.propTypes = {
  items: PropTypes.object.isRequired,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const Details = ({ items, LoadingComponent, heading }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>{heading}</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <DetailsBody items={items} LoadingComponent={LoadingComponent} />
    </DashboardCardBody>
  </DashboardCard>
);

Details.defaultProps = {
  LoadingComponent: InlineLoading,
  heading: 'Details',
};

Details.propTypes = {
  items: PropTypes.object.isRequired,
  heading: PropTypes.string,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const DetailsConnected = () => <ClusterOverviewContextGenericConsumer Component={Details} dataPath="detailsData" />;
export default DetailsConnected;
