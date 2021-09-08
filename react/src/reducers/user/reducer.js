import _ from 'lodash/core';
import { UPDATE_USER_INFO } from '../../constants/actionTypes';

// 登录状态
const userInfo = {
    id: '', // 工号
    name: '', // 姓名
    orgName: '' // 部门
};

let switchMap = {};

switchMap[UPDATE_USER_INFO] = (state, action) => {
    return Object.assign({}, state, action.payload);
};

function user(state = userInfo, action) {
    if (_.isEqual(action.type, UPDATE_USER_INFO) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export { user };