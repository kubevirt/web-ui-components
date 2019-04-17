import React from 'react';
import PropTypes from 'prop-types';

import { HealthItem } from '../Dashboard/Health/HealthItem';
import { HealthBody } from '../Dashboard/Health/HealthBody';

import { InlineLoading } from '../Loading';

export const SubsystemHealth = ({ k8sHealth, kubevirtHealth, cephHealth, LoadingComponent }) => (
  <div>
    <HealthBody className="kubevirt-health__body--subsystem">
      <HealthItem
        message="OpenShift"
        details={k8sHealth.message}
        state={k8sHealth.state}
        LoadingComponent={LoadingComponent}
      />
      <div className="kubevirt-health__separator" />
      <HealthItem
        message="CNV"
        details={kubevirtHealth.message}
        state={kubevirtHealth.state}
        LoadingComponent={LoadingComponent}
      />
      <div className="kubevirt-health__separator" />
      <HealthItem
        message="Ceph"
        details={cephHealth.message}
        state={cephHealth.state}
        LoadingComponent={LoadingComponent}
      />
    </HealthBody>
  </div>
);

SubsystemHealth.defaultProps = {
  k8sHealth: null,
  kubevirtHealth: null,
  cephHealth: null,
  LoadingComponent: InlineLoading,
};

SubsystemHealth.propTypes = {
  k8sHealth: PropTypes.object,
  kubevirtHealth: PropTypes.object,
  cephHealth: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
