<template>
  <canvas id='xrp_waterfall_canvas'
         ref='xrp_waterfall_canvas'
         v-bind:height="height"
         v-bind:width="width" />
</template>

<script>
import TxColors from '../mixins/tx_colors'
import TxType   from '../mixins/tx_type'

export default {
  name: 'Canvas',

  mixins : [TxColors, TxType],

  props : {
    settings : Object
  },

  data : function(){
    return {
      width  : 0,
      height : 0,

      color_queue : [],
      color_map   : [],
      columns     : [],
      speeds      : [],

      timer       : null,

      disabled    : false
    };
  },

  computed : {
    speed : function(){
      return this.settings.canvas_speed;
    },

    clear_opacity : function(){
      return this.settings.canvas_clear_opacity;
    },

    num_columns : function(){
      return this.settings.canvas_columns;
    },

    column_size : function(){
      return this.width / this.num_columns;
    },

    context : function(){
      return this.$refs.xrp_waterfall_canvas.getContext('2d');
    }
  },

  watch : {
    num_columns : function(){
      this.reset();
      this.resize();
    }
  },

  methods : {
    resize : function(){
      this.width  = this.$parent.$refs.xrp_waterfall.clientWidth;
      this.height = this.$parent.$refs.xrp_waterfall.clientHeight;

      // set point of canvas scaling & flip horizontally
      this.context.translate(this.width, 0);
      this.context.scale(-1, 1);
    },

    reset : function(){
      // Expand arrays if necessary
      if(this.columns.length < this.num_columns){
        for(var i = this.columns.length; i < this.num_columns; i++){
          this.color_map[i] = null;
          this.columns[i]   = 1;
          this.speeds[i]    = 0;
        }
      }

      this.color_queue = [];
      this.columns.map(function(value, index){
        this.columns[index]   = 0;
        this.speeds[index]    = 0;
        this.color_map[index] = null;
      }.bind(this));

      if(this.timer)
        clearInterval(this.timer);

      this.timer = setInterval(this.step, this.speed);
    },

    toggle : function(){
      this.disabled = !this.disabled;
    },

    step : function(){
      this.context.fillStyle = 'rgba(0,0,0,' + this.clear_opacity + ')';
      this.context.fillRect(0, 0, this.width, this.height);

      for(var index = 0; index < this.num_columns; index++){
        if(this.color_map[index] == null)
          continue;

        var color = this.color_map[index];
        this.context.fillStyle = color;

        var col   = index * this.column_size;
        var row   = this.columns[index];
        var speed = this.speeds[index];

        var character = String.fromCharCode(12448 + Math.random() * 80);
        this.context.fillText(character, col, row);

        if(row > 756 + Math.random() * 5e3){
          this.columns[index]   =    1;
          this.color_map[index] = null;
        }else
          this.columns[index] = row + speed;
      }

      for(var index = 0; index < this.color_queue.length; ++index){
        var open_cols = [];
        for(var map_index = 0; map_index < this.color_map.length; map_index++)
          if(this.color_map[map_index] == null)
            open_cols.push(map_index);

        if(open_cols.length == 0)
          break;

        var col = open_cols[Math.floor(Math.random()*open_cols.length)];
        this.color_map[col] = this.color_queue.shift();
        this.speeds[col]    = 15 * Math.random() + 3;
      }
    },

    on_tx : function(tx){
      var type = this.convert_type(tx["transaction"]['TransactionType']);
      var color = this.color_for(type);

      // Cap color queue length
      // TODO render colors proportionally to amount of
      //      recent transactions received (instead of per specific tx)
      if(!this.hidden && this.color_queue.length < 250)
        this.color_queue.push(color);
    }
  },

  mounted : function(){
    // XXX: setTimeout is really hacky but even w/ $nextTick, resize
    //      is being fired before acurate height can be read
    //      (perhaps because css isn't applied yet?)
    //      Need to further investigate
    setTimeout(function(){
      // XXX: $refs not available until mounted, recompute computed
      this.resize();
    }.bind(this), 250);

    // recompute dimensions on resize
    window.addEventListener('resize', this.resize);

    // toggle on visibility changes
    document.addEventListener('visibilitychange', this.toggle);

    this.reset();
  },

  beforeDestroy : function(){
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.toggle);
  }
}
</script>
