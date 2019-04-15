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

const HealthBody = ({ data }) => (
  <React.Fragment>
    {data.healthy ? healtyIcon : errorIcon}
    {data.message}
  </React.Fragment>
);

HealthBody.propTypes = {
  data: PropTypes.object.isRequired,
};

export default HealthBody;
