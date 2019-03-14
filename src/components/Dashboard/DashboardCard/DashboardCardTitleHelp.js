import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, OverlayTrigger, Popover } from 'patternfly-react';

const DashboardCardTitleHelp = ({ children }) => {
  if (React.Children.count(children) === 0) {
    return null;
  }
  const overlay = <Popover id="popover">{children}</Popover>;
  return (
    <OverlayTrigger overlay={overlay} placement="top" trigger={['click']} rootClose>
      <Button bsStyle="link">
        <Icon type="fa" name="info-circle" size="2x" />
      </Button>
    </OverlayTrigger>
  );
};

DashboardCardTitleHelp.defaultProps = {
  children: null,
};

DashboardCardTitleHelp.propTypes = {
  children: PropTypes.node,
};

export default DashboardCardTitleHelp;
