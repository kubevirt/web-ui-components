import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'patternfly-react';

import { DASHES } from '../../../constants';

export const DetailItem = ({ title, value, isLoading, LoadingComponent }) => {
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
