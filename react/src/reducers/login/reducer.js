import _ from 'lodash/core';
import { UPDATE_LOGIN_STATUS, UPDATE_MODIFY_PASSWORD_STATUS } from '../../constants/actionTypes';

// 登录状态
const loginStatus = {
    submitting: false, // 是否登录提交中
    success: null,
    message: '',
    status: ''
};
// 修改密码的状态
const modifyStatus = {
    submitting: false, // 是否修改提交中
    success: null,
    message: '',
    status: ''
};

let switchMap = {};

switchMap[UPDATE_LOGIN_STATUS] = (state, action) => {
    return Object.assign({}, state, action.payload);
};

function login(state = loginStatus, action) {
    if (_.isEqual(action.type, UPDATE_LOGIN_STATUS) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

switchMap[UPDATE_MODIFY_PASSWORD_STATUS] = (state, action) => {
    return Object.assign({}, state, action.payload);
};

function modify(state = modifyStatus, action) {
    if (_.isEqual(action.type, UPDATE_MODIFY_PASSWORD_STATUS) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export { login, modify };
