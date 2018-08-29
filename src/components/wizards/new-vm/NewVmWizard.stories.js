import React from 'react';
import { storiesOf } from '@storybook/react';
import { NewVmWizard } from './NewVmWizard';
import { Button } from 'patternfly-react';
import { os } from './OperatingSystem';
import { createVM } from '../../../k8s/request';
import { storageClasses, workloadProfiles, flavors, templates, namespaces } from './NewVmWizard.fixtures';

class NewVmWizardExample extends React.Component {
  state = {
    show: false
  };

  openWizard = () => {
    this.setState({
      show: true
    });
  };

  onHide = () => {
    this.setState({
      show: false
    });
  };

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.openWizard}>Open New VM Wizard</Button>
        {this.state.show ? (
          <NewVmWizard
            onHide={this.onHide}
            storageClasses={storageClasses}
            workloadProfiles={workloadProfiles}
            flavors={flavors}
            namespaces={namespaces}
            operatingSystems={os}
            templates={templates}
            createVmRequest={createVM}
          />
        ) : (
          undefined
        )}
      </React.Fragment>
    );
  }
}

storiesOf('Wizards', module).add('New VM Wizard', () => <NewVmWizardExample />);
