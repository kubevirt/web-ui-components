import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

const healtyIcon = (
  <div className="kubevirt-health__icon--ok">
    <Icon type="fa" name="check-circle" />
  </div>
);

const errorIcon = (
  <div className="kubevirt-health__icon--error">
    <Icon type="fa" name="exclamation-circle" />
  </div>
);

const HealthBase = ({ data }) => (
  <React.Fragment>
    {data.healthy ? healtyIcon : errorIcon}
    {data.message}
  </React.Fragment>
);

HealthBase.propTypes = {
  data: PropTypes.object.isRequired,
};

export const Health = props => <HealthBase {...props} />;
Health.title = 'Cluster health';

export const Compliance = props => <HealthBase {...props} />;
Compliance.title = 'Cluster compliance';
