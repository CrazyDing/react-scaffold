import _ from 'lodash/core';
import { UPDATE_MENUS_DATA, UPDATE_SIDER_COLLAPSED } from '../../constants/actionTypes';

// 菜单数据
const menuData = [];
// 是否收缩
const isCollapsed = false;

let switchMap = {};

switchMap[UPDATE_SIDER_COLLAPSED] = (state, action) => {
    return action.payload;
};

switchMap[UPDATE_MENUS_DATA] = (state, action) => {
    return action.payload;
};

function collapsed(state = isCollapsed, action) {
    if (_.isEqual(action.type, UPDATE_SIDER_COLLAPSED) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

function menus(state = menuData, action) {
    if (_.isEqual(action.type, UPDATE_MENUS_DATA) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export { collapsed, menus };
