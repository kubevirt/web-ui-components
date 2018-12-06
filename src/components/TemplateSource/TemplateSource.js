import React from 'react';
import { OverlayTrigger, Tooltip } from 'patternfly-react';
import { getTemplateProvisionSource } from '../../utils/templates';
import { PROVISION_SOURCE_PXE } from '../../constants';
import { getName, getNamespace } from '../../utils/selectors';

const tooltip = (id, source) => <Tooltip id={id}>{source}</Tooltip>;

export const TemplateSource = ({ template }) => {
  const provisionSource = getTemplateProvisionSource(template);
  if (provisionSource) {
    if (provisionSource.type === PROVISION_SOURCE_PXE) {
      return provisionSource.type;
    }
    return (
      <div className="template-source__overlay">
        <OverlayTrigger
          overlay={tooltip(`${getNamespace(template)}-${getName(template)}`, provisionSource.source)}
          placement="top"
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
