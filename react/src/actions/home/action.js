import { startAxios } from '../../util/util';
import { UPDATE_MENUS_DATA } from '../../constants/actionTypes';
import { UPDATE_SIDER_COLLAPSED } from '../../constants/actionTypes';

const url = '/getLoginMenus';  //菜单权限

function updateSiderCollapsed(data) {
    return {
        type: UPDATE_SIDER_COLLAPSED,
        payload: data
    };
}

function updateMenusAction(data) {
    return {
        type: UPDATE_MENUS_DATA,
        payload: data
    };
}

function requestMenusAction(callback) {
    // thunkMiddleware给这里dispatch形参进行赋值
    return dispatch => {
        startAxios(url)
            .then(result => {
                if (_.isFunction(callback)) {
                    callback(result.result);
                }
                dispatch(updateMenusAction(result.result.data.menus));
            });
    };
}

export { updateSiderCollapsed, updateMenusAction, requestMenusAction };