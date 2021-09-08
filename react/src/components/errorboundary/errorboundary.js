import React, { Component, Fragment } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            errorInfo: null
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.errorInfo) {
            return (
                <Fragment>
                    <h2>Something went wrong.</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                </Fragment>
            );
        }

        return this.props.children;
    }
}

function errorCatch(Target) {
    class Wrapper extends Component {
        render() {
            return (
                <ErrorBoundary>
                    <Target {...this.props} />
                </ErrorBoundary>
            )
        }
    }

    return Wrapper;
}

export { ErrorBoundary, errorCatch };