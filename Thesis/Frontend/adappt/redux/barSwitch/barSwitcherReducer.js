import {claimsBarrSwitcher} from './barSwitcherType'
import { claimsSwitch } from './barSwitcherAction';

initialState = {
    claims: claimsSwitch.validTab
}

let barSwitcherReducer = (state = initialState , claim) => {
    if(claimsBarrSwitcher)
    {
        return {claims: claim.filter}
        
    }
    else
    {
        return state
    }
}

export default barSwitcherReducer;