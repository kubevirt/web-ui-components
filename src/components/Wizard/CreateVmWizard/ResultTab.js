import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'patternfly-react';

import { Loading } from '../../Loading';

const getCreationText = createTemplate => `Creation of VM ${createTemplate ? 'Template ' : ''}`;

export const ResultTab = ({ results, success, createTemplate }) => {
  let value;
  const loadingText = `${getCreationText(createTemplate)}in progress`;
  const successText = `${getCreationText(createTemplate)}was successful`;
  if (success == null) {
    value = <Loading text={loadingText} />;
  } else if (success) {
    value = (
      <div className="wizard-pf-complete blank-slate-pf" key="success">
        <div className="wizard-pf-success-icon">
          <span className="glyphicon glyphicon-ok-circle" />
        </div>
        <h3 className="blank-slate-pf-main-action">{successText}</h3>
        {results.map((result, index) => (
          <pre key={index} className="blank-slate-pf-secondary-action kubevirt-create-vm-wizard__result-success">
            {JSON.stringify(result, null, 1)}
          </pre>
        ))}
      </div>
    );
  } else {
    value = results.map((result, index) => <Alert key={index}>{result}</Alert>);
  }

  return value;
};

ResultTab.defaultProps = {
  results: [],
  success: null,
  createTemplate: false,
};

ResultTab.propTypes = {
  results: PropTypes.array,
  success: PropTypes.bool,
  createTemplate: PropTypes.bool,
};
