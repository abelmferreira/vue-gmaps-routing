/**
 * @class GMapsRouting
 * @description A class to get geocodes and directions from google...
 * @param configOptions - a config object with options set
 */

class GMapsRouting {
  constructor() {
    this.defaultCountryCode = null
    this.defaultLanguage = null
    this.defaultMode = 'lat-lng'
    this.googleMapsApiKey = ''
    this.requesTimeout = 20000
    this.googleMapsUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
  }

  setConfig(key, options = {}) {
    this.defaultCountryCode = options.defaultCountryCode || null
    this.defaultLanguage = options.defaultLanguage || null
    this.defaultMode = options.defaultMode === 'lat-lng' ? 'lat-lng' : 'address'
    this.googleMapsApiKey = key
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

  getDefaultUrl() {
    let url = this.googleMapsUrl

    url += '?key=' + encodeURIComponent(this.googleMapsApiKey)
    if (this.defaultCountryCode) {
      url += '&components=country:' + this.defaultCountryCode
    }
    if (this.defaultLanguage) {
      url += '&language=' + this.defaultLanguage
    }

    return url
  }

  getGeocode(dataObj, mode = this.defaultMode, fullResponse = false) {
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
    let url = this.getDefaultUrl()
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
    let url = this.getDefaultUrl()
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
      addressStr += locationObj.address_line_1 ? locationObj.address_line_1 + ' ' : ''
      addressStr += locationObj.address_line_2 ? locationObj.address_line_2 + ' ' : ''
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

  setDefaultCountryCode(code) {
    this.defaultCountryCode = code
  }

  setDefaultLanguage(code) {
    this.defaultLanguage = code
  }

  setDefaultMode(mode) {
    this.defaultMode = mode === 'address' ? mode : 'lat-lng'
  }

  setGoogleMapsApiKey(key) {
    this.googleMapsApiKey = key
  }

  setRequestTimeout(timeout) {
    if (Number.isInteger(timeout) && timeout > 0) this.requesTimeout = timeout
    else return new Error('Timeout param must be a positive number')
  }

  getDefaultCountryCode() {
    return this.defaultCountryCode
  }

  getDefaultLanguage() {
    return this.defaultLanguage
  }

  getDefaultMode() {
    return this.defaultMode
  }

  getGoogleMapsApiKey() {
    return this.googleMapsApiKey
  }
}

export default new GMapsRouting()
