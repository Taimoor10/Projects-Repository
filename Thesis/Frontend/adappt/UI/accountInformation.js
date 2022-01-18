/*
This file provides the functionality to show editable personal iformation and storing it in SQLite database
*/

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Button, Image, Input, Icon } from 'react-native-elements';
import { Entypo, Ionicons, FontAwesome } from '@expo/vector-icons';
import { colors } from '../colorFile';
import { connect } from "react-redux";
import { db } from "../schema.js";

function accountInformation({ navigation, accounts, savePersonalInfo }) {

    const [account, setAccount] = useState();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [country, setCountry] = useState();
    const [phoneNo, setPhoneNo] = useState();

    let accountInfo = {
        name: name,
        email: email,
        country: country,
        phoneNo: phoneNo,
    }

    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql("select * from personal_info",
                [],
                (_, { rows }) => {
                    let personalData = rows._array[0]
                    setName(personalData.name)
                    setEmail(personalData.email)
                    setCountry(personalData.country)
                    setPhoneNo(personalData.phone.toString())
                },
                () => console.log("Error while fetching Account Information"))

            tx.executeSql("select * from account_info",
                [],
                (_, { rows }) => {
                    setAccount(rows._array)
                },
                () => console.log("Error while fetching Account Information"))
        })
    }, []);

    const savePersonalinfo = () => {

        db.transaction(tx => {
            tx.executeSql("drop table personal_info",
                []
            );

            tx.executeSql("create table if not exists personal_info(id integer primary key not null, name varchar, email varchar, country varchar, phone integer);",
                []
            );

            tx.executeSql("insert into personal_info(name, email, country, phone) values(?,?,?,?)",
                [name, email, country, phoneNo]
            );
        })

        navigation.navigate("Claims")
    }

    return (
        <KeyboardAvoidingView style={{ ...styles.container }}>
            <View style={{ ...styles.formItem }}>

                <Text style={{ ...styles.credentials }}>
                    Click on the field to Edit Personal Information
                    </Text>

                <Text style={{ fontWeight: "bold", marginTop: 20 }}>Name : </Text>
                <TextInput style={{ ...styles.textInputStyle }}
                    placeholder="Enter name"
                    value={name}
                    onChangeText={value => setName(value)} />
                <View style={{ borderBottomColor: 'black', borderBottomWidth: 0.5, }} />
            </View>
            <View style={{ ...styles.formItem }}>
                <Text style={{ fontWeight: "bold" }}>Email : </Text>
                <TextInput style={{ ...styles.textInputStyle }}
                    placeholder="Enter email"
                    value={email}
                    onChangeText={value => setEmail(value)} />
                <View style={{ borderBottomColor: 'black', borderBottomWidth: 0.5, }} />
            </View>
            <View style={{ ...styles.formItem }}>
                <Text style={{ fontWeight: "bold" }}>Country : </Text>
                <TextInput style={{ ...styles.textInputStyle }}
                    placeholder="Enter country"
                    value={country}
                    onChangeText={value => setCountry(value)} />
                <View style={{ borderBottomColor: 'black', borderBottomWidth: 0.5, }} />
            </View>
            <View style={{ ...styles.formItem }}>
                <Text style={{ fontWeight: "bold" }}>Phone: </Text>
                <TextInput style={{ ...styles.textInputStyle }}
                    placeholder="Enter Phone No."
                    value={phoneNo}
                    onChangeText={value => setPhoneNo(value)} />
                <View style={{ borderBottomColor: 'black', borderBottomWidth: 0.5, }} />
            </View>
            <View>
                <Button title="Save"
                    buttonStyle={{
                        backgroundColor: colors.grey,
                        width: "100%",
                        borderRadius: 10,
                        marginTop: -5,
                        marginBottom: 30,
                        marginLeft: 0
                    }}
                    onPress={savePersonalinfo} />
            </View>
            <View style={{ ...styles.ethereumContainer }}>
                <Text>Ethereum Identity : </Text>
                {account != undefined &&
                    account.length > 0 &&
                    <Text style={{ ...styles.ethereumKey }}>
                        {account[0].address}
                    </Text>
                }
                <Button
                    buttonStyle={{
                        backgroundColor: colors.grey,
                        borderRadius: 10,
                    }}
                    icon={
                        <FontAwesome name="copy" size={20} color={colors.white} style={{ marginRight: 10 }} />
                    }
                    title="Copy"
                    onPress={() => { return }}
                />
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 1,
        margin: 27,
        color: colors.purple
    },
    formItem: {
        marginBottom: 20,
        color: colors.grey
    },
    textInputStyle: {
        fontSize: 18,
        marginTop: 10,
        fontWeight: "300"
    },
    credentials: {
        color: colors.grey,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: -30,
        fontSize: 12,
        fontWeight: '700'
    },
    ethereumContainer: {
        backgroundColor: colors.purple,
        marginTop: 20,
        padding: 20,
        borderRadius: 10,
        borderColor: colors.transparent,
        alignSelf: 'auto',
        textAlign: "center",
        alignItems: "center"
    },
    ethereumKey: {
        marginTop: 10,
        marginBottom: 20,
        color: colors.grey,
        fontSize: 18,
    },
    logoView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

const mapStateToProps = (state) => {
    return {
        accounts: state.account,
    }
}

// const mapActionToProps = (dispatch) => {
//     return{
//         savePersonalInfo : (accountInfo) => dispatch(savePersonalInfo(accountInfo))
//     }
// }

export default connect(mapStateToProps, null)(accountInformation);