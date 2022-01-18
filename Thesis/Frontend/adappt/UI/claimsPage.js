/*
The code implemented in the file is inspired by a project under MIT license and implemented according to the
requirements of the developed application.
The project is used as a research and study to implement a user interface for the application. Moreover, several
elements were also used and utilised for designing a user interface

Details:
author: "KhimGurung",
title: "rn-onlineticket",
URL: "https://github.com/KhimGurung/rn-onlineticket",
License: "MIT"
*/


import React, { useState, useEffect } from 'react';
import { claimsSwitch, setClaimsSwitch, fillQrCodeData } from '../redux';
import { connect } from 'react-redux';
import * as secureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication'
import { Dimensions, View, Text, StyleSheet, Animated, FlatList } from 'react-native';
import { Button, } from 'react-native-elements';
import { colors } from '../colorFile';

import ClaimListItem from "../claimComponent/ClaimListItem";
import { retreiveClaims, deleteClaims } from "../schema.js";
import { useIsFocused } from "@react-navigation/native";
import { showQrCode } from '../redux/claims/clalimListType';

let { height, } = Dimensions.get('window');

function AllClaimsPage(props) {

    let [sliderValueHorizontal] = useState(new Animated.Value(20));
    let [sliderValueStretch] = useState(new Animated.Value(80));
    let [claims, setClaims] = useState([]);
    let isFocused = useIsFocused();

    moveTabLeft = () => {
        props.changeClaim(claimsSwitch.validTab);
        Animated.parallel([
            Animated.timing(sliderValueStretch, {
                toValue: 70,
                duration: 300,
            }).start(),
            Animated.timing(sliderValueHorizontal, {
                toValue: 16,
                duration: 300,
            }).start()
        ]);
    }
    moveTabRight = () => {
        props.changeClaim(claimsSwitch.expiredTab);
        Animated.parallel([
            Animated.timing(sliderValueStretch, {
                toValue: 90,
                duration: 300,
            }).start(),
            Animated.timing(sliderValueHorizontal, {
                toValue: 107,
                duration: 300,
            }).start()
        ]);
    }

    const getClaims = () => {
        retreiveClaims().then(value => {
            setClaims(value);
        })
    }

    useEffect(() => {
        getClaims()
    }, [isFocused]);

    resetCredentials = () => {
        const userAuthentication = LocalAuthentication.authenticateAsync({ promptMessage: "Touch to delete credentials", cancelLabel: "Cancel", fallbackLabel: "Use Pin" })
        userAuthentication.then((onTouch) => {
            if (onTouch.success == true) {
                deleteClaims()
                getClaims()
            }
            else if (onTouch.error == "user_cancel") {
                console.log("Authentication Canceled")
            }
        })
    }


    try {
        return (
            <View style={{ display: 'flex', flex: 1 }}>
                <View style={tabStyles.pageLayout}></View>
                <View style={tabStyles.topBar}>
                    <View style={tabStyles.credentials}>
                        <Text style={{ color: colors.grey, alignSelf: 'center', fontSize: 30, fontWeight: '500' }}>
                            Credentials
                    </Text>
                    </View>
                    <View style={tabStyles.validTab}>
                        <Button title="Valid"
                            buttonStyle={{ justifyContent: 'flex-start', alignSelf: 'flex-start', alignItems: 'flex-start', backgroundColor: colors.transparent, width: 90 }}
                            titleStyle={{ fontSize: 20, fontWeight: '500', color: colors.grey, }}
                            onPress={moveTabLeft}
                            onLongPress={moveTabLeft}
                        />
                        <Button title="Expired"
                            buttonStyle={{ justifyContent: 'flex-start', alignSelf: 'flex-start', alignItems: 'flex-start', backgroundColor: colors.transparent, width: 90 }}
                            titleStyle={{ fontSize: 20, fontWeight: '500', color: colors.grey }}
                            onPress={moveTabRight}
                            onLongPress={moveTabRight}
                        />
                    </View>

                    <View style={tabStyles.barSwitch}>
                        <Animated.View style={tabStyles.barView, {
                            position: 'absolute', height: 4, backgroundColor: colors.white,
                            width: sliderValueStretch, left: sliderValueHorizontal
                        }} />
                    </View>

                    <View style={{ flex: 1, }}>
                        <FlatList scrollEnabled
                            showsVerticalScrollIndicator={true}
                            data={claims}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => <ClaimListItem claim={item} />} />
                        <Button onPress={resetCredentials} title="Reset"
                            buttonStyle={{ backgroundColor: colors.purple }} />
                    </View>
                </View>
            </View>
        );
    }
    catch (exception) {
        return
    }
}

const tabStyles = StyleSheet.create({
    loginBtn: {
        backgroundColor: colors.grey,
        marginTop: 20,
        height: 45,
        borderRadius: 10
    },
    credentials: {
        marginTop: 6,
        paddingHorizontal: 12,
        marginBottom: 10
    },
    pageLayout: {
        backgroundColor: colors.purple,
        width: '100%',
        height: 100,
        position: 'absolute',
        paddingBottom: 0,
        paddingTop: 8,
        paddingLeft: 8,
        marginTop: 0
    },
    topBar: {
        position: 'absolute',
        backgroundColor: colors.transparent,
        width: '100%',
        height: '100%',
        paddingLeft: 0,
        paddingRight: 0
    },
    barSwitch: {
        height: 4,
        width: '52.3%',
        backgroundColor: colors.grey,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 5,
        marginTop: 0
    },
    barView: {
        position: 'absolute',
        marginRight: 20,
        backgroundColor: colors.white,
        height: 3,

    },
    validTab: {
        display: 'flex',
        paddingLeft: 20,
        flexDirection: 'row'
    },
    qrCodeView: {
        position: 'absolute',
        backgroundColor: 'white',
        width: '90%',
        height: '50%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        top: height * 0.25,
        borderRadius: 13,
    }
});

let switchClaims = (claims) => {

    if (claimsSwitch.validTab) {
        return claims.filter(credential => credential.valid == true);
    }
    else if (claimsSwitch.expiredTab) {
        return claims.filter(credential => credential.valid == false);
    }
    else {
        throw Error
    }

}

let mapClaims = state => {
    return {
        
        claims: switchClaims(state.claim.claims, state.claimSwitches.filter)
        
    }
}

let dispatchClaims = dispatch => {
    return {
        changeClaim: claim => dispatch(setClaimsSwitch(claim)),
        openQRCodeModal: data => dispatch(fillQrCodeData(data)),
    }
}

export default connect(mapClaims, dispatchClaims)(AllClaimsPage);