import React, { Component } from 'react';
import {  AsyncStorage, WebView, Keyboard, Dimensions,
          Linking, Text, View, TouchableHighlight, Platform,
          ScrollView, TextInput, Button, Image, AppState, BackHandler } from 'react-native';

import OneSignal from 'react-native-onesignal';
import SafariView from 'react-native-safari-view';
import CookieManager from 'react-native-cookies';

import Manager from './Manager'
import Authenticate from './Authenticate'

import CustomWebView from './CustomWebView';

const site = 'https://' + global.siteDomain;

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      uri: site,
      promptToConnect: false,
      skipLogin: false,
      appLoading: true,
      username: '',
      password: '',
      authError: '',
      keyboardVisible: false,
      landscapeLayout: false,
      appState: AppState.currentState,
      pushAuth: false
    };

    this._Manager = new Manager()
    this._Auth = new Authenticate()
  }

  loadDiscourseAuth() {
    this._Manager
      .generateAuthURL()
      .then(authUrl => {
        this.setState({uri: authUrl})
      })
  }

  checkAuthStatus() {
    this._Manager
      .getUserInfo()
      .then(user => {
        if (user && user.username)
          this.setState({skipLogin: true})
      })
      .catch(err => {
      }).done(done => {
        AsyncStorage.getItem('@Discourse.auth').then((json) => {
          if (json) {
            var auth = JSON.parse(json)
            if (auth.key && auth.push) {
              this.setState({pushAuth: true})
            }
          }
        }).catch(err => {
          console.log('.auth error')
          console.log(err)
        }).done(done => {
          this.setState({appLoading: false})
        })
      })
  }

  componentDidMount() {
    OneSignal.addEventListener('ids', this.onIds);
    OneSignal.addEventListener('opened', this._onOpened.bind(this))
    AppState.addEventListener('change', this._handleAppStateChange);

    // Android only: disable display when user is in app, clear notifications
    if (Platform.OS !== 'ios') {
      OneSignal.inFocusDisplaying(0)
      OneSignal.clearOneSignalNotifications();
    }

    AsyncStorage.getItem('@Discourse.skipLogin').then((json) => {
      if (json && json === 'loginSkipped') {
        this.setState({skipLogin: true})
      }
    })

    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));

    this.checkAuthStatus()

    BackHandler.addEventListener('hardwareBackPress', this._backHandler.bind(this));
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('ids', this.onIds);
    OneSignal.removeEventListener('opened', this._onOpened)

    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();

    BackHandler.removeEventListener('hardwareBackPress', this._backHandler);
  }

  _backHandler = () => {
    if (this.state.backButtonEnabled) {
      this.refs['webview'].goBack();
      return true;
    }
  }

  _handleAppStateChange = (nextAppState) => {
    console.log('APPSTATE: ' + nextAppState)
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      if (Platform.OS !== 'ios') {
        OneSignal.clearOneSignalNotifications()
      }
    }
    this.setState({appState: nextAppState});
  }

  onIds(device) {
    // TODO: should this be handled differently?
    if (device.userId) {
      AsyncStorage.setItem('@Discourse.clientId', device.userId)
    }
  }

  _userLogin() {
    console.log('user login called')
    self = this
    this._Auth
      .login(this.state.username, this.state.password)
      .then(json => {
        this._Manager
          .generateAuthURL()
          .then(authUrl => {
            this.setState({
              uri: authUrl,
              authError: '',
              skipLogin: true
            })
          })
      })
      .catch(err => {
        if (err.error)
          this.setState({authError: err.error})
        else
          this.setState({authError: 'Error: Could not login.'})
      }).done()
  }

  skipWelcomeScreen() {
    this.setState({skipLogin: true})
    AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped')
  }

  createAccount() {
    AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped')
    this.setState({
      uri: site + global.acctUrl,
      authError: '',
      skipLogin: true
    })    
  }

  loadLoginModal() {
    AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped')
    this.setState({
      uri: `${site}/login`,
      skipLogin: true
    })    
  }

  TOS() {
    AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped')
    this.setState({
      uri: site + global.TOSUrl,
      authError: '',
      skipLogin: true
    })    
  }

  _onOpened(openResult) {
    if (openResult.notification.payload && openResult.notification.payload.additionalData && openResult.notification.payload.additionalData.discourse_url) {
      var path = openResult.notification.payload.additionalData.discourse_url
      this.setState({uri: site + path})
    }
  }

  _keyboardDidShow (e) {
    this.setState({keyboardVisible: true})
  }
  _keyboardDidHide (e) {
    this.setState({keyboardVisible: false})
  }
  _onLayout () {
    const {width, height} = Dimensions.get('window')
    if (width > height)
      this.setState({landscapeLayout: true})
  }
  invokeAuthRedirect(url) {
    let split = url.split('payload=')
    if (split.length === 2) {
      OneSignal.registerForPushNotifications()
      this._Manager.handleAuthPayload(decodeURIComponent(split[1]))
      this.checkAuthStatus()
    }
  }
  _onNavigationStateChange(event) {
    // enable back button on Android
    if (!event.loading && Platform.OS === 'android') {
      this.setState({
          backButtonEnabled: event.canGoBack,
      });
    }

    // only prompt to authorize Notifications if user is logged in to Discourse and doesn't have pushAuth enabled
    if (!event.loading && !this.state.pushAuth && !event.url.includes(`user-api-key`)) {
      CookieManager.get(site)
      .then((res) => {
        if (res._t && res._forum_session) {
          this.setState({promptToConnect: true})
        } else {
          this.setState({promptToConnect: false})
        }
      });
    } else {
      this.setState({promptToConnect: false})
    }

    if (event.loading && event.url.includes(`?payload=`)) {
      this.invokeAuthRedirect(event.url);
    }

    // Android only, open device browser for external links 
    if (Platform.OS === 'android' && event.url.indexOf(site) === -1 && !event.url.includes('oauth')) {
      this.refs.webview.stopLoading();
      Linking.openURL(event.url);        
    }
  }
  _onShouldStartLoadWithRequest(event) {
    // _onShouldStartLoadWithRequest runs on iOS only
    // open device browser for external links
    if (Platform.OS === 'ios' && event.url.indexOf(site) === -1 && !event.url.includes('oauth')) {
      this.refs.webview.stopLoading();
      SafariView.show({url: event.url});
      return false;
    }

    return true
  }
  renderWebView() {
    return (
      <CustomWebView
        style={{
          marginBottom: this.state.promptToConnect ? 50 : 0,
          marginTop: 20
        }}
        ref="webview"
        source={{ uri: this.state.uri }}
        startInLoadingState={true}
        bounces={true}
        mixedContentMode='always'
        openNewWindowInWebView={true}
        injectedJavaScript={
          // fixes issue with fixed-positioned header not showing up on initial load
          `if (typeof $ !== 'undefined') {$('.docked .d-header').css('transform', 'translate3d(0,0,0)');}`
        }
        onNavigationStateChange={this._onNavigationStateChange.bind(this)}
        onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest.bind(this)}
      />
    );
  }

  renderLoginForm() {
    return (
      <View style={{paddingVertical: 20}}>
        <View style={{paddingVertical: 10}}>
          <TextInput
            placeholder='Username'
            autoCapitalize='none'
            autoCorrect={false} 
            autoFocus={true} 
            returnKeyType={'next'}
            keyboardType='email-address'
            value={this.state.username} 
            style={{
              color: global.textColor,
              paddingVertical: 5,
              borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
              borderColor: global.buttonColor
            }}
            underlineColorAndroid={global.textColor}
            onChangeText={(text) => this.setState({ username: text })} />
        </View>
        <View>
          <TextInput 
            placeholder='Password'
            autoCapitalize='none'
            autoCorrect={false} 
            secureTextEntry={true} 
            returnKeyType={'go'}
            value={this.state.password} 
            style={{
              color: global.textColor,
              paddingVertical: 5,
              borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
              borderColor: global.buttonColor
            }}
            underlineColorAndroid={global.textColor}
            onChangeText={(text) => this.setState({ password: text })} />
        </View>
        <View>
          <Text style={{
            color: global.textColor,
            fontSize: 16,
            paddingVertical: 10
            }}>
            {this.state.authError}
          </Text>
        </View>
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10
          }}>
          <View style={{
            flex: 1,
            paddingHorizontal: 10,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TouchableHighlight 
              style={{
                backgroundColor: global.buttonColor,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 3
              }}
              onPress={(e) => {this._userLogin(e)}}
            >
              <Text style={{
                color: "#FFF",
                fontSize: 18,
                alignItems: 'center'
              }}>
                {global.loginText}
              </Text>
            </TouchableHighlight>
          </View>
          <View style={{
            flex: 1,
            alignItems: 'center'
          }}>
            <TouchableHighlight 
              onPress={() => {
                this.skipWelcomeScreen()
            }}>
              <Text style={{color: global.textColor, fontSize: 16}}>
                {global.skipText}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
        {!this.state.keyboardVisible && global.acctText != '' && 
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            paddingVertical: 10,
            alignItems: 'center'
          }}>
            <TouchableHighlight 
              onPress={() => {
                this.createAccount()
            }}>
              <Text style={{color: global.textColor, fontSize: 14}}>
                {global.acctText}
              </Text>
            </TouchableHighlight>
          </View>
        }
      </View>
    );
  }
  renderStartButtons() {
    return (
      <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40
        }}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <TouchableHighlight 
            style={{
              backgroundColor: global.buttonColor,
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 3
            }}
            onPress={() => {this.skipWelcomeScreen()}}
          >
            <Text style={{
              color: "#FFF",
              fontSize: 18,
              alignItems: 'center'
            }}>
              {global.primaryStartButtonText}
            </Text>
          </TouchableHighlight>
        </View>
        {global.secondaryStartButtonText != '' &&
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TouchableHighlight 
              onPress={() => {this.loadLoginModal()}}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 20
              }}>
              <Text style={{color: global.textColor, fontSize: 15}}>
                {global.secondaryStartButtonText}
              </Text>
            </TouchableHighlight>
          </View>
        }
      </View>
    );
  }
  render() {
    if (this.state.appLoading)
      return false

    return (
      <View style={{flex: 1, backgroundColor: global.bgColor}} onLayout={this._onLayout.bind(this)}>
        {this.state.uri && this.state.skipLogin &&
          this.renderWebView()
        }

        {!this.state.skipLogin && 
          <ScrollView contentContainerStyle={{
            flex: 1,
            backgroundColor: global.bgColor, 
            padding: 15, 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            {this.state.landscapeLayout && this.state.keyboardVisible ?
              null :
              <View style={{
                flex: 1,
                paddingVertical: this.state.keyboardVisible ? 6 : 15,
                alignItems: 'stretch',
                paddingHorizontal: 20
              }}>
                <Image 
                  source={require('./logo.png')}
                  resizeMode={'contain'}
                  style={{ width: null, height: null, flex:1 }}
                  />
              </View>
            }
            <View style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingVertical: 20
            }}>
              {!this.state.keyboardVisible && 
                <View style={{flex: 1}}>
                  <Text style={{
                    color: global.textColor,
                    fontSize: 16,
                    paddingVertical: 10,
                    textAlign: 'center'
                    }}>
                    {global.introText}
                  </Text>
                </View>
              }
              {global.showLoginForm &&
                this.renderLoginForm()
              }
              {!global.showLoginForm &&
                this.renderStartButtons()
              }

              <View style={{
                paddingVertical: 10,
                alignItems: 'center',
                flex: 1,
                justifyContent: 'flex-end'
              }}>
                <TouchableHighlight 
                  onPress={() => {
                    this.TOS()
                }}>
                  <Text style={{fontSize: 13}}>
                    <Text style={{color: global.TOSTextColor}}>
                      {global.TOSText}
                    </Text>
                    <Text style={{color: global.textColor}}>
                      {global.TOSLinkText}
                    </Text>
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
          </ScrollView>
        }

        {(this.state.promptToConnect && this.state.skipLogin) && 
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
                backgroundColor: global.connectButtonBgColor,
                height: 28,
                padding: 4,
                borderRadius: 2
              }}
              onPress={() => {
                this.loadDiscourseAuth()
            }}>
              <Text style={{
                color: global.connectButtonTextColor,
                fontSize: 14,
                paddingLeft: 8,
                paddingRight: 8,
                fontFamily: 'HelveticaNeue-Medium'
              }}>
                {global.connectText}
              </Text>
            </TouchableHighlight>
          </View>
        }
      </View>
    );
  }
}

export default App;
