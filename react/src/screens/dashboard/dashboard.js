import React, { Component, Fragment } from 'react';
import { Button, Card } from 'antd';

class DashBoard extends Component {
    constructor(props) {
        super(props);
    }

    handleClick = (key, title) => {
        this.props.addTab(key, title, 'notfound/notfound1', true, {
            src: 'wb',
            params: 6
        });
    }

    componentWillUnmount() {
        if (this.timerClock) {
            clearInterval(this.timerClock);
        }
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
        }
    }

    render() {
        return (
            <Fragment>
                <Card loading title='DashBoard功能待建设...' style={{ width: '100%', height: 650 }}>
                    DashBoard功能待建设...
                </Card>
                <Button onClick={this.handleClick.bind(this, 'test', 'aaaa')}>test</Button>
                <Button onClick={this.handleClick.bind(this, 'test1', 'bbbb')}>test1</Button>
            </Fragment>
        );
    }
}

export default DashBoard;