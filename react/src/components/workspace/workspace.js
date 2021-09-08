import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tabs, Dropdown, Menu, Button, Icon } from 'antd';
import DashBoard from '../../screens/dashboard/dashboard';
import { ErrorBoundary } from '../../components/errorboundary/errorboundary';
import { SYS_ID, HOMEPAGE_KEY } from '../../constants';
import { dynamicWrapper } from '../../util/util';
import _ from 'lodash/core';
import startsWith from 'lodash/startsWith';
import styles from './workspace.module.less';
const TabPane = Tabs.TabPane;

// 基于Tabs封装工作区
class WorkSpace extends Component {
  constructor(props) {
    super(props);

    this.isOnlyChangeURL = false;

    // tab默认包含首页
    this.state = {
      keys: [`tab/${HOMEPAGE_KEY}`],
      activeKey: `tab/${HOMEPAGE_KEY}`,
      panes: [
        {
          title: <span style={{ userSelect: 'none' }} onDoubleClick={this.doubleClick.bind(this, `tab/${HOMEPAGE_KEY}`)}>首页</span>,
          content: <DashBoard addTab={(key, title, path, externals, args) => this.props.addTab(key, title, path, externals, args)} noRefresh={this.setOnlyChangeURL.bind(this)} />,
          key: `tab/${HOMEPAGE_KEY}`,
          closable: false
        }
      ]
    };
  }

  // 双击刷新Tab
  doubleClick(path, e) {
    const panes = [...this.state.panes];
    const index = panes.findIndex(item => {
      return item.key === path;
    });
    const curentPane = panes.splice(index, 1);
    this.setState({
      panes
    }, () => {
      const nextPanes = [...this.state.panes];
      nextPanes.splice(index, 0, curentPane[0]);
      this.setState({
        panes: nextPanes
      });
    });
  }

  // 点击更多按钮里的菜单时触发，首页永久不删除
  handleMenuClick(e) {
    const props = this.props;
    let re = /tab/;

    if (e.key === 'Tabs-CloseOthers') {
      let activeKey = this.state.activeKey;
      const panes = this.state.panes.filter(pane => { return (pane.key === activeKey || pane.key === `tab/${HOMEPAGE_KEY}`) });
      const keys = this.state.keys.filter(key => { return (key === activeKey || key === `tab/${HOMEPAGE_KEY}`) });
      let realPath = activeKey.replace(re, `/${SYS_ID}/home`);
      this.isOnlyChangeURL = true;
      props.history.replace(realPath);
      this.setState({ keys, panes, activeKey });
    }

    if (e.key === 'Tabs-CloseAll') {
      let activeKeyA = `tab/${HOMEPAGE_KEY}`;
      const panesA = this.state.panes.filter(pane => pane.key === `tab/${HOMEPAGE_KEY}`);
      const keysA = this.state.keys.filter(key => key === `tab/${HOMEPAGE_KEY}`);
      this.state.activeKey = activeKeyA;
      this.state.panes = [...panesA];
      this.state.keys = [...keysA];
      let realPathA = activeKeyA.replace(re, `/${SYS_ID}/home`);
      this.isOnlyChangeURL = true;
      props.history.replace(realPathA);
      this.setState({ keysA, panesA, activeKeyA });
    }
  }

  // 点击更多按钮时触发
  handleButtonClick() {

  }

  // 切换tab时触发
  onChange(activeKey) {
    const props = this.props;
    let re = /tab/;
    let realPath = activeKey.replace(re, `/${SYS_ID}/home`);
    this.setState({ activeKey });
    props.onChange(realPath);
    this.isOnlyChangeURL = true;
    props.history.replace(realPath);
  }

  // 点击tab的关闭图标或者新增图标时触发
  // action为add或remove
  onEdit(targetKey, action) {
    this[action](targetKey);
  }

  add(key, title, newAdd, options) {
    const keys = this.state.keys;
    const panes = this.state.panes;
    const activeKey = `tab/${key}`;
    let activeIndex = keys.indexOf(activeKey);
    if (activeIndex < 0) {
      keys.push(activeKey);
      const NewAdd = newAdd;
      panes.push({
        key: activeKey,
        title: <span style={{ userSelect: 'none' }} onDoubleClick={this.doubleClick.bind(this, activeKey)}>{title}</span>,
        content:
          <NewAdd {...options}
            addTab={(key, title, path, externals, args, nesting) => this.props.addTab(key, title, path, externals, args, nesting)}
            removeTab={(externals, key) => { this.props.removeTab(externals, key) }}
            noRefresh={this.setOnlyChangeURL.bind(this)}
          />,
      });
    } else {
      if (!panes[activeIndex].title.props.children) {
        panes[activeIndex].title = <span style={{ userSelect: 'none' }} onDoubleClick={this.doubleClick.bind(this, activeKey)}>{title}</span>;
      }
    }

    this.isOnlyChangeURL = true;
    this.setState({ keys, panes, activeKey });
  }

  remove(targetKey) {
    // 首页不可删除
    if (targetKey === `tab/${HOMEPAGE_KEY}`) {
      return;
    }

    const props = this.props;
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    const keys = this.state.keys.filter(key => key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }

    let re = /tab/;
    let realPath = activeKey.replace(re, `/${SYS_ID}/home`);
    props.onChange(realPath);

    this.isOnlyChangeURL = true;
    props.history.replace(realPath);

    this.isOnlyChangeURL = true;
    this.setState({ keys, panes, activeKey });
  }

  // 渲染完成执行此方法
  componentDidMount() {
    this.props.onRef(this);
  }

  setOnlyChangeURL(isTrue) {
    this.isOnlyChangeURL = isTrue;
  }

  // 每次渲染完成后进入包括setState后
  componentDidUpdate(prevProps) {
    if (this.isOnlyChangeURL) {
      this.isOnlyChangeURL = false;
      return;
    }

    let thisProps = this.props;
    if (_.isEmpty(thisProps.transferedMap)) {
      return;
    }

    let re = new RegExp(`/${SYS_ID}/home/`);
    let prevPath = prevProps.url || prevProps.match.url,
      thisPath = thisProps.url || thisProps.match.url;
    let realPath = thisPath.replace(re, ''),
      defaultPath = 'notfound/notfound';

    if (thisProps.params && thisProps.params.isRemove === true) {
      if (thisProps.params.externals === true) {
        if (thisProps.params.key) {
          this.remove(`tab/${realPath}/${thisProps.params.key}`);
        } else {
          this.remove(`tab/${realPath}`);
        }
      } else {
        this.remove(`tab/${realPath}`);
      }

      return;
    }

    // 这种情况属于用API打开新tab
    if (prevPath === thisPath && thisProps.params && thisProps.params.externals === true) {
      this.isOnlyChangeURL = true;
      this.props.history.replace(`/${SYS_ID}/home/${realPath}/${thisProps.params.key}`);
      try {
        const AsyncAddComponent = dynamicWrapper(() => { return import(`../../screens/${thisProps.params.path}`) });
        sessionStorage.setItem(`$-${realPath}/${thisProps.params.key}`, realPath);
        this.add(`${realPath}/${thisProps.params.key}`, `${thisProps.params.title}`, AsyncAddComponent, thisProps.params.args);
      } catch (e) {
        if (startsWith(e.toString(), 'Error: Cannot find module')) {
          const AsyncNotFound = dynamicWrapper(() => { return import(`../../screens/${defaultPath}`) });
          // 打开notfound
          this.add(`${realPath}/${thisProps.params.key}`, 'oops...', AsyncNotFound);
        }
      }
    } else {
      // 这种情况属于从菜单打开页面或者页面自身发出请求执行到这里
      try {
        // 菜单中的内容是iframe，嵌入外部页面
        if (this.getLink(thisProps.transferedMap, realPath)) {
          const AsyncAddComponent = dynamicWrapper(() => { return import(`../../components/iframe/iframe`) });
          this.add(`${realPath}`, `${this.getTitle(thisProps.transferedMap, realPath)}`, AsyncAddComponent, {
            src: `${this.getLink(thisProps.transferedMap, realPath)}`
          });
          thisProps.onChange(thisPath);
          return;
        }

        let apiPath = sessionStorage.getItem(`$-${realPath}`);
        // 当前页面非临时打开的页面，则根据路径realPath打开
        if (!apiPath) {
          const AsyncAddComponent = dynamicWrapper(() => { return import(`../../screens/${realPath}`) });
          this.add(realPath, this.getTitle(thisProps.transferedMap, realPath), AsyncAddComponent);
        } else {
          // 打开临时页面的页面没有被关闭的情况下；也可以理解为非刷新浏览器的情况下，打开的临时页面中调用接口请求然后执行到这里
          // let allKeys = this.state.keys;
          // if (_.includes(allKeys, `tab/${apiPath}`)) {
          //   return;
          // }
          // 打开了临时页面后，临时页面中调用接口
          if (this.props.newEnter === false) {
            return;
          }
          // 刷新浏览器的情况下，apiPath不包含在打开的tab keys里，来源页面的key不在state里
          this.isOnlyChangeURL = true;
          this.props.history.replace(`/${SYS_ID}/home/${apiPath}`);
          const AsyncAddComponent = dynamicWrapper(() => { return import(`../../screens/${apiPath}`) });
          this.add(apiPath, this.getTitle(thisProps.transferedMap, apiPath), AsyncAddComponent);
        }
      } catch (e) {
        if (startsWith(e.toString(), 'Error: Cannot find module')) {
          const AsyncNotFound = dynamicWrapper(() => { return import(`../../screens/${defaultPath}`) });
          // // 打开notfound
          this.add(realPath, 'oops...', AsyncNotFound);
        }
      }
      thisProps.onChange(thisPath);
    }
  }

  getTitle(map, path) {
    if (map[path]) {
      return map[path].title || '';
    } else {
      return '';
    }
  }

  getLink(map, path) {
    if (map[path]) {
      return map[path].link || '';
    } else {
      return '';
    }
  }

  render() {
    const menu = (
      <Menu onClick={e => this.handleMenuClick(e)}>
        <Menu.Item key='Tabs-CloseOthers'>关闭其他</Menu.Item>
        <Menu.Item key='Tabs-CloseAll'>关闭所有</Menu.Item>
      </Menu>
    );

    let operations = (
      <Dropdown
        type='ghost'
        onClick={e => this.handleButtonClick(e)}
        overlay={menu}
        trigger={['click']}
      >
        <Button>
          更多操作 <Icon type='down' />
        </Button>
      </Dropdown>
    );

    return (
      <Tabs
        hideAdd
        className={styles.workTab}
        type='editable-card'
        activeKey={this.state.activeKey}
        tabBarExtraContent={operations}
        onChange={e => this.onChange(e)}
        onEdit={(key, action) => this.onEdit(key, action)}
      >
        {
          this.state.panes.map(pane =>
            <TabPane
              tab={pane.title}
              key={pane.key}
              style={{ background: '#f5f5f5' }}
              closable={pane.closable}
            >
              <ErrorBoundary>
                {pane.content}
              </ErrorBoundary>
            </TabPane>
          )
        }
      </Tabs>
    );
  }
}

export default withRouter(WorkSpace);