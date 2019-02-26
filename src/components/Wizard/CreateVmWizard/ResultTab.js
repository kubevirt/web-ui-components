import React from 'react';
import PropTypes from 'prop-types';

import { Loading } from '../../Loading';

const getCreationText = (state, createTemplate) => `Creation of VM ${createTemplate ? 'Template ' : ''}${state}`;

export const ResultTab = ({ isSuccessful, isCreateTemplate, children }) => {
  if (isSuccessful == null) {
    return <Loading key="progress" text={getCreationText('in progress', isCreateTemplate)} />;
  }
  const state = isSuccessful ? 'was successful' : 'failed';
  const icon = isSuccessful ? 'pficon-ok' : 'pficon-error-circle-o';

  return (
    <div className="wizard-pf-complete blank-slate-pf" key="success">
      <div className="wizard-pf-success-icon">
        <span className={`pficon ${icon}`} />
      </div>
      <h3 className="blank-slate-pf-main-action">{getCreationText(state, isCreateTemplate)}</h3>
      {children}
    </div>
  );
};

ResultTab.defaultProps = {
  children: null,
  isSuccessful: null,
  isCreateTemplate: false,
};

ResultTab.propTypes = {
  children: PropTypes.node,
  isSuccessful: PropTypes.bool,
  isCreateTemplate: PropTypes.bool,
};
