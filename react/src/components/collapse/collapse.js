import React, { Component, Fragment } from 'react';
import { Collapse } from 'antd';
import _ from 'lodash/core';

const Panel = Collapse.Panel;

class CollapsePanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: [],
            newComer: true // 区分是否第一次加载数据
        };
    }

    static getDerivedStateFromProps(props, state) {
        // 为以后扩展准备，比如展开所有、折叠所有
        const { data } = props;

        if (!_.isEmpty(data) && _.isEmpty(state.activeKey) && state.newComer === true) {
            return {
                activeKey: [data[0].key],
                newComer: false
            };
        }

        return {
            activeKey: state.activeKey,
            newComer: state.newComer
        };
    }

    componentWillUnmount() {

    }

    componentDidMount() {

    }

    onChange = (keys) => {
        this.setState({
            activeKey: [...keys]
        });
    }

    generateContent = (data) => {
        let len = data.length;
        return _.map(data, (item, index) => {
            let marginBottom = index === len - 1 ? 0 : 8;
            // 一个Collapse，下面有多个Panel
            if (_.isEmpty(item.children)) {
                return (
                    <Panel header={item.header} key={item.key}>
                        {item.content}
                    </Panel>
                );
            } else {
                return (
                    <Panel header={item.header} key={item.key}>
                        <Collapse>
                            {this.generateContent(item.children)}
                        </Collapse>
                    </Panel>
                );
            }
            // 多个Collapse，每个下面一个Panel
            // if (_.isEmpty(item.children)) {
            //     return (
            //         <Collapse key={item.key}>
            //             <Panel header={item.header} style={{ marginBottom: marginBottom }}>
            //                 {item.content}
            //             </Panel>
            //         </Collapse>
            //     );
            // } else {
            //     return (
            //         <Panel header={item.header} style={{ marginBottom: marginBottom }} key={item.key}>
            //             {this.generateContent(item.children)}
            //         </Panel>
            //     );
            // }
        });
    }

    render() {
        const { data } = this.props;
        return (
            <Fragment>
                {
                    _.isEmpty(data) ? [] :
                        <Collapse activeKey={this.state.activeKey} onChange={this.onChange.bind(this)}>
                            {this.generateContent(data)}
                        </Collapse>
                }
            </Fragment>
        );
    }
}

export default CollapsePanel;