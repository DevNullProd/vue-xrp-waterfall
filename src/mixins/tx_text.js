const DROPS_PER_XRP = 1000000;

// TODO improve formatting, link to accounts, tags

export default {
  methods : {
    round : function(value, decimals){
      return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    format_account : function(account){
      return account.substring(0, 7) + "...";
    },

    format_amount : function(amount){
      if(typeof(amount) === "object")
        return this.round(parseFloat(amount['value']), 3) + ' ' +
               amount['currency']          +
               ' (' + this.format_account(amount['issuer']) + ')';

      else
        return this.round(parseInt(amount) / DROPS_PER_XRP, 3) + " XRP";

    },

    text_for : function(tx, type){
      var txo = tx['transaction'];

      if(type == 'payment')
        return this.format_account(txo['Account']) + ' -> ' +
               this.format_amount(txo['Amount'])   + ' -> ' +
               this.format_account(txo['Destination']);

      else if(type == 'offer_create')
        return this.format_amount(txo['TakerGets']) + ' / ' +
               this.format_amount(txo['TakerPays']);

      else if(type == 'trust_set')
        return this.format_account(txo['Account']) + ' Extended Trust To ' +
               this.format_account(txo['LimitAmount']['issuer']);

      // TODO other tx text description

      return null;
    }
  }
}
