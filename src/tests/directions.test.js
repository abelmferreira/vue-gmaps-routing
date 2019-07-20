import gMapsRouting from '../'

describe('Directions tests', () => {
  let directionsOriginLatLng = {
    lat: -22.894846,
    lng: -43.179744
  }

  let directionsOriginAddress = {
    address1: '1 Praça Mauá',
    address2: '',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip_code: '20081-240',
    country: 'Brasil'
  }

  let directionsDestinationLatLng = {
    lat: -23.0037324,
    lng: -43.3172683
  }

  let directionsDestination = {
    address1: '500 Av das Americas',
    address2: '',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip_code: '22640-100',
    country: 'Brasil'
  }

  const options = {
    key: process.env.GOOGLEKEY,
    language: 'pt-BR',
    directionsOrigin: directionsOriginLatLng
  }

  beforeEach(() => {
    gMapsRouting.setConfig(options)
  })

  test('should return a direction when pass latlng origin and text destination adress', async () => {
    let expected = { status: 'OK' }

    let testeResult = await gMapsRouting.getDirections(directionsDestination).then(result => result)

    // console.log(JSON.stringify(testeResult))

    expect(testeResult).toMatchObject(expected)
  })
})
