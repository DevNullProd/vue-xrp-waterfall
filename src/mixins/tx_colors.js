const DEFAULT_COLOR = "#3498db";

export default {
  methods : {
    color_for : function(tx_type){
      var color = DEFAULT_COLOR;

      if(tx_type == 'payment')
        color = '#0F0';
      else if(tx_type == 'offer_create')
        color = '#269bae';
      else if(tx_type == 'offer_cancel')
        color = '#F00';
      else if(tx_type == 'trust_set')
        color =  '#e59866';
      else if(tx_type == 'escrow_create')
        color = '#aea226';
      else if(tx_type == 'escrow_finish')
        color = '#f9ff33';
      else if(tx_type == 'account_set')
        color = '#633974';

      return color;
    }
  }
}
