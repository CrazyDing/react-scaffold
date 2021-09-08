import React, { Component } from 'react';
import { Skeleton, Spin } from 'antd';
import styles from './iframe.module.less';

class IFrame extends Component {
    constructor() {
        super();
        this.state = {
            skeletonLoading: true
        };
        this.frmRef = React.createRef();
    }

    componentWillUnmount() {
        if (this.handler) {
            window.removeEventListener('message', this.handler, false);
        }
    }

    componentDidMount() {
        this.handler = (e) => {
            let data = e.data;
            let { src, params, removeTab } = this.props;
            if (data.action === 'load' && data.params === 'ready' && data.src === src) {
                let frm = this.frmRef.current;
                if (frm) {
                    let frmWin = frm.contentWindow;
                    frmWin.postMessage({
                        action: 'addTab',
                        params: params
                    }, '*');
                }
            }

            if (data.action === 'removeTab' && data.src === src) {
                removeTab(true, null);
            }
        };
        window.addEventListener('message', this.handler, false);
    }

    onLoaded() {
        if (this.state.skeletonLoading === true) {
            setTimeout(() => {
                let { src, params } = this.props;
                this.setState({
                    skeletonLoading: false
                }, () => {
                    // let frm = this.frmRef.current;
                    // let frmWin = frm.contentWindow;
                    // frmWin.postMessage({
                    //     action: 'addTab',
                    //     params: params
                    // }, '*');
                });
            }, 600);
        }
    }

    render() {
        const { name, src = 'about:blank', params } = this.props;

        return (
            <Skeleton loading={this.state.skeletonLoading} size='large' avatar paragraph={{ rows: 16 }} active>
                <iframe ref={this.frmRef} name={name} src={src} className={styles.iframe} frameBorder='0' onLoad={this.onLoaded()} />
            </Skeleton>
        );
    }
}

export default IFrame;