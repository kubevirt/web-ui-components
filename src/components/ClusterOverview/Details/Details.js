import React from 'react';
import PropTypes from 'prop-types';

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

export const Details = ({ data }) => (
  <dl>
    <DetailItem title="Name" value={data.name} />
    <DetailItem title="Provider" value={data.provider} />
    <DetailItem title="Openshift version" value={data.openshiftVersion} />
    <DetailItem title="Docker version" value={data.dockerVersion} />
    <DetailItem title="OS vendor" value={data.osVendor} />
  </dl>
);

Details.title = 'Details';
Details.propTypes = {
  data: PropTypes.object.isRequired,
};
