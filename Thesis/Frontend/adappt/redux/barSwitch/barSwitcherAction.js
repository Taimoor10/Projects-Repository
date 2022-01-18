import {claimsBarrSwitcher} from './barSwitcherType';

let setClaimsSwitch = claim => ({
    type:  claimsBarrSwitcher,
    claim
})

let claimsSwitch = {
    expiredTab: 'ExpiredTab',
    validTab: 'ValidTab'
}

export {setClaimsSwitch, claimsSwitch}