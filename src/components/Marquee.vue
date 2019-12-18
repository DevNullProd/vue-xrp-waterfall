<template>
  <div id="xrp_waterfall_marquee"
       v-on:mouseover="on_hover()"
       v-on:mouseleave="on_unhover()">
    <div v-for="i in items.length"
         class="xrp_waterfall_marquee_item"
         v-bind:ref="'xrp_waterfall_marquee_item_' + (i-1)"
         v-bind:style="{transform : 'translateX(' + items[i-1].pos + 'px)'}">
      <a v-bind:href="items[i-1].url">{{items[i-1].text}}</a>
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

      // ensure previous item is completely revealed
      var prev = (this.current == 0 ? MAX_ITEMS : this.current) - 1;
      var prev_item      = this.$refs['xrp_waterfall_marquee_item_' + prev][0];
      var prev_transform = parseInt(prev_item.style.transform.replace("translateX(", "").replace("px)", ""));
      var prev_right     = prev_transform + prev_item.clientWidth;

      // TODO if before we return here, queue up a few txs
      //      to be added inbetween closed ledgers for
      //      continuous marquee population (mantain this queue size
      //      and periodically add to marquee)
      if(prev_right > (this.width - 25)) return; // also add a little extra padding

      var hash = tx['transaction']['hash'];

      var content = this.items[this.current];
      content.tx   = tx;
      content.hash = hash;
      content.text = text;
      content.url  = "https://xrp1ntel.com/tx/" + hash;
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
