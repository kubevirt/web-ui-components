import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

const StatusPropTypes = {
  count: PropTypes.number.isRequired,
};

const OkStatus = ({ count }) => (
  <div className="kubevirt-inventory__row-status-item">
    <Icon type="fa" name="check-circle" size="2x" className="kubevirt-inventory__row-status-item-icon--ok" />
    <span className="kubevirt-inventory__row-status-item-text">{count}</span>
  </div>
);

OkStatus.propTypes = StatusPropTypes;

const WarnStatus = ({ count }) => (
  <div className="kubevirt-inventory__row-status-item">
    <Icon type="fa" name="exclamation-triangle" size="2x" className="kubevirt-inventory__row-status-item-icon--warn" />
    <span className="kubevirt-inventory__row-status-item-text">{count}</span>
  </div>
);

WarnStatus.propTypes = StatusPropTypes;

const ErrorStatus = ({ count }) => (
  <div className="kubevirt-inventory__row-status-item">
    <Icon type="fa" name="exclamation-circle" size="2x" className="kubevirt-inventory__row-status-item-icon--error" />
    <span className="kubevirt-inventory__row-status-item-text">{count}</span>
  </div>
);

ErrorStatus.propTypes = StatusPropTypes;

const InProgressStatus = ({ count }) => (
  <div className="kubevirt-inventory__row-status-item">
    <Icon type="pf" name="in-progress" size="2x" />
    <span className="kubevirt-inventory__row-status-item-text">{count}</span>
  </div>
);

InProgressStatus.propTypes = StatusPropTypes;

const Status = ({ Component, count, ...props }) => count > 0 && <Component count={count} {...props} />;

export const InventoryItemStatus = ({ ok, warn, error, inProgress }) => (
  <div className="kubevirt-inventory__row-status">
    <Status Component={InProgressStatus} count={inProgress} />
    <Status Component={ErrorStatus} count={error} />
    <Status Component={WarnStatus} count={warn} />
    <Status Component={OkStatus} count={ok} />
  </div>
);

InventoryItemStatus.defaultProps = {
  ok: 0,
  warn: 0,
  error: 0,
  inProgress: 0,
};

InventoryItemStatus.propTypes = {
  ok: PropTypes.number,
  warn: PropTypes.number,
  error: PropTypes.number,
  inProgress: PropTypes.number,
};
