var msgs = require("./msgs").osc,
  eio = require("engine.io-client")

self.addEventListener("message", initListener.bind(self), false)

/**
  Receive an initialization message from the web page
*/
function initListener(e){
	// input processing
	if(e.data[0] != 2)
		return
	if(e.data[2] != "p:worker-init")
		return
	this.nodeData= e.data[3]

	// set up websocket
	this.ws= eio("ws://"+location.host+":"+location.port+"/feed")
	this.ws.binaryType = "arraybuffer" // receive ArrayBuffer not Blob
	this.ws.onerror = function(err){
		console.log("oh noes, websocket error "+err)
	}

	this.ws.onopen = (function(){
		// introduce all nodes
		for(var i= 0; i< this.nodeData.length; ++i){
			this.ws.sendBytes(msgs.intro(this.nodenode))
		}
	}).bind(this)
}
