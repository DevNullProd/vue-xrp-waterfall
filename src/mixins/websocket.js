const WS_TIMEOUT = 7500;

module.exports = {
  data : function(){
    return {
      ws           : null,
      last_tx_time : new Date(),
      connecting   : true
    }
  },

  methods : {
    init_ws : function(){
      this.ws = new WebSocket("wss://s1.ripple.com:443");
      this.ws.onopen = function(){
        var json = JSON.stringify({
                     'command' : 'subscribe',
                     'streams' : ["transactions"],
                   });
        this.ws.send(json);
      }.bind(this)

      this.ws.onmessage = function (event) {
        var json = JSON.parse(event.data);
        if(!json["transaction"]) return;

        this.connecting = false;
        this.last_tx_time = new Date();

        this.on_tx(json);
      }.bind(this)
    },

    check_ws : function(){
      // periodically check connection
      setInterval(function(){
        var now = new Date();
        if(now - this.last_tx_time > WS_TIMEOUT){
          this.connecting = true;

          this.ws.close();
          this.init_ws();
          this.last_tx_time = now;
        }
      }.bind(this), 1500);
    }
  }
}
