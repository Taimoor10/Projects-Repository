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
import { createDrawerNavigator, DrawerItem, DrawerItemList, } from '@react-navigation/drawer';
import MenuItemsList from './MenuItemsList';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { colors } from '../colorFile';
import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'react-native-elements';

let SideMenuShow = createDrawerNavigator();

export default class SideMenu extends React.Component {

    // Mounted = false
    // componentWillUnmount()
    // {
    //     this.Mounted=true
    // }

    // componentWillUnmount()
    // {
    //     this.setState  = (state,callback)=>{
    //         return;
    //     };
    // }

    render() {
        return (
            <SideMenuShow.Navigator initialRouteName='MenuItems'
                drawerContent={props => MenuTabs(props)}

                drawerContentOptions={{
                    labelStyle: {
                        color: colors.grey,
                        fontSize: 20,
                        fontWeight: '500'
                    }
                }}
            >
                <SideMenuShow.Screen name="MenuItems"
                    options={{
                        title: 'Home',
                        drawerIcon: () => <Entypo name="home" size={19} color={colors.black} />,
                    }}
                    component={MenuItemsList} />
            </SideMenuShow.Navigator>
        )
    }
}

function MenuTabs(props) {
    return (
        <View {...props}>
            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: colors.purple, height: 286, paddingTop: 50, }}>
                <Image source={require('../logos/ethereum.png')} style={styles.ethereumLogo} />
                <Text style={{ color: colors.grey, fontSize: 30 }}>dApp</Text>
            </View>
            <View style={{ paddingLeft: 20, paddingTop: 30, }}>
                <DrawerItemList {...props} />
                <DrawerItem
                    label="Account"
                    labelStyle={{
                        fontSize: 20,
                        color: colors.grey,
                        fontWeight: '300'
                    }}
                    icon={() => <Entypo name="info" size={19} color={colors.black} />}
                    onPress={() => props.navigation.navigate('accountInformation')}
                />
                <DrawerItem
                    label="Scan QR Code"
                    labelStyle={{
                        fontSize: 20,
                        color: colors.grey,
                        fontWeight: '300'
                    }}
                    icon={() => <Ionicons name="md-barcode" size={19} color={colors.black} />}
                    activeTintColor={colors.black}
                    onPress={() => props.navigation.navigate('scanQRCode')}
                />
                <DrawerItem
                    label="Setting"
                    labelStyle={{
                        fontSize: 20,
                        color: colors.grey,
                        fontWeight: '300'
                    }}
                    icon={() => <Ionicons name="md-settings" size={19} color={colors.black} />}
                    onPress={() => props.navigation.toggleDrawer()}
                />
                <DrawerItem
                    label="Create Account"
                    labelStyle={{
                        fontSize: 20,
                        color: colors.grey,
                        fontWeight: '300'
                    }}
                    icon={() => <Ionicons name="md-card" size={19} color={colors.black} />}
                    onPress={() => props.navigation.navigate('createAccount')}
                />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    page: {
        display: 'flex',
        flex: 1
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
    ethereumLogo: {
        height: 120, 
        width: 120,
    }
});