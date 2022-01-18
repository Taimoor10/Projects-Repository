/*
 This file provides the functionality to perform Login, fetch credentials and get Verifier claim using QR code scan
*/

import * as React from 'react'
import { Text, View, StyleSheet, Button, Alert, } from 'react-native';
import * as Permissions from 'expo-permissions'
import axios from 'axios';
import * as LocalAuthentication from 'expo-local-authentication'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { retreiveAccountInformation } from "../schema"
import { retreiveEthereumAddress } from "../schema"
import { addIssuedClaims } from "../schema"
import { retreivePersonalInformation } from "../schema"
import { retrieveCityClaim } from "../schema"
import { checkClaimExistance } from "../schema"
import { retreiveClaims } from "../schema"
import { deleteClaims } from "../schema"
import * as Urls from '../baseUrl.json'

const axiosObj = axios.create({
  //baseURL: 'http://172.21.5.27:3000'
  baseURL: "http://" + Urls.baseUrl
});

const verifierRoute = axios.create({
  //baseURL: 'http://localhost:3001'
  baseURL: "http://" + Urls.verifierUrl
})

export default class ScanScreen extends React.Component {

  state = {
    hasCameraPermission: null,
    scanned: false,
  };


  async componentDidMount() {
    this.getPermissionsAsync();
  }

  getPermissionsAsync = async () => {
    const {
      status
    } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted'
    });
  };

  render() {
    const {
      hasCameraPermission,
      scanned
    } = this.state;

    const { navigation } = this.props;

    handleBarCodeScanned = ({
      type,
      data
    }) => {
      this.setState({
        scanned: true
      });

      if (JSON.parse(data).type == 'claimsQR') {
        const userAuthentication = LocalAuthentication.authenticateAsync({ promptMessage: "Claim Request", cancelLabel: "Cancel", fallbackLabel: "Use Pin" })
        Promise.resolve(userAuthentication).then((onTouch) => {
          if (onTouch.success == true) {
            retreiveAccountInformation().then((value) => {
              retreiveEthereumAddress().then((EthereumId) => {
                console.log("Sent Username for Claim Scan:", value.email)
                if (JSON.parse(data).claimName == "Claim City") {
                  const cityClaimAuthentication = LocalAuthentication.authenticateAsync({
                    promptMessage: "Your Name, Email, Country and Phone will be shared for this claim",
                    cancelLabel: "Cancel", fallbackLabel: "Use Pin"
                  })
                  cityClaimAuthentication.then((onTrue) => {
                    if (onTrue.success == true) {
                      retreivePersonalInformation().then((result) => {
                        axiosObj.post('/identity/issueClaim', {
                          qr: data,
                          country: result.country,
                          email: result.email,
                          name: result.name,
                          phone: result.phone,
                          username: value.email,
                          claimer: EthereumId.address
                        }, { timeout: 2000 }).then(function (response) {
                          let claimData = {
                            claimId: response.data.claimId,
                            claimName: response.data.claimName,
                            issuer: response.data.issuer,
                            data: response.data.data,
                            uri: response.data.uri,
                            issuerName: response.data.issuerName
                          }
                          //console.log("Fetched City Claim Data:",claimData)

                          checkClaimExistance(claimData.claimId).then(claimExist => {
                            if (claimExist.length == 0) {
                              addIssuedClaims(claimData.claimId, claimData.claimName, claimData.data, claimData.issuer, claimData.uri, claimData.issuerName)
                              navigation.navigate("Claims");
                            }
                            else {
                              try {
                                Alert.alert("Claim Scan",
                                  "You already have this credential")
                                [{
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
                              catch (error) {
                                return
                              }
                              navigation.navigate("Claims")
                            }
                          })

                        })
                          .catch(function (error) {
                            if (error) {
                              Alert.alert("Claim Scan",
                                "Error while fetching claim. Do not leave your name, email, country and phone empty")
                              [{
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
                          });
                      })
                    }
                  })
                }
                else {
                  axiosObj.post('/identity/issueClaim', {
                    qr: data,
                    email: value.email,
                    claimer: EthereumId.address
                  }, { timeout: 3000 }).then(function (response) {
                    let claimData = {
                      claimId: response.data.claimId,
                      claimName: response.data.claimName,
                      issuer: response.data.issuer,
                      data: response.data.data,
                      uri: response.data.uri,
                      issuerName: response.data.issuerName
                    }
                    //console.log("Fetched Claim Dataaaa:",claimData)


                    checkClaimExistance(claimData.claimId).then(claimExist => {
                      if (claimExist.length == 0) {
                        addIssuedClaims(claimData.claimId, claimData.claimName, claimData.data, claimData.issuer, claimData.uri, claimData.issuerName)
                        navigation.navigate("Claims");
                      }
                      else {
                        try {
                          Alert.alert("Claim Scan",
                            "You already have this credential")
                          [{
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
                        catch (error) {
                          return
                        }
                        navigation.navigate("Claims")
                      }
                    })

                  })
                    .catch(function (error) {
                      console.log(error)
                      if (error) {
                        try {
                          Alert.alert("Claim Scan",
                            "Error while fetching claim. You might not have pre-reqs or claim is already issued")
                          [{
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
                        catch (error) {
                          return
                        }
                      }
                    });
                }
              })
            })
          }
        })
      }
      else if (JSON.parse(data).type == 'verifierQR') {
        const userAuthentication = LocalAuthentication.authenticateAsync({ promptMessage: "Your Claim City claim will be shared", cancelLabel: "Cancel", fallbackLabel: "Use Pin" })
        Promise.resolve(userAuthentication).then((onTouch) => {
          if (onTouch.success == true) {
            retrieveCityClaim().then((value) => {
              retreiveEthereumAddress().then((EthereumId) => {
                let cityClaim = value[0]
                if (cityClaim == undefined || cityClaim == null) {
                  try {
                    Alert.alert("Claim Scan",
                      "You do not have credential Claim City")
                    [{
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
                  catch (error) {
                    return
                  }
                  return
                }
                verifierRoute.post('/user/cityClaim', {
                  qr: data,
                  claimId: cityClaim.claimId,
                  issuer: cityClaim.issuer,
                  claimer: EthereumId.address
                }, { timeout: 2000 }).then(function (response) {
                  response = JSON.parse(response.data)

                  let claimData = {
                    claimId: response.claimId,
                    claimName: response.claimName,
                    issuer: response.issuer,
                    data: response.data,
                    uri: response.uri,
                    issuerName: response.issuerName
                  }

                  checkClaimExistance(claimData.claimId).then(claimExist => {
                    if (claimExist.length == 0) {
                      addIssuedClaims(claimData.claimId, claimData.claimName, claimData.data, claimData.issuer, claimData.uri, claimData.issuerName)
                      navigation.navigate("Claims");
                    }
                    else {
                      try {
                        Alert.alert("Claim Scan",
                          "You already have this credential")
                        [{
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
                      catch (error) {
                        console.log(error.message)
                      }
                      navigation.navigate("Claims")
                    }
                  })

                })
                  .catch(function (error) {
                    console.log("stata:", error)
                    if (error.response.status == 500) {
                      try {
                        Alert.alert("Claim Scan",
                          "Error while fetching claim. Check your City Claim")
                        [{
                          text: "Cancel",
                          onPress: () => console.log("Cancel Pressed"),
                          style: "cancel"
                        },
                          {
                            text: "OK"
                          }
                        ],
                          { cancelable: "false" }
                      } catch (exception) {
                        return
                      }
                    }
                  });
              })
            })
          }
        })

      }
      else if (JSON.parse(data).type == undefined) {
        retreiveAccountInformation().then((value) => {
          console.log("Sent Username for Login:", value.email)
          axiosObj.post('/user/pushData', {
            qr: data,
            username: value.email,
          }).then(function (response) {
            console.log(response)
              .catch(function (error) {
                if (error.response.status == 500) {
                  console.log("Looks like you dont have an account. You need to create an account before logging in")
                }
              })
          })
        })
      }
      else {
        console.log("Cannot Scan QR code")
      }
    }

    if (hasCameraPermission === null) {
      return <Text > Requesting for camera permission </Text>;
    }
    if (hasCameraPermission === false) {
      return <Text > No access to camera </Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        {scanned && <Button title={'Tap to Scan Again'} onPress={
          () => this.setState({
            scanned: false
          })
        } />}
      </View>
    );
  }
}