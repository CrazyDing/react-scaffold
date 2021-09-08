import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Modal, Menu, Icon, Spin, Dropdown, Avatar } from 'antd';
import Ellipsis from '../../components/ellipsis/ellipsis';
// import GlobalSearch from '../searcher/searcher';
import { updateSiderCollapsed, updateMenusAction } from '../../actions/home/action';
import { updateLoginStatusAction, postLogoutAction } from '../../actions/login/action';
import styles from './header.module.less';
import { connect } from 'react-redux';

const { Header } = Layout;
const { confirm } = Modal;

class GlobalHeader extends Component {
    handleMenuClick = (e) => {
        if (e.key === 'logout') {
            this.confirmLogout();
        }
        if (e.key === 'modify') {
            this.context.router.history.replace('/modify');
        }
    }

    // 确认是否退出登录
    confirmLogout() {
        const { dispatch, user } = this.props;
        let that = this;
        confirm({
            title: '您是否确认要退出登录？',
            content: '退出登录将无法对系统进一步操作。',
            onOk() {
                dispatch(
                    postLogoutAction({
                        userId: user.id
                    }, () => {
                        // sessionStorage清除登录信息
                        sessionStorage.setItem('loginStatus', '');
                        that.props.dispatch(
                            updateLoginStatusAction({
                                status: ''
                            })
                        );
                        that.props.dispatch(
                            updateSiderCollapsed(false)
                        );
                        that.props.dispatch(
                            updateMenusAction([])
                        );
                        // 路由跳转至登录页面
                        that.context.router.history.replace('/login');
                    })
                );
            },
            onCancel() {
                // 啥事都不做
            }
        });
    }

    toggle() {
        const { collapsed, dispatch } = this.props;
        dispatch(updateSiderCollapsed(!collapsed));
    }

    render() {
        const { user, collapsed, fixed } = this.props;
        const menu = (
            <Menu className={styles.menu} onClick={this.handleMenuClick.bind(this)}>
                <Menu.Item disabled><Icon type='user' />个人中心</Menu.Item>
                <Menu.Item key='modify'><Icon type='key' />修改密码</Menu.Item>
                <Menu.Divider />
                <Menu.Item key='logout'><Icon type='logout' />退出登录</Menu.Item>
            </Menu>
        );

        return (
            <Header className={fixed ? (collapsed ? styles.fixedCollapsedHeader : styles.fixedHeader) : styles.header}>
                <Icon
                    className={styles.trigger}
                    type={collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.toggle.bind(this)}
                />
                <div className={styles.right}>
                    {/* <GlobalSearch
                        className={`${styles.action} ${styles.search}`}
                        placeholder='系统内搜索'
                        dataSource={[]}
                        onSearch={(value) => {

                        }}
                        onPressEnter={(value) => {

                        }}
                    /> */}
                    {user.name ? (
                        <Dropdown overlay={menu}>
                            <div className={`${styles.action} ${styles.account}`}>
                                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, padding: '0 10px' }}>
                                    <Avatar size='default' icon='user' className={styles.avatar} />
                                </div>
                                <div style={{ position: 'absolute', top: 0, left: 52, right: 0, height: '100%' }}>
                                    <div style={{ height: '50%', textAlign: 'center', lineHeight: '28px' }}>
                                        {user.name}
                                    </div>
                                    <div style={{ height: '50%', textAlign: 'center', lineHeight: '22px' }}>
                                        <Ellipsis tooltip={{ title: user.section, placement: 'left' }} length={6}>
                                            {user.section}
                                        </Ellipsis>
                                    </div>
                                </div>
                            </div>
                        </Dropdown>
                    ) : <Spin size='small' style={{ marginLeft: 10 }} />}
                </div>
            </Header>
        );
    }
}

function mapStateToProps(state) {
    return {
        routing: state.routing,
        user: state.user
    };
}

GlobalHeader.propTypes = {
    routing: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
};

GlobalHeader.contextTypes = {
    router: PropTypes.object.isRequired
};

export default connect(mapStateToProps)(GlobalHeader);