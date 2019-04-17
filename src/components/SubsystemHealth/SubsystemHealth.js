import React from 'react';
import PropTypes from 'prop-types';

import { HealthItem } from '../Dashboard/Health/HealthItem';
import { HealthBody } from '../Dashboard/Health/HealthBody';

import { InlineLoading } from '../Loading';

export const SubsystemHealth = ({ state, k8sHealth, kubevirtHealth, cephHealth, LoadingComponent }) => (
  <div>
    <div className="modal-header">
      <h4 className="modal-title">Subsystem health</h4>
    </div>
    <div>
      <HealthBody>
        <HealthItem
          state={state}
          message="OpenShift"
          details={k8sHealth.message}
          state={k8sHealth.state}
          LoadingComponent={LoadingComponent}
        />
        <HealthItem
          state={state}
          message="CNV"
          details={kubevirtHealth.message}
          state={kubevirtHealth.state}
          LoadingComponent={LoadingComponent}
        />
        <HealthItem
          state={state}
          message="Ceph"
          details={cephHealth.message}
          state={cephHealth.state}
          LoadingComponent={LoadingComponent}
        />
      </HealthBody>
    </div>
  </div>
);

SubsystemHealth.defaultProps = {
  k8sHealth: null,
  kubevirtHealth: null,
  cephHealth: null,
  state: null,
  LoadingComponent: InlineLoading,
};

SubsystemHealth.propTypes = {
  k8sHealth: PropTypes.object,
  kubevirtHealth: PropTypes.object,
  cephHealth: PropTypes.object,
  state: PropTypes.string,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
