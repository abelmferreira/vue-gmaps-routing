let isApiSetUp = false
let directionsService = null
let geocoderService = null

const loadApi = (options, loadCn = false) => {
  if (typeof document === 'undefined') {
    // Do nothing if run from server-side
    return
  }
  if (!isApiSetUp) {
    isApiSetUp = true

    const googleMapScript = document.createElement('SCRIPT')

    // Allow options to be an object.
    // This is to support more esoteric means of loading Google Maps,
    // such as Google for business
    // https://developers.google.com/maps/documentation/javascript/get-api-key#premium-auth
    if (typeof options !== 'object') {
      throw new Error('options should  be an object')
    }

    // libraries
    if (Array.prototype.isPrototypeOf(options.libraries)) {
      options.libraries = options.libraries.join(',')
    }

    if (window) {
      window['vueGoogleMapsInit'] = () => {
        directionsService = new google.maps.DirectionsService
        geocoderService = new google.maps.Geocoder()
        // let directionsDisplay = new google.maps.DirectionsRenderer
        console.log('function loaded')
        return ({ directionsService, geocoderService })
      }
    }

    options['callback'] = 'vueGoogleMapsInit'

    let baseUrl = 'https://maps.googleapis.com/'

    if (typeof loadCn === 'boolean' && loadCn === true) baseUrl = 'https://maps.google.cn/'

    console.log(options)

    let url = baseUrl + 'maps/api/js?' +
      Object.keys(options)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(options[key]))
        .join('&')
    
    console.log(url)

    googleMapScript.setAttribute('src', url)
    googleMapScript.setAttribute('async', '')
    googleMapScript.setAttribute('defer', '')
    document.head.appendChild(googleMapScript)
  } else {
    throw new Error('You already started the loading of google maps')
  }
}

export { loadApi }
export { isApiSetUp as loadedApi }
export { directionsService }
export { geocoderService }