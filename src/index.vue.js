import gMapsRouting from './index'

export default {
  install(Vue, options) {
    gMapsRouting.setConfig(options.key, options)
    Vue.$gmapsrouting = Vue.prototype.$gmapsrouting = gMapsRouting
  }
}
