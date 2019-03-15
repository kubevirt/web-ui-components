import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';

const DetailItem = ({ title, value }) => (
  <React.Fragment>
    <dt className="kubevirt-detail__item-title">{title}</dt>
    <dd className="kubevirt-detail__item-value">{value}</dd>
  </React.Fragment>
);

DetailItem.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const DetailsBody = ({ data }) => (
  <dl>
    <DetailItem title="Name" value={data.name} />
    <DetailItem title="Provider" value={data.provider} />
    <DetailItem title="Openshift version" value={data.openshiftVersion} />
    <DetailItem title="Docker version" value={data.dockerVersion} />
    <DetailItem title="OS vendor" value={data.osVendor} />
  </dl>
);

DetailsBody.propTypes = {
  data: PropTypes.object.isRequired,
};

const Details = ({ data, loaded }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Details</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody isLoading={!loaded}>
      <DetailsBody data={data} />
    </DashboardCardBody>
  </DashboardCard>
);

Details.defaultProps = {
  loaded: false,
};

Details.propTypes = {
  data: PropTypes.object.isRequired,
  loaded: PropTypes.bool,
};

export default Details;
