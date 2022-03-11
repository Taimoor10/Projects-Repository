/*
This file provides the functionality of creation of an Ethereum account after providing a unique username
*/

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../colorFile';
import nacl from 'tweet-nacl-react-native-expo';
import axios from 'axios';
import * as secureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication'
import { addTicket } from '../redux';
import { connect } from 'react-redux';
import { addAccountInformation } from '../schema.js'
import { deleteAccountInformation } from '../schema.js'
import * as Urls from '../baseUrl.json'


import { useNavigation } from '@react-navigation/native';

let serverPubKey = Uint8Array.from([
    1, 15, 187, 188, 181, 158, 112, 91,
    194, 48, 25, 39, 61, 165, 191, 231,
    211, 136, 140, 131, 0, 171, 34, 144,
    23, 200, 86, 103, 83, 24, 58, 13
])

let axiosObj = axios.create({
    
    baseURL : 'http://' + Urls.baseUrl
});

function CreateAccount({ addTicket }) {
    const [username, setEmail] = useState('');

    const navigation = useNavigation();

    //Decrypt the Recieved Account information from Server
    decryptMessage = async (message, nonce, publicKey, privateKey) => {
        message = Object.values(message)
        nonce = Object.values(nonce)
        let decryptedAccount = nacl.box.open(Uint8Array.from(message), Uint8Array.from(nonce), publicKey, privateKey)
        decryptedAccount = JSON.parse(nacl.util.encodeUTF8(decryptedAccount))
        return decryptedAccount
    }

    //Alert Message
    generateAlert = async (title, message) => {
        try {
            Alert.alert(
                title,
                message
            )
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK"
                }
            ],
                { cancelable: "false" }

        }
        catch (err) {
            return
        }
    }

    longPress = async () => {
        console.log("Sign Up Pressed too long")
    }

    _createAccount = async () => {
        if (username == undefined || username == null || username == "") {
            await generateAlert("Username", "Username cannot be empty")
            return
        }
        const userAuthentication = LocalAuthentication.authenticateAsync({ promptMessage: "Touch", cancelLabel: "Cancel", fallbackLabel: "Use Pin" })

        Promise.resolve(userAuthentication).then((onTouch) => {
            if (onTouch.success == true) {
                let nonce = nacl.randomBytes(24)
                Promise.resolve(nonce).then((nonceValue) => {

                    let keyPair = nacl.box.keyPair(username);
                    let userName = nacl.util.decodeUTF8(username)
                    Promise.resolve(keyPair).then((value) => {
                        const encryptedMessage = nacl.box(Uint8Array.from(userName), nonceValue,
                            serverPubKey, value.secretKey);

                        let publicKey = nacl.box.keyPair.fromSecretKey(Uint8Array.from(value.secretKey))
                        publicKey = publicKey.publicKey
                        
                        axiosObj.post('/user/createAccount', {
                            nonceValue: nonceValue,
                            encryptedMessage: encryptedMessage,
                            publicKey: publicKey
                        }, { timeout: 50000 }).then(async function (response) {
                            let decryptedAccount = await decryptMessage(response.data.encryptedAccount, response.data.nonce, serverPubKey, value.secretKey)


                            deleteAccountInformation()
                            addAccountInformation(username, decryptedAccount.address, decryptedAccount.publicKey)

                            secureStore.setItemAsync("1234", JSON.stringify(decryptedAccount))

                            navigation.navigate("Claims")

                        }).catch(async function (error) {
                            console.log(error)
                            if (!error.response) {
                                await generateAlert("Create Account", "Cannot connect to the server at the moment")
                                return
                            }
                            if (error.response.status == 500) {
                                await generateAlert("Create Account", "Account already registered with the provided username")
                            }
                        });
                    })
                })
            }
            else if (onTouch.error == "user_cancel") {
                console.log("Authentication Canceled")
            }
        })
    }

    return (
        <View style={styles.page}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ ...styles.createAccount }}>Create Account</Text>
            </View>
            <KeyboardAvoidingView style={{ flex: 1.2 }} behavior='padding'>
                <Input placeholder='Username'
                    placeholderTextColor={colors.black}
                    inputContainerStyle={{ borderBottomColor: colors.black }}
                    leftIconContainerStyle={{ marginLeft: 0, marginRight: 10, }}
                    inputStyle={{ color: colors.black }}
                    onChangeText={value => setEmail(value)}
                    value={username}
                    leftIcon={<FontAwesome name="envelope" size={18} color={colors.black} />}
                />
                <Button title='Sign Up'
                    titleStyle={{ fontSize: 17, }}
                    buttonStyle={styles.loginBtn}
                    onPress={_createAccount}
                    onLongPress={longPress}
                />
                <Text style={{ marginTop: 10, alignSelf: 'center', alignSelf: 'center', fontSize: 15 }}>Sign up to create an Ethereum Identity</Text>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        display: 'flex',
        flex: 1,
        padding: 34,
        backgroundColor: colors.purple,
    },
    credentials: {
        marginTop: 5,
        paddingHorizontal: 12,
        marginBottom: 10
    },
    pageLayout: {
        backgroundColor: colors.purple,
        width: '100%',
        height: 100,
        position: 'absolute',
        paddingBottom: 0,
        paddingTop: 10,
        paddingLeft: 10,
        marginTop: 0
    },
    formControl: {
        paddingVertical: 30,
    },
    loginBtn: {
        backgroundColor: colors.grey,
        marginTop: 20,
        height: 45,
        borderRadius: 10
    },
    password: {
        marginVertical: 12,
        marginHorizontal: 10,
        alignSelf: 'flex-end',
        color: colors.grey,
        paddingLeft: 10
    },
    loginText: {
        alignSelf: 'center',
        color: colors.black,
        marginTop: 20
    },
    createAccount: {
        color: colors.black,
        fontSize: 26,
        fontWeight: 'bold'
    }

});


const mapDisptachToProps = dispatch => {
    return {
        addTicket: ticket => dispatch(addTicket(ticket)),
    }
}

export default connect(null, mapDisptachToProps)(CreateAccount);
