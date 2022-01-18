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


import React from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableHighlight } from 'react-native';
import { ListItem, CheckBox } from 'react-native-elements';
import { colors } from '../colorFile';
import { ScrollView } from 'react-native-gesture-handler';
import ShowQrCode from 'react-native-qrcode-svg';
import * as Urls from '../baseUrl.json'

function ClaimDetailScreen({ route }) {
    const claim = route.params.claim;

    loadInBrowser = () => {
        Linking.openURL("http://" + Urls.baseUrl + "/qrCode").catch(err => console.error("Couldn't load page", err));
    };

    return (
        <View style={{ display: 'flex', flex: 1, }}>
            <View style={{ backgroundColor: colors.purple, width: '100%', height: 170 }}>
            </View>
            <View style={{ position: 'absolute', backgroundColor: colors.transparent, width: '100%', height: '100%', display: 'flex', }}>
                <View style={{ marginBottom: 14, paddingHorizontal: 16 }}>
                    <Text style={{ fontSize: 34, fontWeight: 'bold', color: colors.grey, }}>Claim Details</Text>
                </View>
                <ScrollView style={[styles.shadow, { flex: 1, paddingHorizontal: 16, }]} showsVerticalScrollIndicator={false}>
                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20, paddingHorizontal: 13, zIndex: 2 }}>
                        <View style={[styles.shadow, { height: 83, width: 83, borderRadius: 41.5, overflow: 'hidden' }]}>
                            <Image source={require('../logos/bmw.jpeg')} style={{ height: 83, width: 83, }} />
                        </View>
                        <View style={{ alignSelf: 'center', top: -5, }}>
                            <Text style={{ paddingLeft: 10, fontSize: 25, fontWeight: 'bold', color: colors.white, lineHeight: 26, }}>{claim.claimName}</Text>
                        </View>
                    </View>
                    <View style={{ top: -18 }}>
                        <View style={{
                            width: '100%', backgroundColor: colors.white, paddingLeft: 45, paddingTop: 50, paddingBottom: 30
                            , justifyContent: 'center', alignContent: 'center', borderTopLeftRadius: 10, borderTopRightRadius: 10
                        }}>
                            <Text style={{ backgroundColor: colors.white, marginLeft: 18, marginBottom: 20, fontSize: 15 }}>Scan Claim to view Information</Text>
                            <View style={{ backgroundColor: colors.white, height: 250, width: 250, }} >
                                <ShowQrCode value={JSON.stringify(claim)} size={250} />
                            </View>

                        </View>

                        <View style={{ ...styles.claimDetails }}>
                            <View style={{ display: 'flex', flexDirection: 'row', }}>
                                <Text style={styles.credentialText}>Issued By : </Text>
                                <Text style={styles.claimInformation}>{claim.issuerName}</Text>
                            </View>
                            {
                                Object.entries(JSON.parse(claim.data)).map(item =>
                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                                        <Text style={styles.credentialText}>{item[0]} :</Text>
                                        <Text style={styles.claimInformation}>{item[1]}</Text>
                                    </View>
                                )
                            }
                            <Text style={{ fontSize: 17, color: colors.white, marginTop: 20, marginBottom: 20 }}>CLAIM ID: {claim.claimId}</Text>
                            <TouchableHighlight onPress={loadInBrowser}>
                                <Text style={{ fontSize: 12, color: colors.link }}>Go to website for more detail</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    credentials: {
        marginTop: 6,
        paddingHorizontal: 12,
        marginBottom: 10
    },
    credentialText: {
        color: colors.white,
        fontSize: 14,
        width: "30%",
    },
    claimInformation: {
        color: colors.link,
        fontSize: 16,
        flex: 1
    },
    claimDetails: {
        width: '100%',
        padding: 16,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: colors.grey
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
    }
});

export default ClaimDetailScreen;