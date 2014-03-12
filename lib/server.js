var http= require("http"),
  os= require("os"),
  engine= require("engine.io"),
  koa= require("koa"),
  koaStaticCache= require("koa-static"),
  osc= require("osc-min"),
  rc= require("rc"),
  msg= require("./msgs"),
  osc= msg.osc

// configuration
rc= rc("pyops", {
  port: 8080
})

var app= koa().use(koaStaticCache("public")),
  server= http.createServer(app.callback()).listen(rc.port),
  eio= engine.attach(server),
  sessionMap= new WeakMap(),
  socketSerial= 2

eio.on("connection", function(socket){
	var id= socketSerial++
	console.log("socket connection", id)
	sessionMap.set(id, socket)
	socket.id= id
	setTimeout(function(){ // settling time for client
		socket.send(osc.session(id)
	}, 1200)
	socket.on("message", msg)
})

function msg(msg){
	msg= osc.fromBuffer(msg)
	console.log("got msg",msg.address)
}

if(!rc.quiet){
	var ifs= os.networkInterfaces()
	for(var i in ifs){
		for(var j in ifs[i]){
			var extra = ifs[i][j].internal ? "[internal]" : ""
			console.log("http://"+ifs[i][j].address+":"+rc.port+" "+extra)
		}
	}
	console.log("Addresses are now running")
}
