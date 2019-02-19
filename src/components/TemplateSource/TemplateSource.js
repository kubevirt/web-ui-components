import React from 'react';
import PropTypes from 'prop-types';

import { Url } from '../Details/Url';
import { getTemplateProvisionSource } from '../../utils/templates';
import { PROVISION_SOURCE_URL } from '../../constants';
import { getName, getNamespace } from '../../utils/selectors';
import { prefixedId } from '../../utils/utils';

const Type = ({ type, source, id, isInline }) => (
  <div id={id} title={source} className={isInline ? 'kubevirt-template-source__overlay' : ''}>
    {type}
  </div>
);

Type.propTypes = {
  type: PropTypes.string.isRequired,
  source: PropTypes.string,
  id: PropTypes.string,
  isInline: PropTypes.bool,
};

Type.defaultProps = {
  source: undefined,
  id: undefined,
  isInline: false,
};

const Source = ({ type, source, id }) => {
  if (!source) {
    return null;
  }

  const sourceElem = type === PROVISION_SOURCE_URL ? <Url url={source} short /> : source;

  return (
    <div id={id} className="kubevirt-template-source__source">
      {sourceElem}
    </div>
  );
};

Source.propTypes = {
  type: PropTypes.string.isRequired,
  source: PropTypes.string,
  id: PropTypes.string,
};

Source.defaultProps = {
  source: undefined,
  id: undefined,
};

export const TemplateSource = ({ template, dataVolumes, detailed }) => {
  const provisionSource = getTemplateProvisionSource(template, dataVolumes);

  if (!provisionSource) {
    return '---';
  }

  const { type, source } = provisionSource;
  const id = prefixedId(getNamespace(template), getName(template));
  const typeId = prefixedId(id, 'type');
  const sourceId = prefixedId(id, 'source');

  if (!detailed) {
    return <Type id={typeId} type={type} source={source} isInline />;
  }

  return (
    <React.Fragment>
      <Type id={typeId} type={type} source={source} />
      <Source id={sourceId} type={type} source={source} />
    </React.Fragment>
  );
};

TemplateSource.propTypes = {
  template: PropTypes.object.isRequired,
  dataVolumes: PropTypes.array,
  detailed: PropTypes.bool,
};

TemplateSource.defaultProps = {
  dataVolumes: [],
  detailed: false,
};
