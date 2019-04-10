import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';
import { get } from 'lodash';

const HealthStatus = {
  0: {
    message: 'OCS is healthy',
    iconname: 'check-circle',
    classname: 'ok',
  },
  1: {
    message: 'OCS is degraded',
    iconname: 'exclamation-circle',
    classname: 'warning',
  },
  2: {
    message: 'OCS health is in error state',
    iconname: 'exclamation-triangle',
    classname: 'error',
  },
  3: {
    message: 'Cannot get OCS health',
    iconname: 'exclamation-triangle',
    classname: 'error',
  },
};

const HealthBody = ({ data }) => {
  const status = get(data, 'healthy.data.result[0].value[1]', '3');
  const klass = HealthStatus[+status];
  return klass ? (
    <React.Fragment>
      <div className="kubevirt-ocs-health__icon">
        <Icon type="fa" size="2x" name={klass.iconname} className={`kubevirt-ocs-health__icon--${klass.classname}`} />
        <span className="kubevirt-ocs-health__row-status-item-text">{klass.message}</span>
      </div>
    </React.Fragment>
  ) : null;
};

HealthBody.propTypes = {
  data: PropTypes.object.isRequired,
};

export default HealthBody;
