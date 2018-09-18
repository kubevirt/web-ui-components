import React from 'react';
import PropTypes from 'prop-types';
import { Wizard } from 'patternfly-react';
import { FormFactory } from '../../forms/FormFactory';

export class ImportVmWizard extends React.Component {
  state = {
    activeStepIndex: 0,
    importValues: {}
  };

  importFields = {
    sourceType: {
      title: 'Import Source Type',
      type: 'dropdown',
      default: '--- Select Import Source ---',
      required: true,
      values: [
        {
          name: 'Foo import source'
        }
      ]
    },
    url: {
      title: 'VMWare URL to EXSi',
      required: true
    },
    username: {
      title: 'VMWare Username',
      required: true
    },
    password: {
      title: 'VMWare Password',
      required: true
    }
  };

  onFormChange = (newValue, target) => {};

  wizardStepsImportVM = [
    {
      title: 'Basic Information',
      render: () => (
        <FormFactory
          fields={this.importFields}
          fieldsValues={this.state.importValues}
          onFormChange={this.onFormChange}
        />
      )
    },
    {
      title: 'Virtual Machines',
      render: () => <p>Render</p>
    }
  ];

  render() {
    return (
      <Wizard.Pattern
        show
        onHide={this.props.onHide}
        steps={this.wizardStepsImportVM}
        activeStepIndex={this.state.activeStepIndex}
        onStepChanged={index => this.setState({ activeStepIndex: index })}
      />
    );
  }
}

ImportVmWizard.propTypes = {
  onHide: PropTypes.func.isRequired
};
