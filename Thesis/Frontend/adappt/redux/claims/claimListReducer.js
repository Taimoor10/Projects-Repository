import {dummyData} from '../../dummyData'
import { showQrCode, addClaim } from './clalimListType';
import { addClaimData } from './claimListAction';

initialState = {
    claims: dummyData
}

let claimReducer = (state = initialState, claim) => {
    if(claim.type==showQrCode)
    {
        return{...state}
    }
    else if(claim.type==addClaim)
    {
        dummyData.push(claim.payload)
        return state
    }
    else
    {
        return state
    }
}

export default claimReducer;