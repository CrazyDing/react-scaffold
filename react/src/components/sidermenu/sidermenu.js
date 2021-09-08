import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Layout, Menu, Spin, Tooltip, Icon } from 'antd';
import { SYS_ID, GLOBAL_NAME, HOMEPAGE_KEY } from '../../constants';
import { IconFont } from '../../util/util';
import _ from 'lodash/core';
import startsWith from 'lodash/startsWith';
import styles from './sidermenu.module.less';

const { Sider } = Layout;
const { SubMenu } = Menu;

class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      current: [HOMEPAGE_KEY],
      openKeys: []
    };
  }

  // 深度优先遍历把菜单树上的所有key(path)放进一个数组
  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach((item) => {
      if (item.children) {
        keys.push(item.path);
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      } else {
        keys.push(item.path);
      }
    });
    return keys;
  }

  // 深度优先遍历生成菜单树
  getNavMenuItems(menusData) {
    if (_.isEmpty(menusData)) {
      return [];
    }
    return menusData.map((item) => {
      if (!item.name) {
        return null;
      }
      let itemPath = item.path,
        icon = '';
      if (!_.isEmpty(item.icon)) {
        if (startsWith(item.icon, 'iconfont-')) {
          icon = <IconFont type={`${item.icon}`} />
        } else {
          icon = <Icon type={`${item.icon}`} />
        }
      }
      if (item.children && item.children.some(child => child.name)) {
        return item.hideInMenu ? null :
          (
            <SubMenu
              title={
                item.icon ? (
                  <span>
                    {icon}
                    <span>{item.name}</span>
                  </span>
                ) : item.name
              }
              key={item.key || item.path}
            >
              {this.getNavMenuItems(item.children)}
            </SubMenu>
          );
      }

      return item.hideInMenu ? null :
        (
          <Menu.Item key={item.key || item.path}>
            <Link
              to={`/${SYS_ID}/home/${itemPath}`}
              replace={`/${SYS_ID}/home/${itemPath}` === this.props.location.pathname}
            >
              {icon}<span>{item.name}</span>
            </Link>
          </Menu.Item>
        );
    });
  }

  handleMenuClick(e) {
    this.setState({
      current: [e.key]
    });
  }

  handleOpenChange(openKeys) {
    let { menus } = this.props;
    const lastOpenKey = openKeys[openKeys.length - 1];
    const isMainMenu = menus.some(
      item => lastOpenKey && (item.key === lastOpenKey || item.path === lastOpenKey)
    );
    this.setState({
      openKeys: isMainMenu ? [lastOpenKey] : [...openKeys]
    });
  }

  changeMenuOpenKey(key) {
    let re = /\w+\-?\w+\/?/g;
    let splitArr = key.match(re),
      openKeys = this.state.openKeys;
    if (key !== HOMEPAGE_KEY) {
      for (let i = 0, len = splitArr.length - 1; i < len; i++) {
        let tempKey = '';
        for (let j = 0; j <= i; j++) {
          tempKey += splitArr[j];
        }
        openKeys[i] = tempKey;
      }
      let re2 = /^(.*)\/$/;
      for (let i = 0, len = openKeys.length; i < len; i++) {
        openKeys[i] = openKeys[i].replace(re2, '$1');
      }
    }

    this.setState({
      current: [key],
      openKeys: openKeys
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let menus = nextProps.menus;
    if (_.isEmpty(prevState.openKeys) && !_.isEmpty(menus)) {
      let openKey = menus[0].path;
      if (!_.isEmpty(menus[1])) {
        openKey = menus[1].path;
      }
      return {
        ...prevState,
        openKeys: [openKey]
      };
    }

    return null;
  }

  render() {
    const { collapsed, menus, title } = this.props;
    // 菜单收起来后关闭所有子菜单
    let selectedKeys = this.state.current;
    const menuProps = collapsed ? {} : {
      openKeys: this.state.openKeys
    };
    return (
      <Sider
        trigger={null}
        breakpoint='md'
        collapsible
        collapsed={collapsed}
        width={256}
        className={styles.sider}
      >
        <div className={styles.logo}>
          {
            collapsed ?
              <Tooltip title={this.props.tooltip || GLOBAL_NAME} placement='right'>
                <img src={require('../../assets/imgs/logo.png')} alt='logo' />
              </Tooltip> :
              <img src={require('../../assets/imgs/logo.png')} alt='logo' />
          }
          <h1>{title || GLOBAL_NAME}</h1>
        </div>
        {
          _.isEmpty(menus) ?
            <Spin size='large' style={{ margin: '30vh auto', width: '100%' }} /> :
            <Menu
              theme='dark'
              mode='inline'
              {...menuProps}
              selectedKeys={selectedKeys}
              onClick={this.handleMenuClick.bind(this)}
              onOpenChange={this.handleOpenChange.bind(this)}
              style={{ padding: '16px 0', width: '100%' }}
            >
              {this.getNavMenuItems(menus)}
            </Menu>
        }
      </Sider>
    );
  }
}

SiderMenu.propTypes = {
  collapsed: PropTypes.bool.isRequired
};

export default SiderMenu;