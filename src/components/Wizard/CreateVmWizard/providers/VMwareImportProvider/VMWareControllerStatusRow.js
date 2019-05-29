import React from 'react';
import PropTypes from 'prop-types';

import { Alert, Col, FormGroup, Spinner } from 'patternfly-react';

import { Link } from 'react-router-dom';

import {
  getV2vVMwareDeploymentStatus,
  V2V_WMWARE_DEPLOYMENT_STATUS_FAILED,
  V2V_WMWARE_DEPLOYMENT_STATUS_POD_FAILED,
  V2V_WMWARE_DEPLOYMENT_STATUS_PROGRESSING,
  V2V_WMWARE_DEPLOYMENT_STATUS_ROLLOUT_COMPLETE,
  V2V_WMWARE_DEPLOYMENT_STATUS_UNKNOWN,
} from '../../../../../utils/status/v2vVMwareDeployment';

import VMwareStatusField from './VMwareStatusField';
import { HelpFormRow } from '../../../../Form/FormRow';
import { getName } from '../../../../../selectors';

import { getSubPagePath } from '../../../../../utils';
import { DeploymentModel, PodModel } from '../../../../../models';

const DeploymentLink = ({ deployment }) => (
  <Link to={getSubPagePath(deployment, DeploymentModel, 'events')}>{getName(deployment)}</Link>
);

DeploymentLink.defaultProps = {
  deployment: null,
};

DeploymentLink.propTypes = {
  deployment: PropTypes.object,
};

const NoDeployment = () => (
  <VMwareStatusField>
    Starting VMware controller... <Spinner loading size="sm" />
  </VMwareStatusField>
);

const DeploymentProgressing = ({ id, deployment }) => (
  <VMwareStatusField id={id}>
    Deploying VMware controller (<DeploymentLink deployment={deployment} />
    )... <Spinner loading size="sm" />
  </VMwareStatusField>
);

DeploymentProgressing.defaultProps = {
  deployment: null,
  id: null,
};

DeploymentProgressing.propTypes = {
  deployment: PropTypes.object,
  id: PropTypes.string,
};

const DeploymentFailed = ({ deployment, pod, message }) => {
  let podMessage;
  if (pod) {
    podMessage = (
      <React.Fragment>
        {' '}
        Please inspect a failing pod <Link to={getSubPagePath(pod, PodModel, 'events')}>{getName(pod)}</Link>
      </React.Fragment>
    );
  }
  return (
    <VMwareStatusField>
      <Alert type="warning">
        Deployment of VMware controller <DeploymentLink deployment={deployment} /> failed: {message}.{podMessage}
      </Alert>
    </VMwareStatusField>
  );
};

DeploymentFailed.defaultProps = {
  ...DeploymentProgressing.defaultProps,
  pod: null,
  message: null,
};

DeploymentFailed.propTypes = {
  ...DeploymentProgressing.propTypes,
  pod: PropTypes.object,
  message: PropTypes.string,
};

const vmwareStatusComponentResolver = {
  [V2V_WMWARE_DEPLOYMENT_STATUS_PROGRESSING]: DeploymentProgressing,
  [V2V_WMWARE_DEPLOYMENT_STATUS_POD_FAILED]: DeploymentFailed,
  [V2V_WMWARE_DEPLOYMENT_STATUS_FAILED]: DeploymentFailed,
};

class VMWareControllerStatusRow extends React.Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !!Object.keys(this.props).find(key => key !== 'children' && this.props[key] !== nextProps[key]);
  }

  render() {
    const { id, hasErrors, deployment, deploymentPods, controlSize, labelSize } = this.props;

    const status = getV2vVMwareDeploymentStatus(deployment, deploymentPods);
    if (
      status.status === V2V_WMWARE_DEPLOYMENT_STATUS_ROLLOUT_COMPLETE ||
      (status.status === V2V_WMWARE_DEPLOYMENT_STATUS_UNKNOWN && hasErrors) // deployment failed
    ) {
      return null;
    }

    const StatusComponent = vmwareStatusComponentResolver[status.status] || NoDeployment;

    return (
      <FormGroup>
        <Col sm={labelSize} />
        <Col sm={controlSize}>
          <StatusComponent id={id} {...status} />
        </Col>
      </FormGroup>
    );
  }
}

VMWareControllerStatusRow.defaultProps = {
  id: null,
  hasErrors: false,
  deployment: null,
  deploymentPods: null,
  controlSize: HelpFormRow.defaultProps.controlSize,
  labelSize: HelpFormRow.defaultProps.labelSize,
};

VMWareControllerStatusRow.propTypes = {
  id: PropTypes.string,
  hasErrors: PropTypes.bool,
  deployment: PropTypes.object,
  deploymentPods: PropTypes.object,
  controlSize: HelpFormRow.propTypes.controlSize,
  labelSize: HelpFormRow.propTypes.labelSize,
};

export default VMWareControllerStatusRow;
