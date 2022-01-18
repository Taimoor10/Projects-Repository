/*
The code implemented in the file is inspired by a project under MIT license and implemented according to the
requirements of the developed application.
The project is used as a research and study to implement a user interface for the application. Moreover, several
elements were also used and utilised for designing a user interface

Details:
author: "KhimGurung",
title: "rn-onlineticket",
URL: "https://github.com/KhimGurung/rn-onlineticket",
License: "MIT"
*/


import { createStore, combineReducers } from 'redux';
import barSwitcherReducer from './barSwitch/barSwitcherReducer';
import claimReducer from './claims/claimListReducer';
import accountReducer from './account/accountReducer';

const rootReducer = combineReducers({
    claim: claimReducer,
    claimSwitches: barSwitcherReducer,
    account: accountReducer,
})

const store = createStore(rootReducer);

export default store;