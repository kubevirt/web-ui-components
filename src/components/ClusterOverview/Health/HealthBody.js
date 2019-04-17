import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

const healtyIcon = (
  <div className="kubevirt-health__icon--ok kubevirt-health__icon">
    <Icon type="fa" name="check-circle" />
  </div>
);

const errorIcon = (
  <div className="kubevirt-health__icon--error kubevirt-health__icon">
    <Icon type="fa" name="exclamation-circle" />
  </div>
);

const HealthBody = ({ data, className }) => (
  <div className={className}>
    {data.healthy ? healtyIcon : errorIcon}
    <span className="kubevirt-health__text">{data.message}</span>
  </div>
);

HealthBody.defaultProps = {
  className: null,
};

HealthBody.propTypes = {
  data: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default HealthBody;
