import { showQrCode, addClaim} from './clalimListType';

let fillQrCodeData = (data = null) => {
    return {
        type: showQrCode,
        payload: data
    }
}

let addClaimData = (claim) => {
    return {
        type: addClaim,
        payload: claim
    }
}

export{fillQrCodeData,addClaimData}

