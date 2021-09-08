import React from 'react';
import moment from 'moment';
import reqwest from 'reqwest';
import cookie from 'js-cookie';
import { notification } from 'antd';
import { SYS_ID } from '../constants/index';
import _ from 'lodash';

// 整理大部分状态码
const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作',
  // 401: '用户没有权限（令牌、用户名、密码错误）',
  401: '会话结束，请重新登录',
  403: '用户得到授权，但是访问是被禁止的',
  404: '发出的请求不存在或者网页不存在',
  406: '请求的格式不可得',
  410: '请求的资源被永久删除，且不会再得到',
  422: '当创建一个对象时，发生一个验证错误',
  500: '服务器发生错误，请联系管理员',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
  0: '网络异常，请重试'
};

function checkStatus(response, url, queryTime) {
  if (_.isPlainObject(response)) {
    response.queryTime = queryTime;
  }

  if ((response && response.hasError === true) || response === 'error') {
    let errorText = response.error;
    notification.error({
      message: `请求错误`,
      description: errorText
    });

    return response;
  }

  // if (_.isUndefined(response.code) || _.isNull(response.code) ||
  //   (response.code >= 200 && response.code < 300)) {
  //   return response;
  // }

  // let errorText = codeMessage[response.code] || response.errorDesc;
  // notification.error({
  //   message:
  //     <div>
  //       <span>HTTP请求错误 {response.code}&nbsp;:&nbsp;&nbsp;</span>
  //       <span>{url}</span>
  //     </div>
  //   ,
  //   description: errorText,
  //   duration: 0,
  //   style: {
  //     width: 480,
  //     marginLeft: -125
  //   }
  // });

  return response;

  // const error = new Error(response.errorDesc);
  // error.response = response;
  // throw error;
}

function checkError(err, msg, url) {
  const errorText = codeMessage[err.status] || `${err.status} ${err.statusText}`;
  let duration = err.status === 401 ? 3.5 : 0;
  notification.error({
    message:
      <div>
        <span>HTTP请求错误 {err.status}&nbsp;:&nbsp;&nbsp;</span>
        <span>{url}</span>
      </div>
    ,
    description: errorText,
    duration: duration,
    style: {
      width: 500,
      marginLeft: -125
    }
  });
  if (err.status === 401) {
    sessionStorage.setItem('loginStatus', '');
    window.location.href = `/${SYS_ID}/login`;
  }

  return Promise.reject(errorText);
}

function xFetch(url, options) {
  let opts = { ...options };

  if (!opts.method) {
    opts.method = 'get';
  }

  // if (opts.method.toUpperCase() === 'POST' || opts.method.toUpperCase() === 'PUT') {
  //   opts.data = JSON.stringify(opts.data);
  // }

  opts.headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json;charset=utf-8',
    // 'application/x-www-form-urlencoded',
    'Authorization': cookie.get('authorization') || '',
    ...opts.headers
  };

  if (!opts.type) {
    // opts.type = 'json';
  }

  // 设置超时时间，默认永不超时
  if (!opts.timeout) {
    opts.timeout = 0;
  }

  if (opts.method.toUpperCase() === 'GET') {
    opts.data = {
      ...opts.data,
      timestamp: moment().valueOf()
    };
  }

  // 计算本次查询花费时间
  let startQueryMoment = moment(), endQueryMoment = moment();
  let queryTime = 0;

  let xF = reqwest({
    url: url,
    ...opts
  });
  xF.then((response) => {
    // if (xF.request.getResponseHeader('Content-Type') === 'text/html' && xF.request.getResponseHeader('content-length')) {
    //   window.location.href = 'http://eip.****.com.cn';
    //   return
    // }
    endQueryMoment = moment();
    queryTime = moment.duration(endQueryMoment - startQueryMoment).asSeconds();
    return checkStatus(response, url, queryTime);
  }).fail((err, msg) => {
    checkError(err, msg, url);
  });
  return xF;
}

export default xFetch;