import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

import { InlineLoading } from '../../Loading';

export const OK_STATE = 'OK_STATE';
export const ERROR_STATE = 'ERROR_STATE';
export const WARNING_STATE = 'WARNING_STATE';
export const LOADING_STATE = 'LOADING_STATE';

const getIcon = state => {
  let icon;
  let className;
  switch (state) {
    case OK_STATE:
      icon = 'check-circle';
      className = 'ok';
      break;
    case ERROR_STATE:
      icon = 'exclamation-circle';
      className = 'error';
      break;
    case WARNING_STATE:
    default:
      icon = 'exclamation-triangle';
      className = 'warning';
  }
  return (
    <div className={`kubevirt-health__icon kubevirt-health__icon--${className}`}>
      <Icon type="fa" name={icon} />
    </div>
  );
};

export const HealthItem = ({ state, LoadingComponent, message, details }) => (
  <div className="kubevirt-health__item">
    {state === LOADING_STATE ? <LoadingComponent /> : getIcon(state)}
    <div>
      <span className="kubevirt-health__text">{message}</span>
      {details && <div className="kubevirt-health__text kubevirt-health__subtitle">{details}</div>}
    </div>
  </div>
);

HealthItem.defaultProps = {
  details: null,
  state: null,
  LoadingComponent: InlineLoading,
};

HealthItem.propTypes = {
  message: PropTypes.string.isRequired,
  details: PropTypes.string,
  state: PropTypes.string,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
