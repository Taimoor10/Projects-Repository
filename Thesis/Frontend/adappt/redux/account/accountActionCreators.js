import { getAccounts, getAddress, savePersonalInformation } from "./accountActionTypes";

let fetchAccount = () => {
    return{
        type : getAccounts
    }
}

let copyAddress = () => {
    return{
        type: getAddress

    }
}

let savePersonalInfo = (personalInfo) => {
    return{
        type: savePersonalInformation,
        payload: personalInfo
    }
}

export {fetchAccount, copyAddress, savePersonalInfo}