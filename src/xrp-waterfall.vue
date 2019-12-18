<template>
  <div id="xrp_waterfall" ref="xrp_waterfall">
    <Canvas   v-bind:settings="settings"
              ref="canvas" />

    <Marquee  v-bind:settings="settings"
              ref="marquee" />

    <Settings v-bind:settings="settings"
              ref="settings" />

    <div id="xrp_waterfall_connecting"
         v-if="connecting">
      Connecting
    </div>
  </div>
</template>

<script>
import Canvas   from './components/Canvas.vue'
import Marquee  from './components/Marquee.vue'
import Settings from './components/Settings.vue'

var HasWebSocket = require('./mixins/websocket')

///

export default {
  name: 'XRPWaterfall',

  mixins : [HasWebSocket],

  components : {
    Canvas,
    Marquee,
    Settings
  },

  data : function(){
    return {
      settings : {
        canvas_columns       : 128,
        canvas_speed         : 50,
        canvas_clear_opacity : 0.05,

        marquee_speed        : 10000,
        marquee_enabled      : true
      }
    };
  },

  methods : {
    on_tx : function(tx){
      this.$refs.canvas.on_tx(tx);
      this.$refs.marquee.on_tx(tx);
      this.$refs.settings.on_tx(tx);
    }
  },

  created : function(){
    this.init_ws();
    this.check_ws();
  }
}
</script>

<style scoped>
#xrp_waterfall{
  height: 100%;
  width:  100%;
}

#xrp_waterfall_connecting{
  position: absolute;
  top: 0;
  left: 0;

  animation: connecting_animation 0.8s infinite;
}

@keyframes connecting_animation{
    0%{ color: yellow;      }
   49%{ color: transparent; }
  100%{ color: yellow;      }
}
</style>
