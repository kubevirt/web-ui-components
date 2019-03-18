import React from 'react';
import PropTypes from 'prop-types';
import { MessageDialog } from 'patternfly-react';

import { getName } from '../../../selectors';
import { migrate } from '../../../k8s/migrate';

export const BasicMigrationDialog = ({ k8sCreate, onCancel, onClose, onMigrationError, virtualMachineInstance }) => {
  const onMigrate = () => {
    onClose();
    migrate(k8sCreate, virtualMachineInstance).catch(onMigrationError);
  };

  const message = `Do you wish to migrate ${getName(virtualMachineInstance)} vmi to another node?`;

  return (
    <MessageDialog
      show
      onHide={onCancel}
      primaryAction={onMigrate}
      secondaryAction={onCancel}
      primaryActionButtonContent="Migrate"
      secondaryActionButtonContent="Cancel"
      title="Migrate Virtual Machine"
      primaryContent={message}
      accessibleName="migrateConfirmationDialog"
      accessibleDescription="migrateConfirmationDialogContent"
    />
  );
};

BasicMigrationDialog.propTypes = {
  k8sCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onMigrationError: PropTypes.func.isRequired,
  virtualMachineInstance: PropTypes.object.isRequired,
};
