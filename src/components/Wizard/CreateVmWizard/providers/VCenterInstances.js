import React from 'react';
import PropTypes from 'prop-types';

import { getName } from '../../../../utils/selectors';
import { settingsValue } from '../../../../k8s/selectors';

import { getResource } from '../../../../utils';
import { SecretModel } from '../../../../models';
import { VCENTER_TEMPORARY_LABEL, VCENTER_TYPE_LABEL } from '../../../../constants';
import { Dropdown } from '../../../Form';

import { CONNECT_TO_NEW_INSTANCE } from '../strings';
import { NAMESPACE_KEY } from '../constants';

const getVCenterInstanceSecrets = vCenterSecrets => {
  vCenterSecrets = vCenterSecrets || [];
  return [CONNECT_TO_NEW_INSTANCE, ...vCenterSecrets.map(getName)];
};

const areResourcesLoaded = resources => !!resources;

const VCenterInstances = ({ onChange, id, value, extraProps }) => {
  const { WithResources, basicSettings } = extraProps;

  const resourceMap = {
    vCenterSecrets: {
      resource: getResource(SecretModel, {
        namespace: settingsValue(basicSettings, NAMESPACE_KEY),
        matchExpressions: [
          { key: VCENTER_TYPE_LABEL, operator: 'Exists' },
          { key: VCENTER_TEMPORARY_LABEL, operator: 'DoesNotExist' },
        ],
      }),
    },
  };
  const resourceToProps = ({ vCenterSecrets }) => ({
    choices: getVCenterInstanceSecrets(vCenterSecrets),
    disabled: !areResourcesLoaded(vCenterSecrets),
  });

  return (
    <WithResources resourceMap={resourceMap} resourceToProps={resourceToProps}>
      <Dropdown id={id} value={value} onChange={onChange} />
    </WithResources>
  );
};
VCenterInstances.defaultProps = {
  id: undefined,
  value: undefined,
};
VCenterInstances.propTypes = {
  onChange: PropTypes.func.isRequired,
  extraProps: PropTypes.object.isRequired,
  id: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default VCenterInstances;
