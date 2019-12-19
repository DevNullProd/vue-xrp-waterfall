(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global['vue-xrp-waterfall'] = factory());
}(this, (function () { 'use strict';

  var DEFAULT_COLOR = "#3498db";
  var TxColors = {
    methods: {
      color_for: function color_for(tx_type) {
        var color = DEFAULT_COLOR;
        if (tx_type == 'payment') color = '#0F0';else if (tx_type == 'offer_create') color = '#269bae';else if (tx_type == 'offer_cancel') color = '#F00';else if (tx_type == 'trust_set') color = '#e59866';else if (tx_type == 'escrow_create') color = '#aea226';else if (tx_type == 'escrow_finish') color = '#f9ff33';else if (tx_type == 'account_set') color = '#633974';
        return color;
      }
    }
  };

  var TxType = {
    methods: {
      convert_type: function convert_type(tx_type) {
        return tx_type.split(/(?=[A-Z])/).join('_').toLowerCase();
      }
    }
  };

  //
  var script = {
    name: 'Canvas',
    mixins: [TxColors, TxType],
    props: {
      settings: Object
    },
    data: function data() {
      return {
        width: 0,
        height: 0,
        color_queue: [],
        color_map: [],
        columns: [],
        speeds: [],
        timer: null,
        disabled: false
      };
    },
    computed: {
      speed: function speed() {
        return this.settings.canvas_speed;
      },
      clear_opacity: function clear_opacity() {
        return this.settings.canvas_clear_opacity;
      },
      num_columns: function num_columns() {
        return this.settings.canvas_columns;
      },
      column_size: function column_size() {
        return this.width / this.num_columns;
      },
      context: function context() {
        return this.$refs.xrp_waterfall_canvas.getContext('2d');
      }
    },
    watch: {
      num_columns: function num_columns() {
        this.reset();
        this.resize();
      }
    },
    methods: {
      resize: function resize() {
        this.width = this.$parent.$refs.xrp_waterfall.clientWidth;
        this.height = this.$parent.$refs.xrp_waterfall.clientHeight; // set point of canvas scaling & flip horizontally

        this.context.translate(this.width, 0);
        this.context.scale(-1, 1);
      },
      reset: function reset() {
        // Expand arrays if necessary
        if (this.columns.length < this.num_columns) {
          for (var i = this.columns.length; i < this.num_columns; i++) {
            this.color_map[i] = null;
            this.columns[i] = 1;
            this.speeds[i] = 0;
          }
        }

        this.color_queue = [];
        this.columns.map(function (value, index) {
          this.columns[index] = 0;
          this.speeds[index] = 0;
          this.color_map[index] = null;
        }.bind(this));
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(this.step, this.speed);
      },
      toggle: function toggle() {
        this.disabled = !this.disabled;
      },
      step: function step() {
        this.context.fillStyle = 'rgba(0,0,0,' + this.clear_opacity + ')';
        this.context.fillRect(0, 0, this.width, this.height);

        for (var index = 0; index < this.num_columns; index++) {
          if (this.color_map[index] == null) continue;
          var color = this.color_map[index];
          this.context.fillStyle = color;
          var col = index * this.column_size;
          var row = this.columns[index];
          var speed = this.speeds[index];
          var character = String.fromCharCode(12448 + Math.random() * 80);
          this.context.fillText(character, col, row);

          if (row > 756 + Math.random() * 5e3) {
            this.columns[index] = 1;
            this.color_map[index] = null;
          } else this.columns[index] = row + speed;
        }

        for (var index = 0; index < this.color_queue.length; ++index) {
          var open_cols = [];

          for (var map_index = 0; map_index < this.color_map.length; map_index++) {
            if (this.color_map[map_index] == null) open_cols.push(map_index);
          }

          if (open_cols.length == 0) break;
          var col = open_cols[Math.floor(Math.random() * open_cols.length)];
          this.color_map[col] = this.color_queue.shift();
          this.speeds[col] = 15 * Math.random() + 3;
        }
      },
      on_tx: function on_tx(tx) {
        var type = this.convert_type(tx["transaction"]['TransactionType']);
        var color = this.color_for(type); // Cap color queue length
        // TODO render colors proportionally to amount of
        //      recent transactions received (instead of per specific tx)

        if (!this.hidden && this.color_queue.length < 250) this.color_queue.push(color);
      }
    },
    mounted: function mounted() {
      // XXX: setTimeout is really hacky but even w/ $nextTick, resize
      //      is being fired before acurate height can be read
      //      (perhaps because css isn't applied yet?)
      //      Need to further investigate
      setTimeout(function () {
        // XXX: $refs not available until mounted, recompute computed
        this.resize();
      }.bind(this), 250); // recompute dimensions on resize

      window.addEventListener('resize', this.resize); // toggle on visibility changes

      document.addEventListener('visibilitychange', this.toggle);
      this.reset();
    },
    beforeDestroy: function beforeDestroy() {
      window.removeEventListener('resize', this.resize);
      document.removeEventListener('visibilitychange', this.toggle);
    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  const isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('canvas',{ref:"xrp_waterfall_canvas",attrs:{"id":"xrp_waterfall_canvas","height":_vm.height,"width":_vm.width}})};
  var __vue_staticRenderFns__ = [];

    /* style */
    const __vue_inject_styles__ = undefined;
    /* scoped */
    const __vue_scope_id__ = undefined;
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__ = normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      undefined,
      undefined,
      undefined
    );

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  var DROPS_PER_XRP = 1000000; // TODO improve formatting, link to accounts, tags

  var TxText = {
    methods: {
      round: function round(value, decimals) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
      },
      format_account: function format_account(account) {
        return account.substring(0, 7) + "...";
      },
      format_amount: function format_amount(amount) {
        if (_typeof(amount) === "object") return this.round(parseFloat(amount['value']), 3) + ' ' + amount['currency'] + ' (' + this.format_account(amount['issuer']) + ')';else return this.round(parseInt(amount) / DROPS_PER_XRP, 3) + " XRP";
      },
      text_for: function text_for(tx, type) {
        var txo = tx['transaction'];
        if (type == 'payment') return this.format_account(txo['Account']) + ' -> ' + this.format_amount(txo['Amount']) + ' -> ' + this.format_account(txo['Destination']);else if (type == 'offer_create') return this.format_amount(txo['TakerGets']) + ' / ' + this.format_amount(txo['TakerPays']);else if (type == 'trust_set') return this.format_account(txo['Account']) + ' Extended Trust To ' + this.format_account(txo['LimitAmount']['issuer']); // TODO other tx text description

        return null;
      }
    }
  };

  //
  var MAX_ITEMS = 7;
  var TARGET = -500; // TODO color code text according to tx color

  function create_default() {
    var items = new Array();

    for (var i = 0; i < MAX_ITEMS; i += 1) {
      items.push({
        tx: null,
        hash: null,
        text: null,
        url: null,
        pos: TARGET
      });
    }

    return items;
  }

  var script$1 = {
    name: 'Marquee',
    mixins: [TxText, TxType],
    props: {
      settings: Object
    },
    data: function data() {
      return {
        width: 0,
        items: create_default(),
        current: 0,
        id: 0,
        pause: false,
        timer: null
      };
    },
    computed: {
      enabled: function enabled() {
        return this.$props.settings.marquee_enabled;
      }
    },
    watch: {
      enabled: function enabled() {
        this.reset();
      }
    },
    methods: {
      reset: function reset() {
        this.width = this.$parent.$refs.xrp_waterfall.clientWidth;

        for (var i = 0; i < this.items.length; i += 1) {
          this.items[i].pos = TARGET;
        }
      },
      on_hover: function on_hover() {
        this.pause = true;
      },
      on_unhover: function on_unhover() {
        this.pause = false;
      },
      on_tx: function on_tx(tx) {
        if (this.pause || !this.enabled) return;
        if (this.items[this.current].pos > TARGET) return;
        var type = this.convert_type(tx["transaction"]['TransactionType']);
        var text = this.text_for(tx, type);
        if (!text) return; // ensure previous item is completely revealed

        var prev = (this.current == 0 ? MAX_ITEMS : this.current) - 1;
        var prev_item = this.$refs['xrp_waterfall_marquee_item_' + prev][0];
        var prev_transform = parseInt(prev_item.style.transform.replace("translateX(", "").replace("px)", ""));
        var prev_right = prev_transform + prev_item.clientWidth; // TODO if before we return here, queue up a few txs
        //      to be added inbetween closed ledgers for
        //      continuous marquee population (mantain this queue size
        //      and periodically add to marquee)

        if (prev_right > this.width - 25) return; // also add a little extra padding

        var hash = tx['transaction']['hash'];
        var content = this.items[this.current];
        content.tx = tx;
        content.hash = hash;
        content.text = text;
        content.url = "https://xrp1ntel.com/tx/" + hash;
        content.pos = this.width;
        this.current += 1;
        if (this.current >= this.items.length) this.current = 0;
      }
    },
    mounted: function mounted() {
      // recompute dimensions on resize
      window.addEventListener('resize', this.reset);
      this.reset();
      this.timer = setInterval(function () {
        if (this.pause) return;

        for (var i = 0; i < this.items.length; i += 1) {
          this.items[i].pos -= 5;
        }
      }.bind(this), 50);
    },
    beforeDestroy: function beforeDestroy() {
      window.removeEventListener('resize', this.reset);
      if (this.timer) clearInterval(this.timer);
    }
  };

  /* script */
  const __vue_script__$1 = script$1;
  /* template */
  var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"xrp_waterfall_marquee"},on:{"mouseover":function($event){return _vm.on_hover()},"mouseleave":function($event){return _vm.on_unhover()}}},_vm._l((_vm.items.length),function(i){return _c('div',{ref:'xrp_waterfall_marquee_item_' + (i-1),refInFor:true,staticClass:"xrp_waterfall_marquee_item",style:({transform : 'translateX(' + _vm.items[i-1].pos + 'px)'})},[_c('a',{attrs:{"href":_vm.items[i-1].url}},[_vm._v(_vm._s(_vm.items[i-1].text))])])}),0)};
  var __vue_staticRenderFns__$1 = [];

    /* style */
    const __vue_inject_styles__$1 = undefined;
    /* scoped */
    const __vue_scope_id__$1 = "data-v-1c12bacd";
    /* module identifier */
    const __vue_module_identifier__$1 = undefined;
    /* functional template */
    const __vue_is_functional_template__$1 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$1 = normalizeComponent(
      { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
      __vue_inject_styles__$1,
      __vue_script__$1,
      __vue_scope_id__$1,
      __vue_is_functional_template__$1,
      __vue_module_identifier__$1,
      false,
      undefined,
      undefined,
      undefined
    );

  //
  var script$2 = {
    name: 'TxTallies',
    mixins: [TxColors, TxType],
    data: function data() {
      return {
        tallies: {
          payment: 0,
          offer_create: 0,
          offer_cancel: 0,
          trust_set: 0,
          escrow_create: 0,
          escrow_finish: 0,
          account_set: 0
        }
      };
    },
    methods: {
      on_tx: function on_tx(tx) {
        var type = this.convert_type(tx["transaction"]['TransactionType']);
        this.tallies[type] += 1;
      }
    }
  };

  /* script */
  const __vue_script__$2 = script$2;
  /* template */
  var __vue_render__$2 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('ul',{attrs:{"id":"xrp_waterfall_tx_tallies"}},[_c('li',{style:({color : _vm.color_for('payment')})},[_vm._v("\n    Payment\n    "),_c('span',{staticClass:"tx_tally"},[_vm._v(_vm._s(_vm.tallies.payment))]),_vm._v(" "),_c('div',{staticClass:"tx_tally_after"})]),_vm._v(" "),_c('li',{style:({color : _vm.color_for('offer_create')})},[_vm._v("\n    OfferCreate\n    "),_c('span',{staticClass:"tx_tally"},[_vm._v(_vm._s(_vm.tallies.offer_create))]),_vm._v(" "),_c('div',{staticClass:"tx_tally_after"})]),_vm._v(" "),_c('li',{style:({color : _vm.color_for('offer_cancel')})},[_vm._v("\n    OfferCancel\n    "),_c('span',{staticClass:"tx_tally"},[_vm._v(_vm._s(_vm.tallies.offer_cancel))]),_vm._v(" "),_c('div',{staticClass:"tx_tally_after"})]),_vm._v(" "),_c('li',{style:({color : _vm.color_for('trust_set')})},[_vm._v("\n    TrustSet\n    "),_c('span',{staticClass:"tx_tally"},[_vm._v(_vm._s(_vm.tallies.trust_set))]),_vm._v(" "),_c('div',{staticClass:"tx_tally_after"})]),_vm._v(" "),_c('li',{style:({color : _vm.color_for('escrow_create')})},[_vm._v("\n    EscrowCreate\n    "),_c('span',{staticClass:"tx_tally"},[_vm._v(_vm._s(_vm.tallies.escrow_create))]),_vm._v(" "),_c('div',{staticClass:"tx_tally_after"})]),_vm._v(" "),_c('li',{style:({color : _vm.color_for('escrow_finish')})},[_vm._v("\n    EscrowFinish\n    "),_c('span',{staticClass:"tx_tally"},[_vm._v(_vm._s(_vm.tallies.escrow_finish))]),_vm._v(" "),_c('div',{staticClass:"tx_tally_after"})]),_vm._v(" "),_c('li',{style:({color : _vm.color_for('account_set')})},[_vm._v("\n    AccountSet\n    "),_c('span',{staticClass:"tx_tally"},[_vm._v(_vm._s(_vm.tallies.account_set))]),_vm._v(" "),_c('div',{staticClass:"tx_tally_after"})])])};
  var __vue_staticRenderFns__$2 = [];

    /* style */
    const __vue_inject_styles__$2 = undefined;
    /* scoped */
    const __vue_scope_id__$2 = "data-v-d0fe4c20";
    /* module identifier */
    const __vue_module_identifier__$2 = undefined;
    /* functional template */
    const __vue_is_functional_template__$2 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$2 = normalizeComponent(
      { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
      __vue_inject_styles__$2,
      __vue_script__$2,
      __vue_scope_id__$2,
      __vue_is_functional_template__$2,
      __vue_module_identifier__$2,
      false,
      undefined,
      undefined,
      undefined
    );

  //
  //
  //
  //
  //
  //
  //
  var script$3 = {
    name: 'Slider',
    props: {
      // 0 = min, 100 = max
      value: Number
    }
  };

  /* script */
  const __vue_script__$3 = script$3;
  /* template */
  var __vue_render__$3 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('input',{staticClass:"slider",attrs:{"type":"range"},domProps:{"value":_vm.value},on:{"input":function($event){return _vm.$emit('input', $event.target.value)}}})};
  var __vue_staticRenderFns__$3 = [];

    /* style */
    const __vue_inject_styles__$3 = undefined;
    /* scoped */
    const __vue_scope_id__$3 = "data-v-fcdbf3d0";
    /* module identifier */
    const __vue_module_identifier__$3 = undefined;
    /* functional template */
    const __vue_is_functional_template__$3 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$3 = normalizeComponent(
      { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
      __vue_inject_styles__$3,
      __vue_script__$3,
      __vue_scope_id__$3,
      __vue_is_functional_template__$3,
      __vue_module_identifier__$3,
      false,
      undefined,
      undefined,
      undefined
    );

  //
  var script$4 = {
    name: 'Settings',
    components: {
      TxTallies: __vue_component__$2,
      Slider: __vue_component__$3
    },
    props: {
      settings: Object
    },
    data: function data() {
      return {
        toggled: false,
        toggle_pos: 0,
        offset: 360,
        base_speed: 50,
        base_columns: 50,
        // XXX: keep synchronized w/ default canvas_columns in XRPWaterfall component
        base_tail: 100 // XXX: keep synchronized w/ default canvas_clear_opacity in XRPWaterfall component

      };
    },
    computed: {
      settings_pos: function settings_pos() {
        return this.toggle_pos - this.offset;
      },
      speed: {
        get: function get() {
          return this.base_speed;
        },
        set: function set(v) {
          this.base_speed = parseInt(v); // set marquee speed, range: 15000 -> 500

          this.settings.marquee_speed = 15000 - this.base_speed * 1000; // set canvas speed, range: 75 -> 25

          this.settings.canvas_speed = 75 - this.base_speed * 0.5;
        }
      },
      columns: {
        get: function get() {
          return this.base_columns;
        },
        set: function set(v) {
          this.base_columns = parseInt(v); // set canvas_columns from base, range: 32 -> 256

          this.settings.canvas_columns = this.base_columns * 224 + 32;
        }
      },
      tail: {
        get: function get() {
          return this.base_tail;
        },
        set: function set(v) {
          this.base_tail = parseInt(v); // set clear_opacity from base, range: 0.5 -> 0.05

          this.settings.canvas_clear_opacity = (99 - (this.base_tail - 1)) / 90 * 0.45 + 0.05;
        }
      },
      enable_marquee: {
        get: function get() {
          return this.settings.marquee_enabled;
        },
        set: function set(v) {
          this.settings.marquee_enabled = v;
        }
      }
    },
    methods: {
      toggle: function toggle() {
        this.toggled = !this.toggled;
        this.toggle_pos += (this.toggled ? 1 : -1) * this.offset;
      },
      on_tx: function on_tx(tx) {
        this.$refs.tallies.on_tx(tx);
      }
    }
  };

  /* script */
  const __vue_script__$4 = script$4;
  /* template */
  var __vue_render__$4 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',{style:({right: _vm.toggle_pos + 'px'}),attrs:{"id":"xrp_waterfall_settings_toggle"},on:{"click":_vm.toggle}},[_vm._v("\n    ⚙\n  ")]),_vm._v(" "),_c('div',{style:({right: _vm.settings_pos + 'px'}),attrs:{"id":"xrp_waterfall_settings"}},[_vm._m(0),_vm._v(" "),_c('p',[_vm._v("\n      Each transaction on the live XRP network is\n      rendered in color here.\n    ")]),_vm._v(" "),_vm._m(1),_vm._v(" "),_c('TxTallies',{ref:"tallies"}),_vm._v(" "),_vm._m(2),_vm._v(" "),_c('Slider',{model:{value:(_vm.speed),callback:function ($$v) {_vm.speed=$$v;},expression:"speed"}}),_vm._v(" "),_vm._m(3),_vm._v(" "),_c('Slider',{model:{value:(_vm.columns),callback:function ($$v) {_vm.columns=$$v;},expression:"columns"}}),_vm._v(" "),_vm._m(4),_vm._v(" "),_c('Slider',{model:{value:(_vm.tail),callback:function ($$v) {_vm.tail=$$v;},expression:"tail"}}),_vm._v(" "),_vm._m(5),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.enable_marquee),expression:"enable_marquee"}],attrs:{"id":"xrp_waterfall_enable_marquee_toggle","type":"checkbox"},domProps:{"checked":Array.isArray(_vm.enable_marquee)?_vm._i(_vm.enable_marquee,null)>-1:(_vm.enable_marquee)},on:{"change":function($event){var $$a=_vm.enable_marquee,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.enable_marquee=$$a.concat([$$v]));}else{$$i>-1&&(_vm.enable_marquee=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else{_vm.enable_marquee=$$c;}}}}),_vm._v(" "),_c('div',{staticStyle:{"clear":"both"}}),_vm._v(" "),_c('hr'),_vm._v(" "),_vm._m(6)],1)])};
  var __vue_staticRenderFns__$4 = [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',[_c('b',[_vm._v("XRP Transaction Waterfall")])])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',[_c('b',[_vm._v("Transaction Types")])])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',[_c('b',[_vm._v("Speed")])])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',[_c('b',[_vm._v("Columns")])])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',[_c('b',[_vm._v("Tail Length")])])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',[_c('b',[_vm._v("Show Marquee")])])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticStyle:{"text-align":"center"}},[_c('b',[_vm._v("Tip")]),_c('br'),_vm._v("\n    Press "),_c('b',[_vm._v("<F11>")]),_vm._v(" for fullscreen"),_c('br'),_vm._v("\n    (makes a great screensaver)\n    ")])}];

    /* style */
    const __vue_inject_styles__$4 = undefined;
    /* scoped */
    const __vue_scope_id__$4 = "data-v-2bca1bb4";
    /* module identifier */
    const __vue_module_identifier__$4 = undefined;
    /* functional template */
    const __vue_is_functional_template__$4 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$4 = normalizeComponent(
      { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
      __vue_inject_styles__$4,
      __vue_script__$4,
      __vue_scope_id__$4,
      __vue_is_functional_template__$4,
      __vue_module_identifier__$4,
      false,
      undefined,
      undefined,
      undefined
    );

  var WS_TIMEOUT = 7500;
  var websocket = {
    data: function data() {
      return {
        ws: null,
        last_tx_time: new Date(),
        connecting: true
      };
    },
    methods: {
      init_ws: function init_ws() {
        this.ws = new WebSocket("wss://s1.ripple.com:443");

        this.ws.onopen = function () {
          var json = JSON.stringify({
            'command': 'subscribe',
            'streams': ["transactions"]
          });
          this.ws.send(json);
        }.bind(this);

        this.ws.onmessage = function (event) {
          var json = JSON.parse(event.data);
          if (!json["transaction"]) return;
          this.connecting = false;
          this.last_tx_time = new Date();
          this.on_tx(json);
        }.bind(this);
      },
      check_ws: function check_ws() {
        // periodically check connection
        setInterval(function () {
          var now = new Date();

          if (now - this.last_tx_time > WS_TIMEOUT) {
            this.connecting = true;
            this.ws.close();
            this.init_ws();
            this.last_tx_time = now;
          }
        }.bind(this), 1500);
      }
    }
  };

  //

  var script$5 = {
    name: 'XRPWaterfall',
    mixins: [websocket],
    components: {
      Canvas: __vue_component__,
      Marquee: __vue_component__$1,
      Settings: __vue_component__$4
    },
    data: function data() {
      return {
        settings: {
          canvas_columns: 128,
          canvas_speed: 50,
          canvas_clear_opacity: 0.05,
          marquee_speed: 10000,
          marquee_enabled: true
        }
      };
    },
    methods: {
      on_tx: function on_tx(tx) {
        this.$refs.canvas.on_tx(tx);
        this.$refs.marquee.on_tx(tx);
        this.$refs.settings.on_tx(tx);
      }
    },
    created: function created() {
      this.init_ws();
      this.check_ws();
    }
  };

  /* script */
  const __vue_script__$5 = script$5;
  /* template */
  var __vue_render__$5 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"xrp_waterfall",attrs:{"id":"xrp_waterfall"}},[_c('Canvas',{ref:"canvas",attrs:{"settings":_vm.settings}}),_vm._v(" "),_c('Marquee',{ref:"marquee",attrs:{"settings":_vm.settings}}),_vm._v(" "),_c('Settings',{ref:"settings",attrs:{"settings":_vm.settings}}),_vm._v(" "),(_vm.connecting)?_c('div',{attrs:{"id":"xrp_waterfall_connecting"}},[_vm._v("\n    Connecting\n  ")]):_vm._e()],1)};
  var __vue_staticRenderFns__$5 = [];

    /* style */
    const __vue_inject_styles__$5 = undefined;
    /* scoped */
    const __vue_scope_id__$5 = "data-v-480b1183";
    /* module identifier */
    const __vue_module_identifier__$5 = undefined;
    /* functional template */
    const __vue_is_functional_template__$5 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$5 = normalizeComponent(
      { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
      __vue_inject_styles__$5,
      __vue_script__$5,
      __vue_scope_id__$5,
      __vue_is_functional_template__$5,
      __vue_module_identifier__$5,
      false,
      undefined,
      undefined,
      undefined
    );

  var index = {
    install: function install(vue, opts) {
      vue.component('XRPWaterfall', __vue_component__$5);
    }
  };

  return index;

})));
