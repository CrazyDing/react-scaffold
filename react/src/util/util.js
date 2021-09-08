import React, { createElement } from 'react';
import Loadable from 'react-loadable';
import { Spin, Icon, Empty, notification } from 'antd';
import { BASE_URL } from '../constants';
// 轻量级日期管理：https://date-fns.org/
import getTime from 'date-fns/getTime';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import startsWith from 'lodash/startsWith';
import axios from 'axios';

// 动态import组件
export const dynamicWrapper = (component) => {
  const defaultPath = 'notfound/notfound';
  // () => import('module')
  return Loadable({
    loader: () => {
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props
          });
      }).catch(e => {
        // 路径错误默认import 404
        if (startsWith(e.toString(), 'Error: Cannot find module')) {
          const NotFoundComponent = dynamicWrapper(() => { return import(`../screens/${defaultPath}`) });
          return NotFoundComponent;
        }
      });
    },
    loading: () => {
      return <Spin size='large' className='global-spin' />;
    }
  });
};

export const RenderEmpty = () => {
  return (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' />
  );
};

export const IconFont = Icon.createFromIconfontCN({
  scriptUrl: `/iconfont.js`
});

// 解析URL参数, getUrlParam('flowId')
export const getUrlParam = (href, name) => {
  let args = arguments, newHref;
  if (args.length === 1) {
    newHref = window.location.href;
    name = args[0];
  } else if (args.length > 1) {
    newHref = href;
  } else {
    return '';
  }

  let urlArr = newHref.split('?');
  if (urlArr.length > 1) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'),
      url = urlArr[1];
    let r = url.match(reg);
    // 解码
    if (r != null) {
      let value = decodeURI(r[2]);
      if (value == 'undefined') {
        value = '';
      }
      return value;
    }
    return '';
  } else {
    return '';
  }
}

// 基于axios，文档：http://www.axios-js.com/zh-cn/docs/
const startAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 0,
  // headers: {'iv-user': '010644'}
});

// 添加请求拦截器
startAxios.interceptors.request.use(
  (config) => {
    config.startTime = getTime(new Date());
    return config;
  },
  (error) => {
    notification.error({
      message: `请求错误`,
      duration: 2.5,
      description: error.toString()
    });
  }
);

// 添加响应拦截器
startAxios.interceptors.response.use(
  (response) => {
    let diffTime = differenceInMilliseconds(getTime(new Date()), response.config.startTime);
    response.diffTime = diffTime;
    return response.data;
  },
  (error) => {
    notification.error({
      message: `响应错误`,
      duration: 2.5,
      description: error.toString()
    });
  }
);

export { startAxios };