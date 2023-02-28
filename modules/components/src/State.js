import React from 'react';

// Inside the portal story, this component doesn't really do anything. Kept it there in case we need to use <GetProjects /> one day
class State extends React.Component {
  constructor(props) {
    super(props);
    console.warn(
      '[[ DEPRECATION WARNING ]]: the State component has been deprecated in favor of react-component-component',
    );
    this.state = props.initial;
  }
  componentDidMount() {
    const { async = () => {} } = this.props;
    Promise.resolve(async()).then(this.update);
  }
  componentWillReceiveProps(props) {
    let { onReceiveProps } = props;
    onReceiveProps && onReceiveProps({ props, state: this.state, update: this.update });
  }
  update = (object, onComplete = () => {}) =>
    this.setState((state) => ({ ...state, ...object }), onComplete);
  componentDidUpdate(prevProps, prevState) {
    if (this.props.didUpdate) {
      this.props.didUpdate({
        prevProps,
        prevState,
        update: this.update,
        ...this.state,
      });
    }
  }
  render() {
    return this.props.render({
      ...this.state,
      update: this.update,
    });
  }
}

export default State;
