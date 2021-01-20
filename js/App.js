import React, {Component} from 'react';

import {
  Keyboard,
  Dimensions,
  Linking,
  Text,
  View,
  TouchableHighlight,
  Platform,
  ScrollView,
  TextInput,
  Button,
  Image,
  AppState,
  BackHandler,
  Share,
  StatusBar,
} from 'react-native';

import OneSignal from 'react-native-onesignal';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';

import DeviceInfo from 'react-native-device-info';

import Authenticate from './Authenticate';
import TinyColor from './lib/tinycolor';

const site = 'https://' + global.siteDomain;

function isValidUrl(s) {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(s);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    OneSignal.init(global.oneSignalAppId, {kOSSettingsKeyAutoPrompt: false});

    this.state = {
      uri: site,
      skipLogin: false,
      username: '',
      password: '',
      authError: '',
      keyboardVisible: false,
      landscapeLayout: false,
      appState: AppState.currentState,
      barStyle: 'default',
      loadProgress: 0,
      headerBg: global.bgColor,
    };

    this._Auth = new Authenticate();
  }

  componentDidMount() {
    OneSignal.registerForPushNotifications();
    OneSignal.addEventListener('opened', this._onOpened.bind(this));
    OneSignal.inFocusDisplaying(global.inAppNotification);

    AppState.addEventListener('change', this._handleAppStateChange);

    // Android only: clear notifications (badge count) when user is in app
    if (Platform.OS !== 'ios') {
      OneSignal.clearOneSignalNotifications();
    }

    AsyncStorage.getItem('@Discourse.skipLogin').then((json) => {
      if (json && json === 'loginSkipped') {
        this.setState({skipLogin: true});
      } else {
        if (global.usePluginLoginScreen) {
          this.setState({
            uri: `${site}/onesignal/app-login`,
            skipLogin: true,
          });
        }
      }
    });

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow.bind(this),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide.bind(this),
    );

    BackHandler.addEventListener(
      'hardwareBackPress',
      this._backHandler.bind(this),
    );

    this._dimensionsChanged();
    Dimensions.addEventListener('change', () => {
      this._dimensionsChanged();
    });

    if (Platform.OS !== 'ios') {
      StatusBar.setBackgroundColor(this.state.headerBg);
      const style =
        TinyColor(this.state.headerBg).getBrightness() < 125
          ? 'light-content'
          : 'dark-content';
      StatusBar.setBarStyle(style);
    }
  }

  _dimensionsChanged() {
    const {width, height} = Dimensions.get('window');
    this.setState({landscapeLayout: width > height});
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('opened', this._onOpened);

    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();

    BackHandler.removeEventListener('hardwareBackPress', this._backHandler);
  }

  _backHandler = () => {
    this.webview.goBack();
    return true;
  };

  _handleAppStateChange = (nextAppState) => {
    console.log('APPSTATE: ' + nextAppState);
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (Platform.OS !== 'ios') {
        OneSignal.clearOneSignalNotifications();
      }
    }
    this.setState({appState: nextAppState});
  };

  _userLogin() {
    console.log('user login called');
    this._Auth
      .login(this.state.username, this.state.password)
      .then((json) => {
        this.setState({
          authError: '',
          skipLogin: true,
        });
        AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped');
      })
      .catch((err) => {
        console.log(err);
        if (err.error) this.setState({authError: err.error});
        else this.setState({authError: 'Error: Could not login.'});
      })
      .done();
  }

  skipWelcomeScreen() {
    this.setState({skipLogin: true});
    AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped');
  }

  createAccount() {
    AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped');
    this.setState({
      uri: isValidUrl(global.acctUrl) ? global.acctUrl : site + global.acctUrl,
      authError: '',
      skipLogin: true,
    });
  }

  primaryStartAction() {
    AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped');
    this.setState({
      uri: isValidUrl(global.primaryStartUrl)
        ? global.primaryStartUrl
        : site + global.primaryStartUrl,
      authError: '',
      skipLogin: true,
    });
  }

  TOS() {
    AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped');
    this.setState({
      uri: isValidUrl(global.TOSUrl) ? global.TOSUrl : site + global.TOSUrl,
      authError: '',
      skipLogin: true,
    });
  }

  _onOpened(openResult) {
    if (
      openResult.notification.payload &&
      openResult.notification.payload.additionalData &&
      openResult.notification.payload.additionalData.discourse_url
    ) {
      var path = openResult.notification.payload.additionalData.discourse_url;
      this.setState({uri: site + path});
    }
  }

  _keyboardDidShow(e) {
    this.setState({keyboardVisible: true});
  }
  _keyboardDidHide(e) {
    this.setState({keyboardVisible: false});
  }
  _onNavigationStateChange(event) {
    // open device browser for external links in Android
    const internalLink = global.internalURLs.some((v) => event.url.includes(v));

    if (event.url.indexOf(site) === -1 && !internalLink) {
      this.webview.stopLoading();
      if (Platform.OS === 'android') {
        Linking.openURL(event.url);
      }
      return false;
    }
  }
  _handleMessage(event) {
    let data = JSON.parse(event.nativeEvent.data);
    console.log('_onMessage', data);

    if (data.currentUsername) {
      this._sendSubscription();
      OneSignal.sendTag('username', data.currentUsername);
      AsyncStorage.setItem('@Discourse.skipLogin', 'loginSkipped');
      this.setState({
        skipLogin: true,
      });
    }

    if (data.shareUrl !== undefined) {
      Share.share({
        url: data.shareUrl,
      });
    }

    if (data.headerBg) {
      // when fully transparent, use black status bar
      if (TinyColor(data.headerBg).getAlpha() === 0) {
        data.headerBg = 'rgb(0,0,0)';
      }

      this.setState({
        headerBg: data.headerBg,
        barStyle:
          TinyColor(data.headerBg).getBrightness() < 125
            ? 'light-content'
            : 'dark-content',
      });
      // ugly hack for an outstanding react-native-webview issue with the statusbar
      // https://github.com/react-native-community/react-native-webview/issues/735
      setTimeout(() => {
        StatusBar.setBarStyle(this.state.barStyle);
        if (Platform.OS !== 'ios') {
          StatusBar.setBackgroundColor(this.state.headerBg);
        }
      }, 400);
    }
  }

  _sendSubscription() {
    // send subscription request to discourse-onesignal
    const sub = `
      window.DiscourseOnesignal.subscribeDeviceToken("${DeviceInfo.getUniqueId()}", "${
      Platform.OS
    }", "${global.appName}");
      true;
    `;

    this.webview.injectJavaScript(sub);
  }

  _onShouldStartLoadWithRequest(event) {
    // open device browser for external links
    if (event.url.includes('about:')) {
      return false;
    }
    const internalLink = global.internalURLs.some((v) => event.url.includes(v));
    const fileDownload = ['.pdf'].some((v) => event.url.includes(v));

    // onShouldStartLoadWithRequest is sometimes triggered by ajax requests (ads, etc.)
    // this is a workaround to avoid launching Safari for these events
    if (
      event.mainDocumentURL !== undefined &&
      event.url !== event.mainDocumentURL
    ) {
      return true;
    }

    if (
      (Platform.OS === 'ios' &&
        event.url.indexOf(site) === -1 &&
        !internalLink) ||
      fileDownload
    ) {
      Linking.openURL(event.url);
      return false;
    }
    return true;
  }
  _renderError(e1, e2, e3) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          height: '100%',
        }}>
        <Text
          style={{
            color: global.textColor,
            fontSize: 18,
            paddingVertical: 10,
          }}>
          {e1} ({e2})
        </Text>
        <Text
          style={{
            color: global.textColor,
            fontSize: 14,
          }}>
          {e3}
        </Text>
        <TouchableHighlight
          style={{
            backgroundColor: global.buttonColor,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 3,
            marginTop: 50,
          }}
          onPress={(e) => {
            this.webview.reload();
          }}>
          <Text
            style={{
              color: '#FFF',
              fontSize: 20,
              alignItems: 'center',
            }}>
            Refresh
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
  renderWebView() {
    return (
      <WebView
        style={{
          backgroundColor: this.state.headerBg,
          marginBottom: 0,
          marginTop: this.state.landscapeLayout
            ? 0
            : DeviceInfo.hasNotch()
            ? 35
            : 0,
        }}
        ref={(ref) => {
          this.webview = ref;
        }}
        source={{uri: this.state.uri}}
        startInLoadingState={true}
        renderLoading={() => (
          <View
            style={{
              backgroundColor: this.state.headerBg,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              paddingLeft: 0,
              paddingRight: 0,
            }}>
            <Image
              source={require('../splash.png')}
              resizeMode="cover"
              style={{
                width: '95%',
                height: '95%',
              }}
            />
          </View>
        )}
        onLoadProgress={({nativeEvent}) => {
          this.setState({
            loadProgress: nativeEvent.progress,
          });
        }}
        bounces={true}
        mixedContentMode="always"
        sharedCookiesEnabled={true}
        allowsBackForwardNavigationGestures={true}
        onNavigationStateChange={this._onNavigationStateChange.bind(this)}
        onMessage={(e) => this._handleMessage(e)}
        onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest.bind(
          this,
        )}
        renderError={this._renderError.bind(this)}
      />
    );
  }

  renderLoginForm() {
    return (
      <View style={{paddingVertical: 10}}>
        <View style={{paddingVertical: 10}}>
          <TextInput
            placeholder={global.usernamePlaceholder}
            placeholderTextColor={global.textColor}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={false}
            returnKeyType={'next'}
            keyboardType="email-address"
            value={this.state.username}
            style={{
              color: global.textColor,
              paddingVertical: 5,
              borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
              borderColor: global.buttonColor,
              height: 40,
              fontSize: 18,
            }}
            underlineColorAndroid={global.textColor}
            onChangeText={(text) => this.setState({username: text})}
          />
        </View>
        <View style={{paddingVertical: 10}}>
          <TextInput
            placeholder={global.passwordPlaceholder}
            placeholderTextColor={global.textColor}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            returnKeyType={'go'}
            value={this.state.password}
            style={{
              color: global.textColor,
              paddingVertical: 5,
              borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
              borderColor: global.buttonColor,
              height: 40,
              fontSize: 18,
            }}
            underlineColorAndroid={global.textColor}
            onSubmitEditing={(e) => {
              this._userLogin(e);
            }}
            onChangeText={(text) => this.setState({password: text})}
          />
        </View>
        <View>
          <Text
            style={{
              color: global.textColor,
              fontSize: 16,
              paddingVertical: 10,
            }}>
            {this.state.authError}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
          }}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableHighlight
              style={{
                backgroundColor: global.buttonColor,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 3,
              }}
              onPress={(e) => {
                this._userLogin(e);
              }}>
              <Text
                style={{
                  color: '#FFF',
                  fontSize: 18,
                  alignItems: 'center',
                }}>
                {global.loginText}
              </Text>
            </TouchableHighlight>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
            }}>
            <TouchableHighlight
              onPress={() => {
                this.skipWelcomeScreen();
              }}>
              <Text style={{color: global.textColor, fontSize: 16}}>
                {global.skipText}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
        {!this.state.keyboardVisible && global.acctText != '' && (
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              paddingVertical: 10,
              alignItems: 'center',
            }}>
            <TouchableHighlight
              onPress={() => {
                this.createAccount();
              }}>
              <Text style={{color: global.textColor, fontSize: 14}}>
                {global.acctText}
              </Text>
            </TouchableHighlight>
          </View>
        )}
      </View>
    );
  }
  renderStartButtons() {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
        }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableHighlight
            style={{
              backgroundColor: global.buttonColor,
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 3,
            }}
            onPress={() => {
              this.primaryStartAction();
            }}>
            <Text
              style={{
                color: global.primaryStartButtonTextColor,
                fontSize: 18,
                alignItems: 'center',
              }}>
              {global.primaryStartButtonText}
            </Text>
          </TouchableHighlight>
        </View>
        {global.secondaryStartButtonText != '' && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableHighlight
              onPress={() => {
                this.createAccount();
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 20,
              }}>
              <Text style={{color: global.textColor, fontSize: 15}}>
                {global.secondaryStartButtonText}
              </Text>
            </TouchableHighlight>
          </View>
        )}
      </View>
    );
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: this.state.headerBg,
        }}>
        {this.state.uri && this.state.skipLogin && this.renderWebView()}

        {!this.state.skipLogin && !global.usePluginLoginScreen && (
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              backgroundColor: global.bgColor,
              padding: 40,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'stretch',
            }}>
            {this.state.landscapeLayout && this.state.keyboardVisible ? null : (
              <View
                style={{
                  flex: 1,
                  paddingVertical: this.state.keyboardVisible ? 0 : 20,
                  alignItems: 'stretch',
                  paddingHorizontal: 20,
                }}>
                <Image
                  source={require('../icon.png')}
                  resizeMode={'contain'}
                  style={{width: null, height: null, flex: 1}}
                />
              </View>
            )}
            <View
              style={{
                flex: 3,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}>
              {!this.state.keyboardVisible && (
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      color: global.textColor,
                      fontSize: 16,
                      paddingVertical: 10,
                      textAlign: 'center',
                    }}>
                    {global.introText}
                  </Text>
                </View>
              )}
              {global.showLoginForm && this.renderLoginForm()}
              {!global.showLoginForm && this.renderStartButtons()}

              <View
                style={{
                  paddingVertical: 10,
                  alignItems: 'center',
                  flex: 0,
                  justifyContent: 'flex-end',
                }}>
                <TouchableHighlight
                  onPress={() => {
                    this.TOS();
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
        )}
      </View>
    );
  }
}

export default App;
