/**
 * @class GMapsRouting
 * @description A class to get geocodes and directions from google...
 * @param configOptions - a config object with options set
 */

class GMapsRouting {
  constructor() {
    this.countryCode = null
    this.language = null
    this.mode = 'lat-lng'
    this.googleMapsApiKey = ''
    this.requesTimeout = 20000
    this.googleGeocodeMapsUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
  }

  setConfig(key, options = {}) {
    this.countryCode = options.countryCode || null
    this.language = options.language || null
    this.mode = options.mode === 'lat-lng' ? 'lat-lng' : 'address'
    this.requesTimeout = options.requesTimeout || this.requesTimeout
    this.googleMapsApiKey = key || options.key
  }

  async createRequestObject(url) {
    let xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return

        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response)
        } else if (xhr.readyState === 4 && xhr.status >= 400) {
          // "xhr.response.status": "INVALID_REQUEST" when send invalid URL to google
          resolve({ status: xhr.response.status, message: xhr.response.error_message, httpstatus: xhr.status })
        } else if (xhr.readyState === 4) {
          resolve(xhr.response)
        }
      }

      xhr.ontimeout = function() {
        resolve({ status: 'REQUEST_TIMEOUT', url: url, timeout: this.requesTimeout })
      }

      xhr.onerror = function() {
        resolve({ status: 'GENERAL_ERROR', url: url })
      }

      xhr.responseType = 'json'
      xhr.timeout = this.requesTimeout
      xhr.open('GET', url)
      xhr.send()
    })
  }

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

  getGeocode(dataObj, mode = this.mode, fullResponse = false) {
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

  setCountryCode(code) {
    this.countryCode = code
  }

  setLanguage(code) {
    this.language = code
  }

  setMode(mode) {
    this.mode = mode === 'address' ? mode : 'lat-lng'
  }

  setGoogleMapsApiKey(key) {
    this.googleMapsApiKey = key
  }

  setRequestTimeout(timeout) {
    if (Number.isInteger(timeout) && timeout > 0) this.requesTimeout = timeout
    else return new Error('Timeout param must be a positive number')
  }

  getCountryCode() {
    return this.countryCode
  }

  getLanguage() {
    return this.language
  }

  getMode() {
    return this.mode
  }

  getGoogleMapsApiKey() {
    return this.googleMapsApiKey
  }
}

export default new GMapsRouting()
