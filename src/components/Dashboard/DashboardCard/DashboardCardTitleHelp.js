import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, OverlayTrigger, Popover } from 'patternfly-react';

class DashboardCardTitleHelp extends React.PureComponent {
  render() {
    const { children } = this.props;
    if (React.Children.count(children) === 0) {
      return null;
    }
    const overlay = <Popover id="popover">{children}</Popover>;
    return (
      <OverlayTrigger overlay={overlay} placement="top" trigger={['click']} rootClose>
        <Button bsStyle="link">
          <Icon
            type="fa"
            name="info-circle"
            className="kubevirt-dashboard__icon-sm kubevirt-dashboard__heading-icon--info"
          />
        </Button>
      </OverlayTrigger>
    );
  }
}

DashboardCardTitleHelp.defaultProps = {
  children: null,
};

DashboardCardTitleHelp.propTypes = {
  children: PropTypes.node,
};

export default DashboardCardTitleHelp;
