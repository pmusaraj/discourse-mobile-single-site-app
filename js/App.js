import React, { Component } from 'react';
import {  AsyncStorage, 
          WebView, 
          Linking, 
          Text, 
          View, 
          TouchableHighlight,
          Platform } from 'react-native';

import RNKeyPair from 'react-native-key-pair'
import OneSignal from 'react-native-onesignal'
import SafariView from 'react-native-safari-view'

import Manager from './Manager'

const site = 'https://' + global.siteDomain;

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      uri: site,
      isConnected: false
    };

    this._Manager = new Manager()
  }

  loadDiscourseAuth() {
    this._Manager
      .generateAuthURL()
      .then(authUrl => {
        this.setState({uri: authUrl})
      })
  }

  invokeAuthRedirect(url) {
    let split = url.split('payload=')
    if (split.length === 2) {
      OneSignal.registerForPushNotifications()
      this._Manager.handleAuthPayload(decodeURIComponent(split[1]))
      this.setState({uri: site})
      this.checkAuthStatus()
    }
  }

  checkAuthStatus() {
    AsyncStorage.getItem('@Discourse.auth').then((json) => {
      if (json) {
        var data = JSON.parse(json)
        if (data.key) {
          this.setState({isConnected: true})
        }
      }
    })
  }

  componentDidMount() {
    OneSignal.addEventListener('opened', this._onOpened.bind(this))
    this.checkAuthStatus()
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('opened', this._onOpened)
  }

  _onOpened(openResult) {
    if (openResult.notification.payload && openResult.notification.payload.additionalData && openResult.notification.payload.additionalData.discourse_url) {
      var path = openResult.notification.payload.additionalData.discourse_url
      this.setState({uri: site + path})
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.state.uri && 
          <WebView
            style={{marginBottom: this.state.isConnected ? 0 : 50}}
            ref="webview"
            source={{ uri: this.state.uri }}
            startInLoadingState={true}
            mixedContentMode="always"
            onNavigationStateChange={(event) => {
              if (event.url.startsWith(global.URLscheme + '://auth_redirect')) {
                this.invokeAuthRedirect(event.url);
              } else if (event.url.indexOf(site) === -1) {
                this.refs.webview.stopLoading();
                if (Platform.OS === 'ios') {
                  SafariView.show({url: event.url});
                } else {
                  Linking.openURL(event.url);
                }
              }

            }}

          />
        }

        {!this.state.isConnected && 
          <View style={{
            height: 50, 
            backgroundColor: '#ebebeb', 
            padding: 8, 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0,
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <TouchableHighlight 
              style={{
                backgroundColor: '#e45735',
                height: 28,
                padding: 4
              }}
              onPress={() => {
                this.loadDiscourseAuth()
            }}>
              <Text style={{
                color: "#FFF",
                fontSize: 14,
                paddingLeft: 8,
                paddingRight: 8,
                fontFamily: 'HelveticaNeue-Medium'
              }}>Connect</Text>
            </TouchableHighlight>
          </View>
        }
      </View>
    );
  }
}

export default App;
