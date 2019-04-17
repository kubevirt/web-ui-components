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
    <Icon type="fa" size="2x" name={icon} className={`kubevirt-health__icon kubevirt-health__icon--${className}`} />
  );
};

export const HealthItem = ({ state, LoadingComponent, message, details, isRow }) => (
  <div className={isRow ? 'kubevirt-health__item kubevirt-health__row' : 'kubevirt-health__item'}>
    {state === LOADING_STATE ? <LoadingComponent /> : getIcon(state)}
    <div className="kubevirt-health__message">
      <div className="kubevirt-health__title">{message}</div>
      {details && <div className="kubevirt-health__title kubevirt-health__subtitle">{details}</div>}
    </div>
  </div>
);

HealthItem.defaultProps = {
  isRow: false,
  details: null,
  state: null,
  LoadingComponent: InlineLoading,
};

HealthItem.propTypes = {
  message: PropTypes.string.isRequired,
  details: PropTypes.string,
  state: PropTypes.string,
  isRow: PropTypes.bool,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
