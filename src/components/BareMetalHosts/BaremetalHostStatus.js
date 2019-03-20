import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popover } from '@patternfly/react-core';

import { getHostStatus } from '../../selectors/host/selectors';

export const BaremetalHostStatus = ({ host }) => {
    const hostStatus = getHostStatus(host);
    console.log(hostStatus);
    if(hostStatus.validationErrors.length > 0) {
        return (<ValidationErrors validationErrors={hostStatus.validationErrors} />)
    }
    return (
      <React.Fragment>{hostStatus.text}</React.Fragment>
    )
};

BaremetalHostStatus.propTypes = {
  host: PropTypes.object.isRequired
};

export const ValidationErrors = ({ validationErrors }) => {
    const popoverContent = validationErrors.map((item, index) => {
      return (
        <div key={index}>
          <p>{item.name}</p>
          <p>{item.message}</p>
        </div>
      )
    });
    return (
        <Popover
          position="right"
          size="regular"
          headerContent={<div>Errors</div>}
          bodyContent={popoverContent}
        >
          <Button variant="plain">Validation Errors</Button>
        </Popover>
    )
};

ValidationErrors.propTypes = {
  host: PropTypes.array.isRequired
};
