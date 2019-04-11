import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { ExpandCollapse } from 'patternfly-react';

export const ResultTabRow = ({ title, content, isExpanded, isError }) => {
  const resolvedContent = typeof content === 'object' ? JSON.stringify(content, null, 1) : content;

  if (!title && !content) {
    return null;
  }

  return (
    <ExpandCollapse textExpanded={title || ''} textCollapsed={title || ''} expanded={isExpanded}>
      <pre
        className={classNames('blank-slate-pf-secondary-action', 'kubevirt-create-vm-wizard__result-tab-row', {
          'kubevirt-create-vm-wizard__result-tab-row--error': isError,
        })}
      >
        {resolvedContent}
      </pre>
    </ExpandCollapse>
  );
};

ResultTabRow.defaultProps = {
  title: null,
  content: null,
  isExpanded: false,
  isError: false,
};

ResultTabRow.propTypes = {
  title: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isExpanded: PropTypes.bool,
  isError: PropTypes.bool,
};
