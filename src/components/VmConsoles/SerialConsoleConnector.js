import React from 'react';
import PropTypes from 'prop-types';

import { AccessConsoles, SerialConsole } from '@patternfly/react-console';

const { CONNECTED, DISCONNECTED, LOADING } = AccessConsoles.constants;
const { debug, info, error } = console;

/**
 * Kubevirt serial console is accessed via WebSocket proxy in k8s API.
 * Protocol used is "plain.kubevirt.io", means binary and single channel - forwarding of unix socket only (see subresource.go in kubevirt).
 */
export class SerialConsoleConnector extends React.Component {
  state = {
    status: LOADING,
    passKeys: false,
  };

  onBackendDisconnected = event => {
    debug('Backend has disconnected');
    if (this.childSerialconsole) {
      this.childSerialconsole.onConnectionClosed('Reason for disconnect provided by backend.');
    }

    if (event) {
      info('Serial console connection closed, reason: ', event.reason);
    }

    this.ws && this.ws.destroy && this.ws.destroy();

    this.setState({
      passKeys: false,
      status: DISCONNECTED, // will close the terminal window
    });
  };

  onConnect = () => {
    debug('SerialConsoleConnector.onConnect(), ', this.state);
    const { vmi, host, path, WSFactory } = this.props;

    if (this.ws) {
      this.ws.destroy();
      this.setState({
        status: LOADING,
      });
    }

    const options = {
      host,
      path,
      reconnect: false,
      jsonParse: false,
      subprotocols: ['plain.kubevirt.io'],
    };

    this.ws = new WSFactory(`${vmi.metadata.name}-serial`, options)
      .onmessage(this.onDataFromBackend)
      .onopen(this.setConnected)
      .onclose(this.onBackendDisconnected)
      .onerror(event => {
        error('WS error received: ', event);
      });
  };

  onData = data => {
    debug('UI terminal component produced data, i.e. a key was pressed, pass it to backend. [', data, ']');
    this.ws && this.ws.send(new Blob([data]));
    // data are resent back from backend so _will_ pass through onDataFromBackend
  };

  onDataFromBackend = data => {
    // plain.kubevirt.io is binary and single-channel protocol
    debug('Backend sent data, pass them to the UI component. [', data, ']');
    if (this.childSerialconsole) {
      const reader = new FileReader();
      reader.addEventListener('loadend', e => {
        // Blob to text transformation ...
        const target = e.target || e.srcElement;
        const text = target.result;
        this.childSerialconsole.onDataReceived(text);
      });
      reader.readAsText(data);
    }
  };

  onDisconnect = () => {
    // disconnection initiated by UI component
    this.onBackendDisconnected();
  };

  onResize = (rows, cols) => {
    debug(
      'UI has been resized, pass this info to backend. [',
      rows,
      ', ',
      cols,
      ']. Ignoring since recently not supported by backend.',
      this
    );
  };

  setConnected = () => {
    this.setState({
      status: CONNECTED,
      passKeys: true,
    });
  };

  /*
        autoFit={this.props.autoFit}
        cols={this.props.cols}
        rows={this.props.rows}
 */
  render() {
    return (
      <SerialConsole
        onConnect={this.onConnect}
        onDisconnect={this.onDisconnect}
        onResize={this.onResize}
        onData={this.onData}
        id="serial-console-todo"
        status={this.state.status}
        ref={c => {
          this.childSerialconsole = c;
        }}
      />
    );
  }
}
SerialConsoleConnector.propTypes = {
  vmi: PropTypes.object.isRequired,
  host: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,

  WSFactory: PropTypes.func.isRequired, // reference to OKD utility
};
