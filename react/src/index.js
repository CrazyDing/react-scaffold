// 整个程序的启动点
import './index.less';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import DocumentTitle from 'react-document-title';
import { SYS_ID, GLOBAL_NAME } from './constants';
import { dynamicWrapper, RenderEmpty } from './util/util';
import configureStore from './store/configureStore';
import '@babel/polyfill';

const store = configureStore();
const supportsHistory = 'pushState' in window.history;

const AsyncLogin = dynamicWrapper(() => { return import(`./screens/login/login`) });
const AsyncHome = dynamicWrapper(() => { return import(`./screens/home/home`) });

// 如果作为子页面嵌在Iframe中
if (window !== top) {
    render(
        <Provider store={store}>
            <ConfigProvider locale={zhCN} renderEmpty={RenderEmpty} getPopupContainer={(triggerNode) => {
                if (triggerNode) {
                    return triggerNode.parentNode;
                } else {
                    return document.body;
                }
            }}>
                <DocumentTitle title={GLOBAL_NAME}>
                    <BrowserRouter forceRefresh={!supportsHistory}>
                        <Switch>
                            <Route path={`/${SYS_ID}/login`} component={AsyncLogin} />
                            <Route path={`/${SYS_ID}/home`} component={AsyncHome} />
                            <Route path={`/${SYS_ID}/independent`} render={(match) => {
                                let reg = new RegExp(`/${SYS_ID}/independent/`);
                                let pathName = match.location.pathname,
                                    path = pathName.replace(reg, '');
                                const AsyncComp = dynamicWrapper(() => { return import(`./screens/${path}`) });
                                return <AsyncComp addTab={() => { }} removeTab={() => { }} noRefresh={() => { }} />;
                            }} />
                            <Redirect to={`/${SYS_ID}/login`} />
                        </Switch>
                    </BrowserRouter>
                </DocumentTitle>
            </ConfigProvider>
        </Provider>, document.getElementById('root')
    );
    window.addEventListener('message', (e) => {
        let params = {};
        let data = e.data;
        if (data.action === 'addTab') {
            params = data.params;
            render(
                <Provider store={store}>
                    <ConfigProvider locale={zhCN} renderEmpty={RenderEmpty} getPopupContainer={(triggerNode) => {
                        if (triggerNode) {
                            return triggerNode.parentNode;
                        } else {
                            return document.body;
                        }
                    }}>
                        <DocumentTitle title={GLOBAL_NAME}>
                            <BrowserRouter forceRefresh={!supportsHistory}>
                                <Switch>
                                    <Route path={`/${SYS_ID}/login`} component={AsyncLogin} />
                                    <Route path={`/${SYS_ID}/home`} component={AsyncHome} />
                                    <Route path={`/${SYS_ID}/independent`} render={(match) => {
                                        let reg = new RegExp(`/${SYS_ID}/independent/`);
                                        let pathName = match.location.pathname,
                                            path = pathName.replace(reg, '');
                                        const AsyncComp = dynamicWrapper(() => { return import(`./screens/${path}`) });
                                        return <AsyncComp addTab={() => { }} removeTab={() => { }} noRefresh={() => { }} />;
                                    }} />
                                    <Redirect to={`/${SYS_ID}/login`} />
                                </Switch>
                            </BrowserRouter>
                        </DocumentTitle>
                    </ConfigProvider>
                </Provider>, document.getElementById('root')
            );
        }
    }, false);
    // 通知父页面加载完成
    window.top.postMessage({
        action: 'load',
        params: 'ready',
        src: window.location.href
    }, '*');
} else {
    render(
        <Provider store={store}>
            <ConfigProvider locale={zhCN} renderEmpty={RenderEmpty} getPopupContainer={(triggerNode) => {
                if (triggerNode) {
                    return triggerNode.parentNode;
                } else {
                    return document.body;
                }
            }}>
                <DocumentTitle title={GLOBAL_NAME}>
                    <BrowserRouter forceRefresh={!supportsHistory}>
                        <Switch>
                            <Route path={`/${SYS_ID}/login`} component={AsyncLogin} />
                            <Route path={`/${SYS_ID}/home`} component={AsyncHome} />
                            <Route path={`/${SYS_ID}/independent`} render={(match) => {
                                let reg = new RegExp(`/${SYS_ID}/independent/`);
                                let pathName = match.location.pathname,
                                    path = pathName.replace(reg, '');
                                const AsyncComp = dynamicWrapper(() => { return import(`./screens/${path}`) });
                                return <AsyncComp addTab={() => { }} removeTab={() => { }} noRefresh={() => { }} />;
                            }} />
                            <Redirect to={`/${SYS_ID}/login`} />
                        </Switch>
                    </BrowserRouter>
                </DocumentTitle>
            </ConfigProvider>
        </Provider>, document.getElementById('root')
    );
}