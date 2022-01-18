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

import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native'

import * as secureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication'
import StartUpPage from '../UI/StartUpPage';
import DrawerNavigator from './Menu';
import Menu from './Menu';
import { colors } from 'react-native-elements';

const LoaderBuild = createStackNavigator();

class Loader extends React.Component {

    render() {
        return (
            <NavigationContainer>
                <LoaderBuild.Navigator initialRouteName="login">

                    <LoaderBuild.Screen name="adAppt"
                        component={StartUpPage}
                        options={{
                            title: "adAppt",
                            headerShown: false,

                        }} />
                    <LoaderBuild.Screen name='drawerNavigator'
                        component={Menu}
                        options={{
                            headerShown: false,
                        }} />
                </LoaderBuild.Navigator>
            </NavigationContainer>
        )
    }
}

const LoaderStyle = StyleSheet.create({
    Menu: {
        backgroundColor: 'transparent'
    },
    StartUpPage: {
        backgroundColor: colors.grey,
        marginTop: 0,
        marginBottom: 0
    },credentials: {
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
    }
});

export default Loader