'use strict'
import {
  AsyncStorage,
  Alert,
  Platform
} from 'react-native'

import RNKeyPair from 'react-native-key-pair'
import DeviceInfo from 'react-native-device-info'
import OneSignal from 'react-native-onesignal'
import JSEncrypt from './lib/jsencrypt'

const site = 'https://' + global.siteDomain

class Manager {
  constructor() {
    AsyncStorage.getItem('@Discourse.auth').then((json) => {
      if (json) {
        var data = JSON.parse(json)
        if (data.key) {
          this.authToken = data.key
        }
      }
    })

    AsyncStorage.getItem('@Discourse.clientId').then((clientId) => {
      this.clientId = clientId || this.randomBytes(16)
    })

  }

  ensureRSAKeys() {
    return new Promise((resolve,reject)=> {
      if (this.rsaKeys) {
        resolve()
        return
      }

      AsyncStorage.getItem('@Discourse.rsaKeys').then((json) => {
        if (json) {
          this.rsaKeys = JSON.parse(json)
          resolve()
        } else {
          console.log('Generating RSA keys')
          RNKeyPair.generate((pair)=>{
            this.rsaKeys = pair
            console.log('Generated RSA keys')
            AsyncStorage.setItem('@Discourse.rsaKeys', JSON.stringify(this.rsaKeys))
            resolve()
          })
        }
      })
    })
  }

  handleAuthPayload(payload) {
    let crypt = new JSEncrypt()

    crypt.setKey(this.rsaKeys.private)
    let decrypted = JSON.parse(crypt.decrypt(payload))

    if (decrypted.nonce !== this._nonce) {
      Alert.alert('We were not expecting this reply, please try again!')
      return
    }

    AsyncStorage.setItem('@Discourse.auth', JSON.stringify(decrypted))
    this.authToken = decrypted.key

    this.getUserInfo()
      .then(user => {
        OneSignal.sendTag("username", user.username)
      })

  }

  serializeParams(obj) {
    return Object.keys(obj)
                 .map(k => `${encodeURIComponent(k)}=${encodeURIComponent([obj[k]])}`)
                .join('&')
  }

  generateNonce() {
    return new Promise(resolve=>{
      this._nonce = this.randomBytes(16)
      resolve(this._nonce)
    })
  }

	randomBytes(length) {
	  return Array(length+1).join('x').replace(/x/g, c => {
	    return Math.floor(Math.random()*16).toString(16)
	  })
	}

  generateAuthURL() {

    return this.ensureRSAKeys().then(()=>
      this.generateNonce()
      .then(nonce => {

        let basePushUrl = "https://onesignal.com/api/v1/notifications"
        let params = {
          scopes: 'notifications,session_info',
          client_id: this.clientId,
          nonce: nonce,
          push_url: basePushUrl,
          auth_redirect: site,
          application_name: global.appName + ' - ' + (Platform.OS == 'android' ? DeviceInfo.getModel() : DeviceInfo.getDeviceName()),
          public_key: this.rsaKeys.public
        }

        // console.log('auth URL below ------')
        // console.log(`${site}/user-api-key/new?${this.serializeParams(params)}`)
        return `${site}/user-api-key/new?${this.serializeParams(params)}`
      })
    )
  }

  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.userId && this.username) {
        resolve({userId: this.userId, username: this.username})
      } else {
        this.jsonApi('/session/current.json')
          .then(json =>{
            this.userId = json.current_user.id
            this.username = json.current_user.username
            resolve({
              userId: this.userId,
              username: this.username
            })
          })
          .catch(err => {
            reject(err)
          }).done()
      }
    })
  }

  jsonApi(path, method) {
    console.log(`calling: ${site}${path}`)

    method = method || 'GET'
    let headers = {
      'User-Api-Key': this.authToken,
      'User-Agent': `Discourse ${Platform.OS} App / 1.0`,
      'Content-Type': 'application/json',
      'Dont-Chunk': 'true',
      'User-Api-Client-Id': (this.clientId || '')
    }

    return new Promise((resolve, reject) => {
      let req = new Request(site + path, {
        headers: this.authToken ? headers : null,
        method: method
      })

      console.log('jsonApi request called')

      this._currentFetch = fetch(req)
      this._currentFetch.then(r1 => {
        if (r1.status === 200) {
          return r1.json()
        } else {
          if (r1.status === 403) {
            throw '403 error'
          } else {
            throw 'Error during fetch status code:' + r1.status
          }
        }
      })
      .then(result=>{
        resolve(result)
      })
      .catch((e)=>{
        reject(e)
      })
      .finally(()=>{
        this._currentFetch = undefined
      })
      .done()
    })
  }

  // checkOneSignalTag() {
  //   console.warn('authToken', this.authToken)    
  //   this.getUserInfo()
  //     .then(user => {
  //       OneSignal.getTags((receivedTags) => {
  //         console.warn(receivedTags);
  //         if (receivedTags == null) {
  //           OneSignal.sendTag("username", user.username)
  //         }
  //       })
  //     })
  // }
}

export default Manager
