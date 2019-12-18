export default {
  methods : {
    convert_type : function(tx_type){
      return tx_type.split(/(?=[A-Z])/)
                    .join('_')
                    .toLowerCase();
    }
  }
}
