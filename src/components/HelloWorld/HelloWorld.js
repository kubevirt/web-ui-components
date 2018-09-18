import React from 'react';
import PropTypes from 'prop-types';

class HelloWorld extends React.Component {
  state = { world: this.props.world };

  render() {
    return <div className="hello-world">Hello {this.state.world}!</div>;
  }
}

HelloWorld.propTypes = {
  world: PropTypes.string
};

HelloWorld.defaultProps = {
  world: 'World'
};

export default HelloWorld;
