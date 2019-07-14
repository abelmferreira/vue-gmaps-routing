import gMapsRouting from '.'

describe('GMapsRouting', () => {
  const key = process.env.GOOGLEKEY

  const options = {
    countryCode: null,
    language: null,
    mode: 'address'
  }

  let addressObj = {
    address1: '1 Praça Mauá',
    address2: '',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip_code: '20081-240',
    country: 'Brazil'
  }

  var invalidLatLng = {
    lat: 'not lat',
    lng: 'not long'
  }

  var latLngObj = {
    lat: -22.894846,
    lng: -43.179744
  }

  beforeEach(() => {
    gMapsRouting.setConfig(key, options)
  })

  test('should return lat and long from adress object with default mode set to address', async () => {
    let expected = { status: 'OK', location: {} }
    let testeResult = await gMapsRouting.getGeocode(addressObj).then(result => result)
    // console.log(JSON.stringify(testeResult))

    expect(testeResult).toMatchObject(expected)
    expect(testeResult.location.lat).toBeGreaterThanOrEqual(-90)
    expect(testeResult.location.lat).toBeLessThanOrEqual(90)
    expect(testeResult.location.lng).toBeGreaterThanOrEqual(-180)
    expect(testeResult.location.lng).toBeLessThanOrEqual(180)
  })

  test('should return lat and long from adress object with full response and mode diferent from default', async () => {
    gMapsRouting.setMode('lat-lng')

    let expected = { status: 'OK' }
    let testeResult = await gMapsRouting.getGeocode(addressObj, 'address', true).then(result => result)
    // console.log(JSON.stringify(testeResult))

    expect(testeResult).toMatchObject(expected)
    expect(testeResult).toHaveProperty('results')
  })

  it('should return address from lat and long object', async () => {
    let testeResult = await gMapsRouting.getGeocode(latLngObj, 'lat-lng')
    // console.log(JSON.stringify(testeResult))

    expect(testeResult).toMatchObject({ status: 'OK' })
    expect(testeResult).toHaveProperty('addresses')
  })

  it('should fail response when passing invalid lat and logn values', async () => {
    let testeResult = await gMapsRouting.getGeocode(invalidLatLng, 'lat-lng')
    // console.log(JSON.stringify(testeResult))

    expect(testeResult).toMatchObject({ status: 'INVALID_REQUEST' })
  })

  it('should test url get timeout', async () => {
    // Test not implemented
  })
})
