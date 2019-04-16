import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Popover } from 'patternfly-react';

const SEE_ALL = 'See all';

const DashboardCardTitleSeeAll = ({ children }) => {
  if (React.Children.count(children) === 0) {
    return null;
  }
  const overlay = <Popover id="popover">{children}</Popover>;
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
};

export default DashboardCardTitleSeeAll;