import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Popover } from 'patternfly-react';

const SEE_ALL = 'See all';

export const DashboardCardTitleSeeAll = ({ title, children }) => {
  if (React.Children.count(children) === 0) {
    return null;
  }
  const overlay = (
    <Popover id="popover" title={title}>
      {children}
    </Popover>
  );
  return (
    <OverlayTrigger overlay={overlay} placement="right" trigger={['click']} rootClose>
      <Button bsStyle="link">{SEE_ALL}</Button>
    </OverlayTrigger>
  );
};

DashboardCardTitleSeeAll.defaultProps = {
  children: null,
};

DashboardCardTitleSeeAll.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
};
