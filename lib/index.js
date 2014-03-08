var container, stats

var camera, scene, renderer, objects
var particleLight, pointLight
var dae, skin

var loader = new THREE.ColladaLoader()
loader.options.convertUpAxis = true
loader.load('./model/pop.dae', init)

function init(collada){

	scene = new THREE.Scene()

	// Pyramid

	dae = collada.scene
	//skin = collada.skins[0]
	dae.updateMatrix()
	dae.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,1,0), Math.PI))
	dae.applyMatrix(new THREE.Matrix4().makeTranslation(8.93, 0, -9.57))
	//dae.applyMatrix(new THREE.Matrix4().makeScale(1,1,1))
	dae.matrixAutoUpdate = false
	dae.updateMatrix()
	scene.add(dae)

	// LEDs

	var LED_translations = LEDS.map(function(k){
		return new THREE.Matrix4().makeTranslation(k[1], 0, k[0])
	})

	//var geometry = new THREE.SphereGeometry(40, 3, 3)
	var geometry = new THREE.BoxGeometry(25, 120, 25)
	//var platformCount = 24
	var platformCount = platforms.length
	for (var i = 0; i < platformCount; ++i) {
		var group = new THREE.Object3D(),
		  plat= platforms[i],
		  scale = 0.00106,
		  shift = 0.00108

		for (var j in LEDS) {
			var material = new THREE.MeshBasicMaterial({color:0x09999ff, side:THREE.FrontSide})
			var sphere = new THREE.Mesh(geometry, material)
			
			sphere.applyMatrix(LED_translations[j])
			sphere.matrixAutoUpdate = false
			sphere.updateMatrix()
			group.add(sphere)
		}

		group.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale))
		group.applyMatrix(new THREE.Matrix4().makeTranslation(plat.x*shift, plat.z*shift, plat.y*shift))
		group.matrixAutoUpdate = false
		group.updateMatrix()
		scene.add(group)
	}

	// Grid

	var size = 14, step = 1,
	  geometry = new THREE.Geometry()
	  material = new THREE.LineBasicMaterial( { color: 0x303030 } )
	for (var i = - size; i <= size; i += step) {
		geometry.vertices.push( new THREE.Vector3( - size, - 0.04, i ) )
		geometry.vertices.push( new THREE.Vector3(   size, - 0.04, i ) )

		geometry.vertices.push( new THREE.Vector3( i, - 0.04, - size ) )
		geometry.vertices.push( new THREE.Vector3( i, - 0.04,   size ) )
	}
	var line = new THREE.Line(geometry, material, THREE.LinePieces)
	scene.add(line)

	// Particle Light

	//particleLight = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }))
	//scene.add(particleLight)
	//pointLight = new THREE.PointLight(0xffffff, 4)
	//pointLight.position = particleLight.position
	//scene.add(pointLight)

	// Ambient Light

	scene.add(new THREE.AmbientLight(0xbbbbbb))

	// Directional Light

	//var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee )
	//directionalLight.position.x = Math.random() - 0.5
	//directionalLight.position.y = Math.random() - 0.5
	//directionalLight.position.z = Math.random() - 0.5
	//directionalLight.position.normalize()
	//scene.add(directionalLight)

	// Camera

	if(ortho)
		camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000)
	else
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)

	// Renderer

	renderer = new THREE.WebGLRenderer()
	window.addEventListener('resize', onWindowResize, false)
	onWindowResize()
	reCamera()

	container = document.createElement('div')
	document.body.appendChild(container)
	container.appendChild(renderer.domElement)

	console.log("running")
	render()
}

var ortho = false
var camera_r = 14 // radius of track
var camera_z = 10 // height of tack
var ortho_w = 6 // orthographic width

function onWindowResize() {

	if(ortho){
		camera.right = ortho_w / 2
		camera.left = - camera.right
		camera.top = ortho_w * window.innerHeight / window.innerWidth / 2
		camera.bottom = - camera.top
		camera.near = 1
		camera.far = 5000
	}else
		camera.aspect = window.innerWidth / window.innerHeight

	camera.updateProjectionMatrix()

	if(renderer)
		renderer.setSize(window.innerWidth, window.innerHeight)
}

// camera
var look = new THREE.Vector3(0, 4, 0),
  rotation = 0,
  rotation_rate = 0.0003,
  space = false,
  last = Date.now()
function reCamera(){
	var next = Date.now()
	rotation += (next - last) * rotation_rate
	last = next

	camera.position.x = Math.cos(rotation) * camera_r
	camera.position.y = camera_z
	camera.position.z = Math.sin(rotation) * camera_r

	if(ortho)
		camera.lookAt(new THREE.Vector3(camera.position.x, 0, camera.position.z))
	else
		camera.lookAt(look)
}

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


function render() {
	requestAnimationFrame(render)

	if (space) {
		reCamera()
	}

	frames++

	//particleLight.position.x = Math.sin(timer * 4) * 3009
	//particleLight.position.y = Math.cos(timer * 5) * 4000
	//particleLight.position.z = Math.cos(timer * 4) * 3009

	renderer.render(scene, camera)
}

var frames = 0,
  report = 5
window.setInterval(function(){
	console.log("fps "+frames/report)
	frames = 0
}, report*1000)
