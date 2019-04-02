import React from 'react';
import PropTypes from 'prop-types';

import { getName, getNamespace } from '../../../selectors';
import { getServicesForVm } from '../../../selectors/service';
import { InlineLoading } from '../../Loading';
import { DASHES } from '../../../constants';
import { ServiceModel } from '../../../models';

export const Services = ({ services, vm, ResourceLinkComponent, LoadingComponent }) => {
  if (!services) {
    return <LoadingComponent />;
  }
  const vmServices = getServicesForVm(services, vm);
  return vmServices.length === 0
    ? DASHES
    : vmServices.map(service => (
        <ResourceLinkComponent kind={ServiceModel.kind} name={getName(service)} namespace={getNamespace(service)} />
      ));
};

Services.defaultProps = {
  services: null,
  LoadingComponent: InlineLoading,
};

Services.propTypes = {
  services: PropTypes.array,
  vm: PropTypes.object.isRequired,
  ResourceLinkComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
