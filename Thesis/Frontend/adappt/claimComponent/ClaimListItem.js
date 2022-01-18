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
import { View, Text, StyleSheet, TouchableHighlight, Image } from "react-native";
import { colors } from '../colorFile';
import { useNavigation } from '@react-navigation/native';

const ClaimListItem = (props) => {

    const claim = props.claim;
    const navigation = useNavigation();

    return (
        <View style={{ ...styles.shadow, ...styles.claimView }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", }}>
                <TouchableHighlight >
                    <View>
                        <Image source={require('../logos/ethereum.png')} style={styles.ethereumLogo} />
                    </View>
                </TouchableHighlight>
            </View>
            <TouchableHighlight
                onPress={() => navigation.navigate('claimDetail', { backgroundColor: colors.purple, claim: claim, })}
                onLongPress={() => navigation.navigate('claimDetail', { backgroundColor: colors.purple, claim: claim, })}
                style={{ padding: 12, flex: 2.5, backgroundColor: colors.purple, }} >
                <Text style={{ ...styles.claimName }}>{claim.claimName}</Text>
            </TouchableHighlight>
        </View>
    );
};

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
    claimView: {
        margin: 16,
        backgroundColor: colors.white,
        flexDirection: "row",
        height: 100,
        borderRadius: 10,
        overflow: "hidden",
    },
    claimName: {
        color: colors.grey,
        fontSize: 25,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 20,
        fontWeight: "bold"
    },
    ethereumLogo: {
        height: 90, 
        width: 90,
    }
})

export default ClaimListItem;