/*
This file provides the database schema to store and retrieve personal, account and Credential information
*/

import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabase("adAppt")

exports.addPersonalInformation = (name,email,country,phone) => {
    db.transaction(tx => {
        tx.executeSql("create table if not exists personal_info(id integer primary key not null, name varchar, email varchar, country varchar, phone integer);",
        []
      );

      tx.executeSql("insert into personal_info(name, email, country, phone) values(?,?,?,?)",
      [name, email, country, phone])
    })
}

exports.retreivePersonalInformation = async() => {

    let response =  await new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql("select * from personal_info",
            [],
            (_,{rows}) => {
                //setPersonalInformation(rows._array)
                resolve(rows._array)
            },
            () => console.log("Error while fetching Account Information"))
        })

    })

    return response.pop()
} 

exports.addAccountInformation = (email, address, publicKey)=> {
    db.transaction(tx => {
        tx.executeSql("create table if not exists account_info(id integer primary key not null, email varchar, address varchar, publicKey varchar);",
        []
      );
        tx.executeSql("insert into account_info(email, address, publicKey) values(?,?,?)",
        [email, address, publicKey])
    })
}

exports.retreiveAccountInformation = async () => {
    let response =  await new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql("select * from account_info",
            [],
            (_,{rows}) => {
                resolve(rows._array)
            },
            () => console.log("Error while fetching Account Information"))
        })
    })

    return response.pop();
}

exports.retreiveEthereumAddress = async () => {
    let response =  await new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql("select address from account_info",
            [],
            (_,{rows}) => {
                resolve(rows._array)
            },
            () => console.log("Error while fetching Account Information"))
        })

    })

    return response.pop();
}

exports.deleteAccountInformation = () => {
    db.transaction(tx => {
        tx.executeSql("drop table account_info;",
        []
        );
    })
}

exports.addIssuedClaims = (claimId, claimName, data, issuer, uri, issuerName) => {
    db.transaction(tx => {
        tx.executeSql("create table if not exists issuedClaims(id integer primary key not null, claimId varchar, claimName varchar, data varchar, issuer varchar, uri varchar, issuerName varchar);",
        []
      );

      tx.executeSql("insert into issuedClaims(claimId, claimName, data, issuer, uri, issuerName) values(?,?,?,?,?,?)",
      [claimId, claimName, data, issuer, uri, issuerName])
    })
}

exports.retreiveClaims = async() => {

    let response =  await new Promise((resolve, reject) => 
        db.transaction(tx => {
            tx.executeSql("select * from issuedClaims",
            [],
            (_,{rows}) => {
                resolve(rows._array)
            },
            () => console.log("Error while fetching Claim Data"))
        })
    )
    return response;
}

exports.retrieveCityClaim = async() => {

    let response =  await new Promise((resolve, reject) => {
        
        db.transaction(tx => {
            tx.executeSql("select * from issuedClaims where claimName='Claim City'",
            [],
            (_,{rows}) => {
                
                resolve(rows._array)
            },
            () => console.log("Error while fetching City Claim"))
        })
    })
    return response;
}

exports.deleteClaims = () => {
    db.transaction(tx => {
        tx.executeSql("delete from issuedClaims;",
        []
        );
    })
}

exports.checkClaimExistance = async(claimId) => {
    let response =  await new Promise((resolve, reject) => 
        db.transaction(tx => {
            tx.executeSql("select * from issuedClaims where claimId='"+claimId+"'",
            [],
            (_,{rows}) => {
                resolve(rows._array)
            },
            () => console.log("Not Existing"))
        })
    )
    return response;
}