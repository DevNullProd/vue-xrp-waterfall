<template>
  <div id="xrp_waterfall_marquee"
       v-on:mouseover="on_hover()"
       v-on:mouseleave="on_unhover()">
    <div v-for="i in (items.length-1)"
         class="xrp_waterfall_marquee_item"
         v-bind:style="{transform : 'translateX(' + items[i].pos + 'px)'}">
      <a v-bind:href="items[i].url">{{items[i].text}}</a>
    </div>
  </div>
</template>

<script>
var TxText = require('../mixins/tx_text').default
var TxType = require('../mixins/tx_type').default

const MAX_ITEMS =    7;
const TARGET    = -500;

// TODO color code text according to tx color

function create_default(){
  var items = new Array();
  for(var i = 0; i < MAX_ITEMS; i+= 1)
    items.push({tx   : null,
                hash : null,
                text : null,
                url  : null,
                pos  : TARGET});
  return items;
}

export default {
  name: 'Marquee',

  mixins : [TxText, TxType],

  props : {
    settings : Object,
  },

  data : function(){
    return {
      last_tx : new Date(),

      width : 0,
      items : create_default(),
      current : 0,

      id     : 0,

      pause  : false,
      timer  : null
    };
  },

  computed : {
    enabled : function(){
      return this.$props.settings.marquee_enabled;
    }
  },

  watch : {
    enabled : function(){
      this.reset();
    }
  },

  methods : {
    reset : function(){
      this.width   = this.$parent.$refs.xrp_waterfall.clientWidth;
      this.last_tx = new Date();

      for(var i = 0; i < this.items.length; i+= 1)
        this.items[i].pos = TARGET;
    },

    on_hover : function(){
      this.pause = true;
    },

    on_unhover : function(){
      this.pause = false;
    },

    on_tx : function(tx){
      if(this.pause || !this.enabled) return;
      if(this.items[this.current].pos > TARGET) return;

      var type = this.convert_type(tx["transaction"]['TransactionType']);
      var text = this.text_for(tx, type);
      if(!text) return;

      // TODO instead of time based blocker, check if current component is fully visible (plus margin)
      var now = new Date();
      if(now - this.last_tx < 750) return;
      this.last_tx = now;

      var hash = tx['transaction']['hash'];

      var content = this.items[this.current];
      content.tx   = tx;
      content.hash = hash;
      content.text = text;
      content.url  = "/tx/" + hash;
      content.pos  = this.width;

      this.current += 1;
      if(this.current >= this.items.length) this.current = 0;
    }
  },

  mounted : function(){
    // recompute dimensions on resize
    window.addEventListener('resize', this.reset);

    this.reset();

    this.timer = setInterval(function(){
      if(this.pause) return;

      for(var i = 0; i < this.items.length; i+= 1)
        this.items[i].pos -= 5;
    }.bind(this), 50);
  },

  beforeDestroy : function(){
    window.removeEventListener('resize', this.reset);

    if(this.timer)
      clearInterval(this.timer);
  }
}
</script>

<style scoped>
#xrp_waterfall_marquee {
  position: absolute;
  bottom: 0px;

  height:     20px;
  width:      100%;

  overflow:   hidden;
  word-break: break-all;

  background: black;
  color:      white;
  border:     none;

  cursor: pointer;
}

#xrp_waterfall_marquee a{
  color: white;
  text-decoration: none;
}

.xrp_waterfall_marquee_item{
  position: absolute;
}
</style>
