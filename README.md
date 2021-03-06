# gmaps-routing-lib

Lib to interact with geocoding e directions apis of google maps
Can be use as a normal npm package or a vuejs plugin
A vue 2 plugin to interact with google maps api that will query the google maps API to retrieve location results.
See it on [npm](https://www).

## Installation

```npm install --save gmaps-routing-lib```

## Test

```GOOGLEKEY='YOUR KEY' npm run test```

## How to initialize with Vue

```javascript
import { VuegMapsRouting } from "gmaps-routing-lib"

Vue.use(VuegMapsRouting, {
    geocodeMode: 'address',            // all options are optional, except google api key
    countryCode: null,
    language: null,
    requesTimeout: 20000,
    key: 'GOOGLE_MAPS_API_KEY'
})
```

## How to initialize like package

```javascript
import gMapsRouting from "gmaps-routing-lib"


gMapsRouting.setConfig({
  key: 'GOOGLE_MAPS_API_KEY',
  geocodeMode: 'lat-lng'
})
```

## Usage

### General usage

```javascript
  import gMapsRouting from "gmaps-routing-lib"
  gMapsRouting.[FUNCTION_NAME]
```

### General usage in Vue

```javascript
Vue.$gmapsrouting.[FUNCTION_NAME]
```

### Examples

```javascript
Vue.$gmapsrouting.setGeocodeMode('address') // address is default mode
var address = {
  address1: '1 Praça Mauá',
  address2: '',
  city: 'Rio de Janeiro',
  state: 'RJ',
  zip_code: '20081-240',
  country: 'Brazil'
}
Vue.$gmapsrouting.getGeocode(address).then(response => console.log(response))
```

Mode also can be passed as param

```javascript
var latObj = {
  lat: -22.894846,
  lng: -43.179744
}
Vue.$gmapsrouting.getGeocode(latObj, 'lat-lng').then(response => console.log(response))
```

By default result was reduced to a resumed object, if you want a full google response, set true as third parameter

```javascript
Vue.$gmapsrouting.getGeocode(address, null, true).then(fullResponse => console.log(fullResponse))
```

Its important to note that even if your country is set in the address object to the specified country, it is still possible to pull results from other countries. If you want to limit the results to a specific country, you must set the country code in the geocoder.

```javascript
Vue.$gmapsrouting.setCountryCode('CA');
```

[Click here for Country Codes](https://developers.google.com/maps/coverage)

#### Language

To get result in your language you should set language code in the geocoder

```javascript
Vue.$gmapsrouting.setLanguage('en') // this is default
```

## License

This project is covered under the MIT License. Feel free to use it wherever you like.

## Links

[Google Maps Directions API Developer Guide](https://developers.google.com/maps/documentation/directions/intro)
[Google Maps Geocoding API Developer Guide](https://developers.google.com/maps/documentation/geocoding/intro)