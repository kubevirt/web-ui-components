import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

import { getAlertSeverity, getAlertMessage, getAlertDescription } from '../../../selectors/prometheus';

const getSeverityIcon = severity => {
  switch (severity) {
    case 'critical':
      return (
        <Icon type="fa" name="exclamation-circle" className="kubevirt-alert__icon kubevirt-alert__icon--critical" />
      );
    case 'warning':
    default:
      return (
        <Icon type="fa" name="exclamation-triangle" className="kubevirt-alert__icon kubevirt-alert__icon--warning" />
      );
  }
};

export const AlertItem = ({ alert }) => (
  <div className="kubevirt-alert__item">
    {getSeverityIcon(getAlertSeverity(alert))}
    <div className="kubevirt-alert__item-message">{getAlertDescription(alert) || getAlertMessage(alert)}</div>
  </div>
);

AlertItem.propTypes = {
  alert: PropTypes.object.isRequired,
};
