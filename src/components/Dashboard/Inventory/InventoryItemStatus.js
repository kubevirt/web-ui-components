import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

const StatusPropTypes = {
  count: PropTypes.number.isRequired,
};

const OkStatus = ({ count }) => (
  <div className="kubevirt-inventory__row-status-item">
    <Icon
      type="fa"
      name="check-circle"
      className="kubevirt-inventory__row-status-item-icon--ok kubevirt-dashboard__icon-sm"
    />
    <span className="kubevirt-inventory__row-status-item-text">{count}</span>
  </div>
);

OkStatus.propTypes = StatusPropTypes;

const WarnStatus = ({ count }) => (
  <div className="kubevirt-inventory__row-status-item">
    <Icon
      type="fa"
      name="exclamation-triangle"
      className="kubevirt-inventory__row-status-item-icon--warn kubevirt-dashboard__icon-sm"
    />
    <span className="kubevirt-inventory__row-status-item-text">{count}</span>
  </div>
);

WarnStatus.propTypes = StatusPropTypes;

const ErrorStatus = ({ count }) => (
  <div className="kubevirt-inventory__row-status-item">
    <Icon
      type="fa"
      name="exclamation-circle"
      className="kubevirt-inventory__row-status-item-icon--error kubevirt-dashboard__icon-sm"
    />
    <span className="kubevirt-inventory__row-status-item-text">{count}</span>
  </div>
);

ErrorStatus.propTypes = StatusPropTypes;

const InProgressStatus = ({ count }) => (
  <div className="kubevirt-inventory__row-status-item">
    <Icon
      type="pf"
      name="in-progress"
      className="kubevirt-inventory__row-status-item-icon--in-progress kubevirt-dashboard__icon-sm"
    />
    <span className="kubevirt-inventory__row-status-item-text">{count}</span>
  </div>
);

InProgressStatus.propTypes = StatusPropTypes;

const OffStatus = ({ count }) => (
  <div className="kubevirt-inventory__row-status-item">
    <Icon type="pf" name="off" className="kubevirt-inventory__row-status-item-icon--off" />
    <span className="kubevirt-inventory__row-status-item-text">{count}</span>
  </div>
);

OffStatus.propTypes = StatusPropTypes;

const Status = ({ Component, count, ...props }) => count > 0 && <Component count={count} {...props} />;

export const InventoryItemStatus = ({ ok, warn, error, inProgress, off }) => (
  <div className="kubevirt-inventory__row-status">
    <Status Component={InProgressStatus} count={inProgress} />
    <Status Component={ErrorStatus} count={error} />
    <Status Component={WarnStatus} count={warn} />
    <Status Component={OffStatus} count={off} />
    <Status Component={OkStatus} count={ok} />
  </div>
);

InventoryItemStatus.defaultProps = {
  ok: 0,
  warn: 0,
  error: 0,
  inProgress: 0,
  off: 0,
};

InventoryItemStatus.propTypes = {
  ok: PropTypes.number,
  warn: PropTypes.number,
  error: PropTypes.number,
  inProgress: PropTypes.number,
  off: PropTypes.number,
};
