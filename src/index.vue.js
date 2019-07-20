import gMapsRouting from './index'

export default {
  install(Vue, options) {
    gMapsRouting.setConfig(options)
    Vue.$gmapsrouting = Vue.prototype.$gmapsrouting = gMapsRouting
  }
}
