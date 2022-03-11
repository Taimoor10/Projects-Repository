/*
This file is unimplemented but provides the functionality to add claim
*/

import * as React from 'react';
import { Text, View, StyleSheet, Button, Linking } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default class AddClaim extends React.Component {
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

    handleBarCodeScanned = ({
      type,
      data
    }) => {
      this.setState({
        scanned: true
      });
      alert(`Bar code with type ${type} and data ${data} has been scanned!`);

      fetch('http://172.21.5.27:3000/identity/issueClaim', {

        method: 'POST',
        headers: {
          'Accept': 'appliction/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimId: data,
          email: "thom",
          claimer: "6af59537686f4f68ccbc8628d76e8c837f666340"
        })
      }).then((response) => {
        console.log(JSON.stringify(response.status))
      })
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
