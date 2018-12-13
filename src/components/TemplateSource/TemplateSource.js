import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'patternfly-react';

import { getTemplateProvisionSource } from '../../utils/templates';
import { PROVISION_SOURCE_PXE } from '../../constants';
import { getName, getNamespace } from '../../utils/selectors';

const tooltip = (id, source) => <Tooltip id={id}>{source}</Tooltip>;

export const TemplateSource = ({ template, tooltipPlacement }) => {
  const provisionSource = getTemplateProvisionSource(template);
  if (provisionSource) {
    if (provisionSource.type === PROVISION_SOURCE_PXE) {
      return provisionSource.type;
    }
    return (
      <div className="kubevirt-template-source__overlay">
        <OverlayTrigger
          overlay={tooltip(`${getNamespace(template)}-${getName(template)}`, provisionSource.source)}
          placement={tooltipPlacement}
          trigger={['hover', 'focus']}
          rootClose={false}
        >
          <div>{provisionSource.type}</div>
        </OverlayTrigger>
      </div>
    );
  }
  return '---';
};

TemplateSource.propTypes = {
  template: PropTypes.object.isRequired,
  tooltipPlacement: PropTypes.string,
};

TemplateSource.defaultProps = {
  tooltipPlacement: 'top',
};
