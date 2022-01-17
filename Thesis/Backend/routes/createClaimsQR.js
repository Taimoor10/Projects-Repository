/*
This file provides a untlity to generate and save QR codes created from claim's information
*/

const QRcode = require('qrcode')
const fs = require('fs')
const web3 = require('../config/web3')
const event = require('../eventListener')

/*
Uses Claim data to produce a QR code
Generates QR code from claim data to present on portal
*/

exports.generatesQRcode = async(params) => {

    console.log("Event Name:",event.eventName)

    if(params.type=="ClaimAdded")
    {
        let serverPubKey = "0x010fbbbcb59e705bc23019273da5bfe7d3888c8300ab229017c8566753183a0d"

        let claimData = {
            type : "claimsQR",
            claimName : params.claimName,
            claimId : params.claimId,
            data : params.data,
            issuerName : params.issuerName,
            pubKey: serverPubKey
        }

        try{
            QRcode.toFile('./public/images/claims/'+params.claimName+'.png', [{data: web3.utils.hexToBytes(web3.utils.toHex(claimData)), mode:'byte'}],
                    {type: 'png', errorCorrectionLevel: 'L'}, 
                    function(err){
                        if(err)
                        {
                            console.log(err)
                        }
                    })

            fs.writeFile('./Claims/'+params.claimName+'', 
            JSON.stringify({
                issuerName : params.issuerName,
                claimId : params.claimId,
                claimName : params.claimName,
                data : params.data 
            }), function (err) {
            if(err)
                {
                    console.log(err)
                }  
            })
        }catch(err)
        {
            console.log(err)
        }
    }
    
    else if(params.type=="PreReqAdded")
    {
        console.log("ClaimId:",params.claimId)
        try{
            fs.writeFile('./Claims/'+params.claimName+'', 
                JSON.stringify({
                    issuerName : params.issuerName,
                    claimId : params.claimId,
                    claimName : params.claimName,
                    data : params.data,
                    preReqs: params.preReqs
                }), function (err) {
                if(err)
                    {
                        console.log(err)
                    }  
            })
        }catch(exception)
        {
            throw exception
        }
    }
}