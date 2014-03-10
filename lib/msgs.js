var osc= require("osc-min")

/**
  An intro message, introducing an LED into the space
*/
module.exports.intro = function(node){
	return {
	  address: "/intro",
	  args: [node.platform, node.segment, node.local, node.x, node.y, node.z]
	}
}

/**
  Wrap of all messages defined above in a call to osc's toBuffer
*/
module.exports.osc = (function(exps){
	// select wrapping function
	var wrapper,
	  b = new Buffer(1)
	if(b.toArrayBuffer)
		wrapper = "return osc.toBuffer(this(a,b,c,d)).toArrayBuffer()"
	else
		wrapper = "return new Uint8Array(osc.toBuffer(this(a,b,c,d))).buffer"

	// wrap each of the module.exports we've been passed & return the wrappers
	var rv = {}
	for(var i in exps){
		rv[i] = Function("osc","a","b","c","d",wrapper).bind(exps[i],osc) // Function is only global scopes, so "bind" the local scope item's it needs to it
	}
	return rv
})(module.exports)
