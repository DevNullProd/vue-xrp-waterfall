import Vue from 'vue'
import XRPWaterfall from '../src/index.js'
import App from './App.vue';

Vue.use(XRPWaterfall)

new Vue({
  el: '#app',
  render(h){ return h(App) }
})
