import Vue from 'vue'
import App from './App.vue';

import XRPWaterfall from '../src/index.js'

// If installing this from npm installed plugin, eg
//   import XRPWaterfall from 'vue-xrp-waterfall'
// Also be sure to import css!
//   import 'vue-xrp-waterfall/dist/vue-xrp-waterfall.css'

Vue.use(XRPWaterfall)

new Vue({
  el: '#app',
  render(h){ return h(App) }
})
