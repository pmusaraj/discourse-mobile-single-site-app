'use strict';
import {Platform} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
const site = 'https://' + global.siteDomain;

class Authenticate {
  constructor() {}

  login(username, password) {
    return new Promise((resolve, reject) => {
      this.getAbout()
        .then((json) => {
          // old version
          if (json.about.version.startsWith('2.5')) {
            this.getCSRF()
              .then((json) => {
                if (json.csrf) {
                  AsyncStorage.getItem('@Discourse.loginCookie').then(
                    (cookie) => {
                      this.twoFiveLogin(json.csrf, username, password, cookie)
                        .then((json) => {
                          if (json.error) {
                            reject(json);
                          } else {
                            resolve(json);
                          }
                        })
                        .catch((err) => {
                          console.log(err);
                          reject(err);
                        })
                        .done();
                    },
                  );
                }
              })
              .catch((err) => {
                reject(err);
              })
              .done();
          } else {
            this.getCSRF()
              .then((json) => {
                this.discourseAuth(json.csrf, username, password)
                  .then((json) => {
                    if (json.error) {
                      reject(json);
                    } else {
                      resolve(json);
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                    reject(err);
                  })
                  .done();
              })
              .catch((err) => {
                reject(err);
              })
              .done();
          }
        })
        .done();
    });
  }

  getAbout() {
    return new Promise((resolve, reject) => {
      let req = new Request(site + '/about.json', {
        headers: null,
        method: 'GET',
      });

      this._currentFetch = fetch(req);
      this._currentFetch
        .then((r1) => {
          if (r1.status === 200) {
            return r1.json();
          } else {
            if (r1.status === 403) {
              throw '403 error';
            } else {
              throw 'Error during fetch status code:' + r1.status;
            }
          }
        })
        .then((result) => {
          resolve(result);
        })
        .catch((e) => {
          reject(e);
        })
        .finally(() => {
          this._currentFetch = undefined;
        })
        .done();
    });

    // return new Promise((resolve, reject) => {
    //   let req = new Request(url, {
    //     method: 'GET',
    //   });

    //   this._currentFetch = fetch(req);
    //   this._currentFetch
    //     .then((versionInfo) => {
    //       if (versionInfo.status === 200) {
    //         console.log(versionInfo);
    //         return versionInfo.json();
    //       } else {
    //         throw 'Error during fetch status code:' + versionInfo.status;
    //       }
    //     })
    //     .then((result) => {
    //       resolve(result);
    //     })
    //     .catch((e) => {
    //       reject(e);
    //     })
    //     .finally(() => {
    //       this._currentFetch = undefined;
    //     })
    //     .done();
    // });
  }

  getCSRF() {
    let headers = {
      'X-CSRF-Token': 'undefined',
      Referer: site,
      'X-Requested-With': 'XMLHttpRequest',
    };

    let csrfUrl = `${site}/session/csrf`;

    return new Promise((resolve, reject) => {
      let req = new Request(csrfUrl, {
        headers: headers,
        method: 'GET',
      });

      this._currentFetch = fetch(req);
      this._currentFetch
        .then((r1) => {
          if (r1.status === 200) {
            var cookie = r1.headers.map['set-cookie'];
            AsyncStorage.setItem(
              '@Discourse.loginCookie',
              JSON.stringify(cookie[0]),
            );
            return r1.json();
          } else {
            if (r1.status === 403) {
              throw '403 error';
            } else {
              throw 'Error during fetch status code:' + r1.status;
            }
          }
        })
        .then((result) => {
          resolve(result);
        })
        .catch((e) => {
          reject(e);
        })
        .finally(() => {
          this._currentFetch = undefined;
        })
        .done();
    });
  }

  serializeParams(obj) {
    return Object.keys(obj)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent([obj[k]])}`)
      .join('&');
  }

  twoFiveLogin(csrf, username, password, cookie) {
    let headers = {
      'X-CSRF-Token': csrf,
      Origin: site,
      Referer: site,
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookie,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };

    let data = {
      login: username,
      password: password,
    };

    return new Promise((resolve, reject) => {
      let req = new Request(`${site}/session`, {
        headers: headers,
        method: 'POST',
        body: this.serializeParams(data),
      });

      this._currentFetch = fetch(req);
      this._currentFetch
        .then((r1) => {
          if (r1.status === 200) {
            return r1.json();
          } else {
            if (r1.status === 403) {
              throw '403 error';
            } else {
              throw 'Error during fetch status code:' + r1.status;
            }
          }
        })
        .then((result) => {
          resolve(result);
        })
        .catch((e) => {
          reject(e);
        })
        .finally(() => {
          this._currentFetch = undefined;
        })
        .done();
    });
  }

  discourseAuth(csrf, username, password) {
    let headers = {
      Origin: site,
      Referer: site,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };

    let data = {
      login: username,
      password: password,
      authenticity_token: csrf,
    };

    return new Promise((resolve, reject) => {
      let req = new Request(`${site}/session`, {
        headers: headers,
        method: 'POST',
        body: this.serializeParams(data),
      });

      fetch(req)
        .then((r1) => {
          console.log(r1);
          if (r1.status === 200) {
            var cookie = r1.headers.map['set-cookie'];
            AsyncStorage.setItem(
              '@Discourse.loginCookie',
              JSON.stringify(cookie[0]),
            );
            console.log(JSON.stringify(cookie[0]));
            return r1.json();
          } else {
            throw 'Error during fetch status code:' + r1.status;
          }
        })
        .then((result) => {
          resolve(result);
        })
        .catch((e) => {
          reject(e);
        })
        .done();
    });
  }
}

export default Authenticate;
