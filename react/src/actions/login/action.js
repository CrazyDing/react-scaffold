import { startAxios } from '../../util/util';
import {
    UPDATE_LOGIN_STATUS,
    UPDATE_MODIFY_PASSWORD_STATUS
} from '../../constants/actionTypes';
import _ from 'lodash/core';

const loginUrl = '/userLogin';
const logoutUrl = '/userLogout';
const modifyUrl = '/modifyPassword';

// 超时次数
let count = 0;
// 提交登录表单
function postLoginAction(data, callback) {
    // thunkMiddleware给这里dispatch形参进行赋值
    return dispatch => {
        startAxios({
            url: loginUrl,
            method: 'post',
            data: JSON.stringify({
                userName: data.userName,
                password: data.password
            }),
        }).then(result => {
            if (!result.error) {
                dispatch(updateLoginStatusAction({
                    submitting: false,
                    success: result.success,
                    message: result.message,
                    status: result.result.data.login.status
                }));
                if (_.isFunction(callback)) {
                    callback(result.result.data.login.status);
                }
            } else {
                dispatch(updateLoginStatusAction({
                    submitting: false,
                    success: false,
                    message: '用户名或密码错误',
                    status: false
                }));
            }

        }).fail((err) => {
            if (err.status === 0) {
                count++;
                count <= 2 && dispatch(postLoginAction(data, callback));
            }
            if (count > 2) {
                dispatch(updateLoginStatusAction({
                    submitting: false
                }));
            }
        });
    };
}

// 更新登录状态
function updateLoginStatusAction(data) {
    return {
        type: UPDATE_LOGIN_STATUS,
        payload: data
    };
}

// 提交修改密码的表单
function postModifyPasswordAction(data, callback) {
    // thunkMiddleware给这里dispatch形参进行赋值
    return dispatch => {
        startAxios({
            url: modifyUrl,
            method: 'post',
            data: JSON.stringify({
                userId: data.userId,
                oriPassword: data.oriPassword,
                pwd: data.pwd,
                confirm: data.confirm
            })
        }).then(result => {
            dispatch(updateModifyStatusAction({
                submitting: false,
                success: result.success,
                message: result.message,
                status: result.data.modify.status
            }));
            if (_.isFunction(callback)) {
                callback(result.data.modify.status);
            }
        });
    };
}

// 更新修改密码的状态
function updateModifyStatusAction(data) {
    return {
        type: UPDATE_MODIFY_PASSWORD_STATUS,
        payload: data
    };
}

// 退出登录
function postLogoutAction(data, callback) {
    // thunkMiddleware给这里dispatch形参进行赋值
    return dispatch => {
        startAxios({
            url: logoutUrl,
            method: 'post',
            data: JSON.stringify({
                userId: data.userId
            })
        }).then(result => {
            if (_.isFunction(callback)) {
                callback(result.result.data.login.status);
            }
        });
    };
}

export {
    updateLoginStatusAction,
    postLoginAction,
    updateModifyStatusAction,
    postModifyPasswordAction,
    postLogoutAction
};