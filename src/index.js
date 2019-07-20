/**
 * @class GMapsRouting
 * @description A class to get geocodes and directions from google...
 * @param configOptions - a config object with options set
 */

import { loadApi, loadedApi, directionsService, geocodingService } from './loadGmapsApi'

class GMapsRouting {
  constructor() {
    this.countryCode = null
    this.language = null
    this.geocodeMode = 'address'

    this.googleMapsApiKey = ''
    this.requesTimeout = 20000
    this.googleGeocodeMapsUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
    this.googleDirectionsMapsUrl = 'https://maps.googleapis.com/maps/api/directions/json'

    this.directionsOrigin = null
    this.directionsOptimize = true
    this.directionsTravelMode = 'driving' // driving, walking, bicycling, transit
    this.directionsUnit = 'metric' // metric, impediral

    this.directionsAvoid = [] // tolls, highways, ferries, indoor
    this.directionsDepartureTime = new Date().getTime() / 1000
  }

  setConfig(options = {}) {
    if (options.key) this.setGoogleMapsApiKey(options.key)
    if (options.geocodeMode) this.setGeocodeMode(options.geocodeMode)
    if (options.countryCode) this.setCountryCode(options.countryCode)
    if (options.language) this.setLanguage(options.language)
    if (options.requesTimeout) this.setRequestTimeout(options.requesTimeout)

    if (options.directionsOrigin) this.setDirectionsOrigin(options.directionsOrigin)
    if (options.directionsOptimize) this.setDirectionsOptimize(options.directionsOptimize)
    if (options.directionsTravelMode) this.setDirectionsTravelMode(options.directionsTravelMode)
    if (options.directionsUnit) this.setDirectionsUnit(options.directionsUnit)
    if (options.directionsAvoid) this.setDirectionsAvoid(options.directionsAvoid)

    if (!loadedApi) {
      console.log('loading API Google')
      let that = this
      console.log(this)
      loadApi({
        region: that.countryCode,
        language: that.language,
        key: that.googleMapsApiKey,
        libraries: 'places,drawing,visualization'
      })

      console.log(directionsService)
    }
  }

  createRequestObject(url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()

      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return

        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response)
        } else if (xhr.readyState === 4 && xhr.status >= 400) {
          // "xhr.response.status": "INVALID_REQUEST" when send invalid URL to google
          resolve({ status: xhr.response.status, message: xhr.response.error_message, httpstatus: xhr.status })
        }
        // else if (xhr.readyState === 4) {
        //   resolve({ status: 'UNDEFINED_STATUS', readyState: xhr.readyState, httpstatus: xhr.status, response: xhr.response })
        // }
      }

      xhr.ontimeout = function() {
        resolve({ status: 'REQUEST_TIMEOUT', url: url, timeout: this.requesTimeout })
      }

      xhr.onerror = function(e, b) {
        resolve({ status: 'GENERAL_ERROR', url: url })
      }

      xhr.onload = function() {
        resolve({ status: xhr.response.status, url: url })
      }

      xhr.responseType = 'json'
      xhr.timeout = this.requesTimeout
      // xhr.withCredentials = true

      xhr.open('GET', url)
      // xhr.setRequestHeader('Accept', '*/*')
      // xhr.setRequestHeader('access-control-allow-origin', '*')
      // xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost')
      // xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
      // xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
      // xhr.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type')
      // xhr.setRequestHeader('content-type', 'image/gif')
      xhr.send()
    })
  }

  // createRequestObject(url) {
  //   // var req = new Request(url, {
  //   //   method: 'get',
  //   //   mode: 'cors',
  //   //   redirect: 'follow',
  //   //   headers: { 'Accept': '*/*' }
  //   // })

  //   return fetch(url)
  //     .then(response => {
  //       if (response.ok) {
  //         if (response.status >= 200 && response.status < 300) {
  //           return response.json()
  //         } else if (response.status >= 400 && response.status < 500) {
  //           return { status: 'INVALID_REQUEST', response: response.json(), httpstatus: response.status }
  //         } else {
  //           return { status: 'UNDEFINED_STATUS', response: response.json(), httpstatus: response.status }
  //         }
  //       } else {
  //         return { status: 'FAILED_REQUEST', response: 'null', httpstatus: response.status }
  //       }
  //     })
  //     .catch(err => {
  //       return { status: 'GENERAL_ERROR', response: err.message, httpstatus: 0 }
  //     })
  // }

  /*********************************
  *
  *
  * GEOCODING API METHODS
  *
  *
  **********************************/

  getGeocodeUrl() {
    let url = this.googleGeocodeMapsUrl

    url += '?key=' + encodeURIComponent(this.googleMapsApiKey)
    if (this.countryCode) {
      url += '&components=country:' + this.countryCode
    }
    if (this.language) {
      url += '&language=' + this.language
    }

    return url
  }

  getGeocode(dataObj, mode = this.geocodeMode, fullResponse = false) {
    switch (mode) {
      case 'lat-lng':
        return this.getGoogleResponseFromLatLng(dataObj, fullResponse)

      case 'address':
      default:
        return this.getGoogleResponseFromAddress(dataObj, fullResponse)
    }
  }

  async getGoogleResponseFromAddress(locationObj, fullResponse) {
    let address = this.toAddressString(locationObj)
    let url = this.getGeocodeUrl()
    url += '&address=' + encodeURIComponent(address)
    let response = await this.createRequestObject(url).then(response => response)

    if (response.status && response.status === 'OK') {
      if (fullResponse) {
        return response
      } else {
        return {
          formatted_address: response.results[0].formatted_address,
          location: response.results[0].geometry.location,
          type: response.results[0].types[0],
          status: response.status,
        }
      }
    } else {
      return response
    }
  }

  async getGoogleResponseFromLatLng(latLngObj, fullResponse) {
    let url = this.getGeocodeUrl()
    url += '&latlng=' + encodeURIComponent(latLngObj.lat) + ',' + encodeURIComponent(latLngObj.lng)
    let response = await this.createRequestObject(url).then(response => response)

    if (response.status && response.status === 'OK') {
      if (fullResponse) {
        return response
      } else {
        let shortResponse = { status: response.status, addresses: [] }

        response.results.forEach(address => {
          shortResponse.addresses.push({
            formatted_address: address.formatted_address,
            location: address.geometry.location,
            type: address.types[0],
          })
        })

        return shortResponse
      }
    } else {
      return response
    }
  }

  /*********************************
  *
  *
  * DIRECTONS API METHODS
  *
  *
  **********************************/

  getDirectionsUrl(destination, waypoints = []) {
    let url = this.googleDirectionsMapsUrl
    url += '?key=' + encodeURIComponent(this.googleMapsApiKey)

    if (this.language) {
      url += '&language=' + this.language
    }

    if (this.directionsTravelMode) {
      url += '&mode=' + this.directionsTravelMode
    }

    if (this.directionsAvoid.length === 1) {
      url += '&avoid=' + this.directionsAvoid[0]
    } else if (this.directionsAvoid.length > 1) {
      url += '&avoid=' + this.directionsAvoid.join('|')
    }

    if (this.directionsUnit) {
      url += '&units=' + this.directionsUnit
    }

    if (this.directionsOrigin) {
      url += '&origin=' + this.directionsOrigin
    }

    if (destination) {
      url += '&destination=' + destination
    }

    // if (this.directionsOptimize) {
    //   url += '&waypoints=optimize:' + this.directionsOptimize + '|||||'
    // }

    // if (this.directionsDepartureTime) {
    //   url += '&departure_time=' + this.directionsDepartureTime
    // }

    return url
  }

  async getDirections(destination, waypoints = [], fullResponse = false) {
    let destinationFormated = this.prepareDestinationString(destination)
    let url = this.getDirectionsUrl(destinationFormated)

    // console.log('url ->>', url)

    let response2 = await this.createRequestObject(url).then(response => {
      console.log(response)
      return response
    })

    // console.log('response ->>', JSON.stringify(response2))

    // return response2

    // if (response.status && response.status === 'OK') {
    //   if (fullResponse) {
    //     return response
    //   } else {
    //     let shortResponse = { status: response.status, addresses: [] }

    //     response.results.forEach(address => {
    //       shortResponse.addresses.push({
    //         formatted_address: address.formatted_address,
    //         location: address.geometry.location,
    //         type: address.types[0],
    //       })
    //     })

    //     return shortResponse
    //   }
    // } else {
    //   return response
    // }
  }

  /*********************************
  *
  *
  * HELPERS METHODS
  *
  *
  **********************************/

  toAddressString(locationObj) {
    let addressStr = ''
    if (locationObj) {
      addressStr += locationObj.address1 ? locationObj.address1 + ' ' : ''
      addressStr += locationObj.address2 ? locationObj.address2 + ' ' : ''
      addressStr += locationObj.city ? locationObj.city + ', ' : ''
      if (locationObj.province || locationObj.postal_code) {
        addressStr += locationObj.province ? locationObj.province + ', ' : ''
        addressStr += locationObj.postal_code ? locationObj.postal_code + ', ' : ''
      } else {
        addressStr += locationObj.state ? locationObj.state + ', ' : ''
        addressStr += locationObj.zip_code ? locationObj.zip_code + ', ' : ''
      }
      addressStr += locationObj.country ? locationObj.country : ''
    }
    return addressStr
  }

  prepareDestinationString(destination) {
    if (destination && destination.lat && destination.lng) {
      return encodeURIComponent(destination.lat) + ',' + encodeURIComponent(destination.lng)
    } else if (destination && destination.address1) {
      return encodeURIComponent(this.toAddressString(destination))
    } else {
      return destination
    }
  }

  /*********************************
  *
  *
  * SET METHODS
  *
  *
  **********************************/

  setCountryCode(code) {
    this.countryCode = code || null
  }

  setLanguage(code) {
    this.language = code || null
  }

  setGeocodeMode(mode) {
    this.geocodeMode = mode === 'lat-lng' ? 'lat-lng' : 'address'
  }

  setGoogleMapsApiKey(key) {
    this.googleMapsApiKey = key
  }

  setRequestTimeout(timeout) {
    if (Number.isInteger(timeout) && timeout > 0) this.requesTimeout = timeout
    else return new Error('Timeout param must be a positive number')
  }

  setDirectionsOrigin(origin) {
    if (origin && origin.lat && origin.lng) {
      this.directionsOrigin = encodeURIComponent(origin.lat) + ',' + encodeURIComponent(origin.lng)
    } else if (origin && origin.address1) {
      this.directionsOrigin = encodeURIComponent(this.toAddressString(origin))
    }
  }

  setDirectionsOptimize(optimize = true) {
    this.directionsOptimize = optimize || true
  }

  setDirectionsTravelMode(mode = 'driving') {
    this.directionsTravelMode = mode || 'driving'
  }

  setDirectionsUnit(mode = 'metric') {
    this.directionsUnit = mode || 'metric'
  }

  setDirectionsAvoid(arrayAvoids) {
    if (Array.isArray(arrayAvoids) && arrayAvoids.length > 0) this.directionsAvoid = arrayAvoids
    else return new Error('arrayAvoids must be a array of strings')
  }

  /*********************************
  *
  *
  * GET METHODS
  *
  *
  **********************************/

  getCountryCode() {
    return this.countryCode
  }

  getLanguage() {
    return this.language
  }

  getGeocodeMode() {
    return this.geocodeMode
  }

  getGoogleMapsApiKey() {
    return this.googleMapsApiKey
  }
}

export default new GMapsRouting()
