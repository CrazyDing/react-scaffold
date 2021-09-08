import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { login, modify } from './login/reducer';
import { menus, collapsed } from './home/reducer';
import { user } from './user/reducer';

const rootReducer = combineReducers({
    routing: routerReducer,
    login,
    modify,
    menus,
    collapsed,
    user
});

export default rootReducer;