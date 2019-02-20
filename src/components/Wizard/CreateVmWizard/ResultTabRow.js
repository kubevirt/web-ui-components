import React from 'react';
import PropTypes from 'prop-types';
import { ExpandCollapse } from 'patternfly-react';

export const ResultTabRow = ({ title, content, expanded }) => {
  const resolvedContent = typeof content === 'object' ? JSON.stringify(content, null, 1) : content;

  return (
    <ExpandCollapse textExpanded={title} textCollapsed={title} expanded={expanded}>
      <pre className="blank-slate-pf-secondary-action kubevirt-create-vm-wizard__result-tab-row">{resolvedContent}</pre>
    </ExpandCollapse>
  );
};

ResultTabRow.defaultProps = {
  expanded: false,
};

ResultTabRow.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  expanded: PropTypes.bool,
};
