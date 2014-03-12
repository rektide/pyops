var osc= require("osc-min")

/*
  Terminology:

  Channel: a channel is a publish/subscribe "topic" either:
   * Held at a single-value, or
   * Published into with data that has timestamps as well (buffered on the nodes)
*/


/**
  An intro message, asserting that this hub-processor has this LED
  Hub-processor -> Master
*/
function intro(led){
	return {
	  address: "/intro",
	  args: [led.platform, led.local, led.x, led.y, led.z]
	}
}
module.exports.intro= intro

/**
  Set is the most basic command; sets an array of targets to a value, clearing existing state
  * -> Hub-processor
  @param targets target leds, array of integer
  @param data value to set leds to
*/
function set(targets, data){
	if(typeof data == "number") data= _int(data)
	return {
	  address: "/s",
	  args: [_targets(targets), data]
	}
}
module.exports.set= set

/**
  Send data to a channel
  @param channel channel to send to
  @param data data (or value) to send
  @param timetag (optional) timetag to stamp with
*/
function data(channel, data, timetag){
	channel= _int(channel)
	if(typeof data == "number") data= _int(data)
	if(timetag){
		return {
		  address: "/t",
		  args: [channel, data, _timetag(timetag)]
		}
	}else{
		return {
		  address: "/d",
		  args: [channel, data]
		}
	}
}
module.exports.data= data

/**
  Track a channel with targets
  @param targets target leds to commence tracking
  @param channel channel to track
  @param timetag (optional) time to commence tracking
  @param amount (optional) 
*/
function track(targets, channel, timetag, amount){
	var args = [_targets(targets), _int(channel), _timetag(timetag), _int(amount)]
	if(amount === undefined) {
		args.pop()
		if(timetag === undefined) {
			args.pop()
		}
	}
	return {
	  address: "/f",
	  args: args
	}
}
module.exports.track= track

/**
  Interpolate between data in a timetagged channel
  @param targets target leds to commence tracking
  @param channel channel to track
  @param timetag (optional) time to commence tracking
  @param amount (optional)
*/
function animate(targets, channel, timetag, amount){
	var args = [_targets(targets), _int(channel), _timetag(timetag), _int(amount)]
	if(amount === undefined) {
		args.pop()
		if(timetag === undefined) {
			args.pop()
		}
	}
	return {
	  address: "/a",
	  args: args
	}
}

/**
  Continuously alter target leds, increasing or decreasing value at a given rate
  @param targets leds to set a velocity for
  @param velocities velocity or velocities to alter
  @param timetag_start (optional) time to commence altering velocity
  @param timetag_end (optional) time to end altering velocity
*/
function velocity(targets, velocities, timetag_start, timetag_stop){
	return {
	  address: "/v",
	  args: [_targets(targets), velocities, _timetag(timetag_start), _timetag(timetag_stop)]
	}
}

/**
  Kick off all listeners on a channel
*/
function end(channel, timetag){
	var args = timetag ? [channel, _timetag(timetag)] : [channel]
	return {
	  address: "/end",
	  args: args
	}
}
module.exports.end= end

/**
  Follow a channel
*/
function tick(channel,color,time,raw){
	time= time||new Date().valueOf()
	var rv= {
	  address: "/d/"+channel,
	  args: [color, _timetag(time)]
	}
	if(raw) // demarcates colorless data, an unsigned 32-bit number scale
		rv.args.push(true)
	return rv
}
module.exports.data= data



function follow(targets,channel){
}
module.exports.follow= follow



/**
  Assert data on a channel at a given time
*/

/**
  Master sends hub-processor a session identifier on startup
  Master -> hub
  @param sessionId the sessionId for the new hub node
  @param currentTime (implicit) the current time of the master
*/
function session(sessionId){
	return {
	  address: "/session",
	  args: [id, _timetag(new Date().valueOf())]
	}
}
module.exports.session= session

/**
  Tell the master to start sending a hub-processor a channel
  * -> Master
*/
function subscribe(sessionId,channel){
	return {
	  address: "/sub",
	  args: [sessionId, channel]
	}
}
module.exports.subscribe= subscribe

/**
  Stop the master from sending a hub-processor a channel
*/
function unsubscribe(sessionId,channel){
	return {
	  address: "/unsub",
	  args: [sessionId, channel]
	}
}
module.exports.unsubscribe= unsubscribe

function _timetag(time){
	return {type: "timetag", value: time}
}

function _int(int){
	if(int > 32768)
		return {type: "integer", value: int}
	else
		return {type: "integer", value: int}
}

/**
  Targets are an array of LEDs
*/
function _targets(targets){
	return targets.map(_int)
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
