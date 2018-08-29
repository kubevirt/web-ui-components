import React from 'react';
import PropTypes from 'prop-types';
import { Wizard, Button } from 'patternfly-react';
import { CreateVmWizard } from '../CreateVmWizard/CreateVmWizard';
import { ButtonWithIcon } from '../../Buttons/ButtonWithIcon';

export class NewVmWizard extends React.Component {
  state = {
    createVM: false
  };

  openCreateVmWizard = () => this.setState({ createVM: true });

  render() {
    const wizard = this.state.createVM ? <CreateVmWizard onHide={this.props.onHide} {...this.props} /> : undefined;
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
                    onClick={() => {}}
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
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired,
  k8sCreate: PropTypes.func.isRequired
};
