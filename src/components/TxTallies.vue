<template>
  <ul id='xrp_waterfall_tx_tallies'>
    <li v-bind:style="{color : color_for('payment')}">
      Payment
      <span class="tx_tally">{{tallies.payment}}</span>
      <div class="tx_tally_after"></div>
    </li>

    <li v-bind:style="{color : color_for('offer_create')}">
      OfferCreate
      <span class="tx_tally">{{tallies.offer_create}}</span>
      <div class="tx_tally_after"></div>
    </li>

    <li v-bind:style="{color : color_for('offer_cancel')}">
      OfferCancel
      <span class="tx_tally">{{tallies.offer_cancel}}</span>
      <div class="tx_tally_after"></div>
    </li>

    <li v-bind:style="{color : color_for('trust_set')}">
      TrustSet
      <span class="tx_tally">{{tallies.trust_set}}</span>
      <div class="tx_tally_after"></div>
    </li>

    <li v-bind:style="{color : color_for('escrow_create')}">
      EscrowCreate
      <span class="tx_tally">{{tallies.escrow_create}}</span>
      <div class="tx_tally_after"></div>
    </li>

    <li v-bind:style="{color : color_for('escrow_finish')}">
      EscrowFinish
      <span class="tx_tally">{{tallies.escrow_finish}}</span>
      <div class="tx_tally_after"></div>
    </li>

    <li v-bind:style="{color : color_for('account_set')}">
      AccountSet
      <span class="tx_tally">{{tallies.account_set}}</span>
      <div class="tx_tally_after"></div>
    </li>
  </ul>
</template>

<script>
var TxColors = require('../mixins/tx_colors').default
var TxType   = require('../mixins/tx_type').default

export default {
  name: 'TxTallies',

  mixins : [TxColors, TxType],

  data : function(){
    return {
      tallies : {
        payment       : 0,
        offer_create  : 0,
        offer_cancel  : 0,
        trust_set     : 0,
        escrow_create : 0,
        escrow_finish : 0,
        account_set   : 0
      }
    }
  },

  methods : {
    on_tx : function(tx){
      var type = this.convert_type(tx["transaction"]['TransactionType']);
      this.tallies[type] += 1;
    }
  }
}
</script>

<style scoped>
#xrp_waterfall_tx_tallies{
  margin: 10px;
  padding-left: 10px;
  list-style-type: none;
}

.tx_tally{
  font-weight: bold;
  float: right;
}

.tx_tally_after{
  clear: both;
}
</style>
