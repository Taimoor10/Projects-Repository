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
import { Button, Image } from 'react-native-elements'
import { View, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';
import * as secureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication'
import { colors } from '../colorFile';


function StartUpPage({ navigation }) {

    return (
        <View style={styles.page}>
            <View style={{marginTop: 80, flex: 1, justifyContent: 'center', alignItems: 'center',}}>
                <Image source={require('../logos/ethereum.png')}
                    style={styles.imageAdjust}
                    placeholderStyle={{ backgroundColor: 'transparent' }}
                />
                <Text style={{ marginTop: 30, alignSelf: 'center', color: colors.grey, fontSize: 25 }}>Decentralized Application</Text>
            </View>
            <KeyboardAvoidingView style={{ marginTop: 30, flex: 1.2 }} behavior='padding'>
                <Button title='Enter'
                    buttonStyle={styles.enterButton}
                    titleStyle={styles.enterButtonText}
                    onPress={() => navigation.navigate('drawerNavigator')} />

                <Text style={{ color: colors.grey, fontSize: 15, justifyContent: 'flex-start' }}>Don't have an Ethereum Identity? Enter and Create account
                </Text>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    imageAdjust: {
        width: 200,
        height: 200
    },
    enterButton: {
        backgroundColor: colors.grey,
        marginTop: 40,
        marginBottom: 10,
        borderRadius: 11,
        width: 300
    },
    enterButtonText: {
        fontSize: 20
    },
    page: {
        display: 'flex',
        marginTop: 0,
        marginBottom: 0,
        padding: 34,
        flex: 1,
        backgroundColor: colors.purple,
    }
});

export default StartUpPage;
