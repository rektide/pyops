var http= require("http"),
  os= require("os"),
  koa= require("koa"),
  koaStaticCache= require("koa-static"),
  engine= require("engine.io"),
  rc= require("rc")

// configuration
rc= rc("pyops", {
  port: 8080
})

var app= koa().use(koaStaticCache("public")),
  server= http.createServer(app.callback()).listen(rc.port),
  eio= engine.attach(server)

eio.on("connection", function(socket){
	socket.on("message", msg)
})

function msg(msg){
	console.log("got msg",msg)
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
