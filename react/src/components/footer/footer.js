import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styles from './footer.module.less';

class GlobalFooter extends PureComponent {
    render() {
        const { className, links, copyright } = this.props;

        return (
            <div className={`${styles.globalFooter} ${styles[className]}`}>
                {
                    links && (
                        <div className={styles.links}>
                            {links.map(link => (
                                <a
                                    key={link.title}
                                    target={link.blankTarget ? '_blank' : '_self'}
                                    href={link.href}
                                >
                                    {link.title}
                                </a>
                            ))}
                        </div>
                    )
                }
                {copyright && <div className={styles.copyright}>{copyright}</div>}
            </div>
        );
    }
}

export default GlobalFooter;
