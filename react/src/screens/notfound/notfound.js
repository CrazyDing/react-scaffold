import React, { Component } from 'react';
import Exception from '../../components/exception/exception';

class NotFound extends Component {
  render() {
    const removeTab = this.props.removeTab;
    return (
      <Exception type='404' removeTab={removeTab} />
    );
  }
}

export default NotFound;