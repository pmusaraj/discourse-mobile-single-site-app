'use strict'
import {
  AsyncStorage,
  Platform
} from 'react-native'

const site = 'https://' + global.siteDomain

class Authenticate {
  constructor() {
  }

  login(username, password) {
    return new Promise((resolve, reject) => {
      this.getCSRF().then(json =>{
      		if (json.csrf) {
				    AsyncStorage.getItem('@Discourse.loginCookie').then((cookie) => {
				    	this.discourseLogin(json.csrf, username, password, cookie).then(json =>{
			    			if (json.error) {
			    				reject(json)
			    			} else {
			    				// console.log(json)
			    				resolve(json)
			    			}
        			})
							.catch(err => {
								console.log(err)
          			reject(err)
        			}).done()
				    })
      		}

          // resolve({
          //   userId: this.userId,
          //   username: this.username
          // })
        })
        .catch(err => {
          reject(err)
        }).done()
    })
  }

  getCSRF() {
    let headers = {
      'X-CSRF-Token': 'undefined',
      'Referer': site,
      'X-Requested-With': 'XMLHttpRequest'
    }

    let csrfUrl = `${site}/session/csrf`

    return new Promise((resolve, reject) => {

      let req = new Request(csrfUrl, {
        headers: headers, 
        method: 'GET'
      })

      this._currentFetch = fetch(req)
      this._currentFetch.then((r1) => {
        if (r1.status === 200) {
        	var cookie = r1.headers.map['set-cookie'];
        	AsyncStorage.setItem('@Discourse.loginCookie', JSON.stringify(cookie[0]))
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

  serializeParams(obj) {
    return Object.keys(obj)
                 .map(k => `${encodeURIComponent(k)}=${encodeURIComponent([obj[k]])}`)
                .join('&')
  }

  discourseLogin(csrf, username, password, cookie) {
    let headers = {
      'X-CSRF-Token': csrf,
      'Origin': site,
      'Referer': site,
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }

    let data = {
    	login: username, 
    	password: password
    }

    console.log(this.serializeParams(data))

    return new Promise((resolve, reject) => {
      let req = new Request(`${site}/session?${this.serializeParams(data)}`, {
        headers: headers,
        method: 'POST',
        data: data
      })

      this._currentFetch = fetch(req)
      this._currentFetch.then((r1) => {
      	console.log(r1)
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

}

export default Authenticate
