var http= require("http"),
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
