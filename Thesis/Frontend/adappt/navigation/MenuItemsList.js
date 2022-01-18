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
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../colorFile';
import { Button, Image } from 'react-native-elements';
import{StyleSheet} from 'react-native';
import AllClaimsPage from '../UI/claimsPage';

import ClaimDetail from '../UI/claimDetailsPage';
import ScanScreen from '../UI/scanQRScreen';
import CreateAccount from '../UI/createAccount';
import AccountInformation from '../UI/accountInformation';

const MenuItems = createStackNavigator();

export default function MenuItemList({ navigation }) {
    return (
        <MenuItems.Navigator initialRouteName='Claims'>
            <MenuItems.Screen name='Claims'
                component={AllClaimsPage}
                options={{
                    title: null,
                    headerLeft: () => <OpenTabs navigation={navigation} />,
                    headerStyle: {
                        backgroundColor: colors.purple,
                        shadowOpacity: 0,
                        elevation: 0,
                    }
                }}
            />
            <MenuItems.Screen name='claimDetail'
                component={ClaimDetail}
                options={{
                    title: null,
                    headerBackTitle: ' ',
                    headerTintColor: colors.grey,
                    headerStyle: {
                        backgroundColor: colors.purple,
                        shadowOpacity: 0,
                        elevation: 0,
                    }
                }} />
            <MenuItems.Screen name='scanQRCode'
                component={ScanScreen}
                options={{
                    title: null,
                    headerBackTitle: ' ',
                    headerTintColor: colors.grey,
                    headerStyle: {
                        backgroundColor: colors.purple,
                        shadowOpacity: 0,
                        elevation: 0,
                    }
                }} />
            <MenuItems.Screen name='createAccount'
                component={CreateAccount}
                options={{
                    title: null,
                    headerBackTitle: ' ',
                    headerTintColor: colors.grey,
                    headerStyle: {
                        backgroundColor: colors.purple,
                        shadowOpacity: 0,
                        elevation: 0,
                    }
                }} />
            <MenuItems.Screen name='accountInformation'
                component={AccountInformation}
                options={{
                    title: null,
                    headerBackTitle: ' ',
                    headerTintColor: colors.grey,
                    headerStyle: {
                        backgroundColor: colors.purple,
                        shadowOpacity: 0,
                        elevation: 0,
                    }
                }} />
        </MenuItems.Navigator>
    );
}

function OpenTabs({ navigation }) {
    return (
        <Button icon={<Image source={require('../logos/menu.png')}
            style={styles.tabBtn}
            placeholderStyle={styles.tabBtnHolder} />}
            buttonStyle={styles.tabBtnStyle}
            onPress={() => navigation.openDrawer()}
            onLongPress={() => navigation.openDrawer()}
        />
    )
}

const styles = StyleSheet.create({
    page: {
        display: 'flex',
        flex: 1
    },
    tabBtn:
    {
        width: 30, 
        height: 22
    },
    tabBtnHolder:
    {
        backgroundColor: 'transparent'
    },
    tabBtnStyle:
    {
        backgroundColor: 'transparent', 
        marginLeft: 10, 
        padding: 10 
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
