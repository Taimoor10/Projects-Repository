import { addPersonalInformation } from '../../schema.js';
import { getAccounts, getAddress,savePersonalInformation } from "./accountActionTypes";
import { batch } from 'react-redux';
let temp;

const initialState = {
    accounts:  temp,
}

const accountReducer = (state = initialState, data) => {
    
    if(data.type == getAccounts)
    {
        return initialState;
    }
    else if(data.type == getAddress)
    {
        return initialState
    }
    else if(data.type == savePersonalInformation)
    {
        let{name,email,country,phoneNo} = data.payload
        addPersonalInformation(name, email, country, phoneNo)
    }
    else
    {
        return state;
    }
}
export default accountReducer;

