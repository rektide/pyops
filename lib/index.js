var container, stats

var camera, scene, renderer, objects
var particleLight, pointLight
var dae, skin

var camera_r = 16
var camera_z = 50

var loader = new THREE.ColladaLoader()
loader.options.convertUpAxis = true
loader.load('./model/pop.dae', init)

function init(collada){

	dae = collada.scene
	//skin = collada.skins[0]

	dae.scale.x = dae.scale.y = dae.scale.z = 0.05
	dae.position.x = -20
	dae.position.z = 20
	dae.updateMatrix()
	dae.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,1,0), Math.PI))
	//dae.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,1,0), Math.PI))
	dae.updateMatrix()

	container = document.createElement('div')
	document.body.appendChild(container)

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
	camera.position.set(camera_r, camera_z, 0)
	camera.lookAt(look)

	scene = new THREE.Scene()

	// Grid

	var size = 14, step = 1

	var geometry = new THREE.Geometry()
	var material = new THREE.LineBasicMaterial( { color: 0x303030 } )

	for (var i = - size; i <= size; i += step) {

		geometry.vertices.push( new THREE.Vector3( - size, - 0.04, i ) )
		geometry.vertices.push( new THREE.Vector3(   size, - 0.04, i ) )

		geometry.vertices.push( new THREE.Vector3( i, - 0.04, - size ) )
		geometry.vertices.push( new THREE.Vector3( i, - 0.04,   size ) )

	}

	var line = new THREE.Line(geometry, material, THREE.LinePieces)
	scene.add(line)

	// Add the COLLADA

	scene.add(dae)

	//particleLight = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }))
	//scene.add(particleLight)

	// Lights

	scene.add(new THREE.AmbientLight(0xaaaaaa))

	//var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee )
	//directionalLight.position.x = Math.random() - 0.5
	//directionalLight.position.y = Math.random() - 0.5
	//directionalLight.position.z = Math.random() - 0.5
	//directionalLight.position.normalize()
	//scene.add(directionalLight)

	//pointLight = new THREE.PointLight(0xffffff, 4)
	//pointLight.position = particleLight.position
	//scene.add(pointLight)

	// LED ring 1

	//var geometry = new THREE.SphereGeometry(12, 3, 3)
	var geometry = new THREE.BoxGeometry(12, 12, 12)
	var scale = 0.002
	for (var i = 0; i < platforms.length; ++i) {
		var group = new THREE.Object3D()
		for (var j in LEDS) {
			//var material = new THREE.MeshNormalMaterial()
			var material = new THREE.MeshBasicMaterial({color:0x09999ff, side:THREE.FrontSide})
			var sphere = new THREE.Mesh(geometry, material)
			sphere.position.set(LEDS[j][1], 0, LEDS[j][0])
			sphere.matrixAutoUpdate = false
			sphere.updateMatrix()
			group.add(sphere)
		}
		group.scale.x = group.scale.y = group.scale.z = 0.0025
		group.position.set(platforms[i].x * scale, platforms[i].z * scale, platforms[i].y * scale)
		group.matrixAutoUpdate = false
		group.updateMatrix()
		scene.add(group)
	}

	// RENDERER

	renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth, window.innerHeight)

	container.appendChild(renderer.domElement)

	//stats = new Stats()
	//stats.domElement.style.position = 'absolute'
	//stats.domElement.style.top = '0px'
	//container.appendChild(stats.domElement)

	window.addEventListener('resize', onWindowResize, false)

	console.log("running")
	render()
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

var look = new THREE.Vector3(0, 9, 0)
var space = false
var rotation_rate = 0.0003
var last = Date.now()
var rotation = 0

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)

function keydown(e){
	if (!space && e.keyCode == 32) {
		space = true
		last = Date.now()
		window.removeEventListener("keydown", keydown)
	}
}

function keyup(e){
	if (space && e.keyCode == 32) {
		space = false
		window.addEventListener("keydown", keydown, false)
	}
}


var frames = 0

function render() {

	requestAnimationFrame(render)

	if (space) {
		var next = Date.now()
		rotation += (next - last) * rotation_rate
		last = next

		camera.position.x = Math.cos(rotation) * camera_r
		camera.position.y = camera_z
		camera.position.z = Math.sin(rotation) * camera_r
		camera.lookAt(look)
	}

	frames++


	//particleLight.position.x = Math.sin(timer * 4) * 3009
	//particleLight.position.y = Math.cos(timer * 5) * 4000
	//particleLight.position.z = Math.cos(timer * 4) * 3009

	renderer.render(scene, camera)
}

var report = 5

window.setInterval(function(){
	console.log("fps",frames/report)
	frames = 0
}, report*1000)
