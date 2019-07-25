import React from 'react';
import PropTypes from 'prop-types';

import { Url } from '../Details/Url';
import { getTemplateProvisionSource } from '../../utils/templates';
import { PROVISION_SOURCE_URL } from '../../constants';
import { getId } from '../../selectors';
import { prefixedId } from '../../utils/utils';

const Type = ({ type, source, error, id, isInline }) => (
  <div id={id} title={source || error} className={isInline ? 'kubevirt-template-source__overlay' : ''}>
    {type}
  </div>
);

Type.propTypes = {
  type: PropTypes.string.isRequired,
  error: PropTypes.string,
  source: PropTypes.string,
  id: PropTypes.string,
  isInline: PropTypes.bool,
};

Type.defaultProps = {
  error: undefined,
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

  if (!provisionSource || !provisionSource.type) {
    return '---';
  }

  const { type, source, error } = provisionSource;
  const id = getId(template);
  const typeId = prefixedId(id, 'type');
  const sourceId = prefixedId(id, 'source');

  if (!detailed) {
    return <Type id={typeId} type={type} source={source} error={error} isInline />;
  }

  return (
    <React.Fragment>
      <Type id={typeId} type={type} source={source} error={error} />
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
