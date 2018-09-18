import React from 'react';
import PropTypes from 'prop-types';
import { Wizard, Button } from 'patternfly-react';
import { CreateVmWizard } from '../create-vm/CreateVmWizard';
import { ImportVmWizard } from '../import-vm/ImportVmWizard';
import { ButtonWithIcon } from '../../buttons/ButtonWithIcon';
import './NewVmWizard.css';

export class NewVmWizard extends React.Component {
  state = {
    createVM: false,
    importVM: false
  };

  openCreateVmWizard = () => this.setState({ createVM: true });

  openImportVmWizard = () => this.setState({ importVM: true });

  render() {
    let wizard;
    if (this.state.createVM) {
      wizard = <CreateVmWizard onHide={this.props.onHide} {...this.props} />;
    } else if (this.state.importVM) {
      wizard = <ImportVmWizard onHide={this.props.onHide} {...this.props} />;
    }
    return (
      <React.Fragment>
        <Wizard show onHide={this.props.onHide}>
          <Wizard.Header title="Create Virtual Machine" onClose={this.props.onHide} />
          <Wizard.Body>
            <Wizard.Row>
              <Wizard.Main>
                <Wizard.Contents stepIndex={0} activeStepIndex={0} className="wizard-content">
                  <ButtonWithIcon
                    label="Create New Virtual Machine"
                    iconType="pf"
                    icon="virtual-machine"
                    onClick={this.openCreateVmWizard}
                  />
                  <ButtonWithIcon
                    label="Import Existing Virtual Machine"
                    iconType="pf"
                    icon="import"
                    onClick={this.openImportVmWizard}
                  />
                </Wizard.Contents>
              </Wizard.Main>
            </Wizard.Row>
          </Wizard.Body>
          <Wizard.Footer>
            <Button bsStyle="default" className="btn-cancel" onClick={this.props.onHide}>
              Cancel
            </Button>
          </Wizard.Footer>
        </Wizard>
        {wizard}
      </React.Fragment>
    );
  }
}

NewVmWizard.propTypes = {
  onHide: PropTypes.func.isRequired,
  workloadProfiles: PropTypes.array.isRequired,
  flavors: PropTypes.array.isRequired,
  operatingSystems: PropTypes.array.isRequired,
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired
};
