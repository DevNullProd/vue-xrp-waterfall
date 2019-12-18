<template>
  <div>
    <div id="xrp_waterfall_settings_toggle"
         v-on:click="toggle"
         v-bind:style="{right: toggle_pos + 'px'}">
      ⚙
    </div>

    <div id="xrp_waterfall_settings"
         v-bind:style="{right: settings_pos + 'px'}">
      <p><b>XRP Transaction Waterfall</b></p>
      <p>
        Each transaction on the live XRP network is
        rendered in color here.
      </p>

      <p><b>Transaction Types</b></p>
      <TxTallies ref="tallies" />

      <p><b>Speed</b></p>
      <Slider v-model="speed" />

      <p><b>Columns</b></p>
      <Slider v-model="columns" />

      <p><b>Tail Length</b></p>
      <Slider v-model="tail" />

      <p><b>Show Marquee</b></p>
      <input id="xrp_waterfall_enable_marquee_toggle"
             type='checkbox'
             v-model="enable_marquee" />

      <div style="clear: both"></div>

      <hr />

      <div style="text-align: center">
      <b>Tip</b><br/>
      Press <b>&lt;F11&gt;</b> for fullscreen<br/>
      (makes a great screensaver)
      </div>
    </div>
  </div>
</template>

<script>
import TxTallies from './TxTallies.vue'
import Slider from './Slider.vue'


export default {
  name: 'Settings',

  components : {
    TxTallies,
    Slider
  },

  props : {
    settings : Object
  },

  data : function(){
    return {
      toggled : false,

      toggle_pos : 0,
      offset : 360,

      base_speed   : 50,
      base_columns : 50, // XXX: keep synchronized w/ default canvas_columns in XRPWaterfall component
      base_tail    : 100 // XXX: keep synchronized w/ default canvas_clear_opacity in XRPWaterfall component
    };
  },

  computed : {
    settings_pos : function(){
      return this.toggle_pos - this.offset;
    },

    speed : {
      get : function(){
        return this.base_speed;
      },

      set : function(v){
        this.base_speed = parseInt(v);

        // set marquee speed, range: 15000 -> 500
        this.settings.marquee_speed =
          15000 - this.base_speed * 1000;

        // set canvas speed, range: 75 -> 25
        this.settings.canvas_speed =
          75 - this.base_speed * 0.5;
      }
    },

    columns : {
      get : function(){
        return this.base_columns;
      },

      set : function(v){
        this.base_columns = parseInt(v);

        // set canvas_columns from base, range: 32 -> 256
        this.settings.canvas_columns =
          (this.base_columns * 224) + 32;
      }
    },

    tail : {
      get : function(){
        return this.base_tail;
      },

      set : function(v){
        this.base_tail = parseInt(v);

        // set clear_opacity from base, range: 0.5 -> 0.05
        this.settings.canvas_clear_opacity =
          ((99-(this.base_tail-1))/90*0.45)+0.05;
      }
    },

    enable_marquee : {
      get : function(){
        return this.settings.marquee_enabled;
      },

      set : function(v){
        this.settings.marquee_enabled = v;
      }
    }
  },

  methods : {
    toggle : function(){
      this.toggled = !this.toggled;
      this.toggle_pos += (this.toggled ? 1 : -1) * this.offset;
    },

    on_tx : function(tx){
      this.$refs.tallies.on_tx(tx);
    }
  }
}
</script>

<style scoped>
#xrp_waterfall_settings_toggle{
  position: absolute;
  top: 0px;

  font-size: 1.5em;
  color: yellow;

  padding: 5px;

  cursor: pointer;
}

#xrp_waterfall_settings{
  position: absolute;
  top: 0px;

  border: 1px solid black;
  background-color: rgba(255, 255, 255, 0.75);

  max-width: 350px;
  padding: 5px;
}

#xrp_waterfall_settings b{
  margin: 0;
}

#xrp_waterfall_enable_marquee_toggle{
  float: right;
}
</style>
