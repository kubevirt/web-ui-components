import React from 'react';
import PropTypes from 'prop-types';
import HelloWorldMessage from './HelloWorldMessage';

class HelloWorld extends React.Component {
  state = {
    world: this.props.world
  };

  render() {
    const foo = { x: true };
    const bar = { ...foo }; // eslint-disable-line
    const style = {
      border: '1px solid black',
      backgroundColor: 'yellow',
      padding: '10px'
    };

    return (
      <div className="hello-world" style={style}>
        <HelloWorldMessage text={this.state.world} />
      </div>
    );
  }
}

HelloWorld.propTypes = {
  world: PropTypes.string
};

HelloWorld.defaultProps = {
  world: 'World'
};

export default HelloWorld;
