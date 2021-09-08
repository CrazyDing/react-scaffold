import React, { Component, createElement } from 'react';
import { Button } from 'antd';
import config from './typeconfig';
import styles from './exception.module.less';

class Exception extends Component {
    render() {
        const { className, linkElement = 'a', type, title, desc, img, actions } = this.props;
        const pageType = type in config ? type : '404';
        const removeTab = this.props.removeTab;

        return (
            <div className={styles.exception}>
                <div className={styles.imgBlock}>
                    <div className={`${styles.imgEle} ${styles[`img${pageType}`]}`} />
                </div>
                <div className={styles.content}>
                    <h1>{title || config[pageType].title}</h1>
                    <div className={styles.desc}>{desc || config[pageType].desc}</div>
                    <div className={styles.actions}>
                        {
                            actions ||
                            createElement(linkElement, {
                                // to: '',
                                // href: '',
                            }, <Button type='primary' onClick={removeTab.bind(this, true, null)}>关闭</Button>)
                        }
                    </div>
                </div>
            </div>
        );
    }
};

export default Exception;