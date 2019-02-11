import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'patternfly-react';

import { getTemplateProvisionSource } from '../../utils/templates';
import { PROVISION_SOURCE_PXE } from '../../constants';
import { getName, getNamespace } from '../../utils/selectors';
import { prefixedId } from '../../utils/utils';

const tooltip = (id, source) => <Tooltip id={id}>{source}</Tooltip>;

export const TemplateSource = ({ template, tooltipPlacement, dataVolumes, detailed }) => {
  const provisionSource = getTemplateProvisionSource(template, dataVolumes);
  if (provisionSource) {
    const { type, source } = provisionSource;
    const id = prefixedId(getNamespace(template), getName(template));
    const typeElem = <div id={prefixedId(id, 'type')}>{type}</div>;

    if (type === PROVISION_SOURCE_PXE) {
      return typeElem;
    }

    if (detailed) {
      return (
        <React.Fragment>
          {typeElem}
          <div id={prefixedId(id, 'source')} className="kubevirt-template-source__source">
            {source}
          </div>
        </React.Fragment>
      );
    }

    return (
      <div className="kubevirt-template-source__overlay">
        <OverlayTrigger
          overlay={tooltip(id, source)}
          placement={tooltipPlacement}
          trigger={['hover', 'focus']}
          rootClose={false}
        >
          {typeElem}
        </OverlayTrigger>
      </div>
    );
  }
  return '---';
};

TemplateSource.propTypes = {
  template: PropTypes.object.isRequired,
  tooltipPlacement: PropTypes.string,
  dataVolumes: PropTypes.array,
  detailed: PropTypes.bool,
};

TemplateSource.defaultProps = {
  tooltipPlacement: 'top',
  dataVolumes: [],
  detailed: false,
};
