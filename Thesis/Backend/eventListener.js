/*
This file provides the code for implementation of an event Listener in the network

The event listener is implmeneted with the help of an existing project
Details:
author: "vbilici",
title: "web3-subscribe-example",
URL: "https://github.com/vbilici/web3-subscribe-example/blob/master/src/events.js",
License: "GPL-3.0 License"
*/

let fs = require('fs')
const web3 = require('./config/web3Socket')

//Search for field name event in Contract's Json Interface and match the respective event
exports.subscribeEvent = (contract, eventName) => {
    eventName.forEach(event => {
       const eventInterface = web3.utils._.find(contract._jsonInterface, e => e.name === event && e.type ==='event')
        
            if(eventInterface==undefined)
            {
                return
            }

            const subsription = web3.eth.subscribe('logs', {
            address : contract.options.address,
            topics: [eventInterface.signature]
            },(error,result) => {
                if(error) {
                    console.log('Error')
                }
            
            if(result==undefined)
            {
                return
            }
            const eventObject = web3.eth.abi.decodeLog(
                eventInterface.inputs,
                result.data,
                result.topics.slice(1))
                exports.claim = eventObject
                exports.eventName = event
                console.log(event+":",eventObject)
            })
        })
}




