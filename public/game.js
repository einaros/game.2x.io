var SCREEN_WIDTH = window.innerWidth
  , SCREEN_HEIGHT = 400
  , SCREEN_HALFWIDTH = SCREEN_WIDTH / 2
  , SCREEN_HALFHEIGHT = SCREEN_HEIGHT / 2;

function valOrDef(property, def) {
    return typeof property != 'undefined' ? property : def;
}
  
function init() {
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
        return;
    }
    container = document.createElement('div');
    document.getElementById('scene').appendChild(container);
    info = document.getElementById('info');
    window.onresize = Game.onWindowResize.bind(Game);
    container.onmousemove = Game.onMouseMove.bind(Game);
    window.onkeydown = Game.onKeyDown.bind(Game);
    window.onkeyup = Game.onKeyUp.bind(Game);
    Game.init(container);
}

var Game = (function() {
    var b2AABB = Box2D.Collision.b2AABB;
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2World = Box2D.Dynamics.b2World;
    var b2MassData = Box2D.Collision.Shapes.b2MassData;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

    var Game = {
        config: {
            mapOffset: -100,
            mapWidth: 1000000,
            groundThickness: 50,
            maxPlayerAngularVelocity: 10,
            floorWidth: 10000,
            groundHeight: 200,
            groundDepth: 400,
            physicsScale: 20,
            gravity: -20,
            playerForce: 10000
        },
        state: {
            idCounter: 0,
            camera: null,
            cameraCube: null,
            scene: null,
            projector: null,
            renderer: null,
            info: null,
            mouse: {x: 0, y: 0},
            sun: null,
            world: null,
            player: null,
            bodies: [],
            input: {
                u: false,
                d: false,
                l: false,
                r: false,
            },
            actions: [],
            geometries: {},
        },
        _idCounter: 0,
        init: function(container) {
            this.state.camera = new THREE.Camera(0, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
            this.state.cameraCube = new THREE.Camera(0, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 100000);
            this.state.cameraCube.position.z = 1200;
            this.state.camera.position.z = 1200;
            this.state.scene = new THREE.Scene();
            this.state.sceneCube = new THREE.Scene();
            this.state.scene.fog = new THREE.Fog(0x000000, 600, 6000);
            projector = new THREE.Projector();
            this.state.renderer = new THREE.WebGLRenderer({antialias: true});
            this.state.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
            this.state.renderer.setClearColor(this.state.scene.fog.color, 1);
            /*this.state.renderer.shadowCameraNear = 3;
            this.state.renderer.shadowCameraFar = this.state.camera.far;
            this.state.renderer.shadowCameraFov = 50;
            this.state.renderer.shadowMapBias = 0.0039;
            this.state.renderer.shadowMapDarkness = 0.5;
            this.state.renderer.shadowMapWidth = 1024; //SHADOW_MAP_WIDTH;
            this.state.renderer.shadowMapHeight = 1024; //SHADOW_MAP_HEIGHT;
            this.state.renderer.shadowMapEnabled = true;
            this.state.renderer.shadowMapSoft = true;*/
            this.state.renderer.setFaceCulling(0);
            this.state.renderer.autoClear = false;
            container.appendChild(this.state.renderer.domElement);

            var ambientLight = new THREE.AmbientLight(0xAAAAAA);
            this.state.scene.addLight(ambientLight);
            
            this.state.sun = new THREE.PointLight(0xAAAAAA);
            this.state.sun.position.set(0, 200, 0);
            //this.state.sun.target.position.set(0, 0, 0);
            //this.state.sun.castShadow = false;
            this.state.scene.addLight(this.state.sun);

            //var textureCube = createSkybox();
            var floorMaterial = this.createWrappedMaterial(100, 1, 'path90.jpg');
            var wallMaterial = this.createWrappedMaterial(100, 2, 'stone.jpg');
            var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, wireframe: true } );
            var woodMaterial = new THREE.MeshLambertMaterial({wireframe: true, color: 0xffffff, map: THREE.ImageUtils.loadTexture('wood.jpg', THREE.UVMapping)});
            var ballMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, map: THREE.ImageUtils.loadTexture('ball.jpg', THREE.UVMapping)});
            //var ballMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, map: THREE.ImageUtils.loadTexture('marble.jpg', THREE.UVMapping), envMap: null/*textureCube*/, combine: THREE.MixOperation, reflectivity: 0.1});
            this.initPhysics();
            this.factory = new Factory(this.state.world, this.config.physicsScale);
            //this.createGround(wireMaterial);
            
            this.createPlayer(ballMaterial);
            //this.state.camera.target = this.state.player.object;
            this.state.cameraCube.target = this.state.player.object;
            this.state.sun.target = this.state.player.object;

            this.state.stats = new Stats();
            this.state.stats.domElement.style.position = 'absolute';
            this.state.stats.domElement.style.top = '0px';
            container.appendChild(this.state.stats.domElement);

            this.createSlopes(floorMaterial, wallMaterial);

            this.animate();
        },
        initPhysics: function() {
            var gravity = new b2Vec2(0.0, this.config.gravity);
            this.state.world = new b2World(gravity, true);
        },
        trackActor: function(actor) {
            if (typeof actor == 'undefined') return;
            if (actor.object) this.state.scene.addObject(actor.object);
            this.state.bodies.push(actor);
        },
        createPlayer: function(ballMaterial) {
            this.state.player = this.factory.createSphereActor(100, 0, 200, 0, {density: 1, restitution: 0.1, material: ballMaterial});
            this.trackActor(this.state.player);
            this.state.player.SetBullet(true);
        },
        animate: function() {
            requestAnimationFrame(this.animate.bind(this));
            this.stepFrame();
            this.state.stats.update();
        },
        controlPlayerSpeed: function() {
            if (this.state.input.l || this.state.input.r) {
                var av = this.state.player.GetAngularVelocity();
                var v = 0;
                if (this.state.input.l && av < this.config.maxPlayerAngularVelocity) v = this.config.playerForce;
                if (this.state.input.r && av > -this.config.maxPlayerAngularVelocity) v = -this.config.playerForce;
                if (v) this.state.player.ApplyTorque(v);
            }
        },
        stepFrame: function() {
            this.controlPlayerSpeed();
            this.state.world.Step(1.0/30.0, 10);
            this.state.world.ClearForces();
            for(var i = 0, l = this.state.bodies.length; i < l; ++i){
                var body = this.state.bodies[i];
                if (!body.object) continue;
                var t = body.m_xf;
                body.object.position.x = t.position.x * this.config.physicsScale;
                body.object.position.y = t.position.y * this.config.physicsScale;
                body.object.rotation.z = body.GetAngle();
            }
            var vx = this.state.player.GetLinearVelocity().x;
            var vy = this.state.player.GetLinearVelocity().y;
            var vd = vy > 0 ? 1 : -1;
            this.state.camera.position.x += (this.state.player.object.position.x - this.state.camera.position.x) * .05;
            this.state.camera.position.y += ((this.state.player.object.position.y + vx*5) - this.state.camera.position.y) * .1;
            this.state.camera.target.position.x += ((this.state.player.object.position.x + vx*70) - this.state.camera.target.position.x) * 0.02;
            this.state.camera.target.position.y = this.state.player.object.position.y;
            this.state.camera.target.position.z = this.state.player.object.position.z;
            this.state.cameraCube.position.x = this.state.camera.position.x;
            this.state.cameraCube.position.y = this.state.camera.position.y;
            this.state.cameraCube.position.z = this.state.camera.position.z;
            this.state.sun.position.x = this.state.camera.position.x;
            this.state.sun.position.y = this.state.camera.position.y + 100;
            this.state.sun.position.z = this.state.camera.position.z;
            this.state.renderer.clear();
            //this.state.renderer.render(this.state.sceneCube, this.state.cameraCube);
            this.state.renderer.render(this.state.scene, this.state.camera);
        },
        createSlopes: function(slopeMaterial, wallMaterial) {
            var w = 200000;
            var wpm = 0.005;
            var ws = w * wpm;

            var slopeWidth = 1000;
            var slopeHalfWidth = slopeWidth / 2;
            var wallHeight = 5000;

            var wallGeometry = new THREE.PlaneGeometry(w, 1000, ws, 1);
            var slopeGeometry = new THREE.PlaneGeometry(w, 1000, ws, 10);
            var points = [];
            var maxH = 300 + 500;
            
            for (var x = 0; x < ws + 1; ++x) {
                for (var y = 0; y < 11; ++y) {
                    var h = (x*-40) + Math.sin(Math.PI / 11 * y) * 300 + Math.sin(Math.PI / (ws+1) * 200 * x) * 100 - maxH/2;
                    if (y == 5) points.push({ x: x * (w/ws), y: h });
                    slopeGeometry.vertices[x + y * (ws + 1)].position.z = h;
                }
                var vpTop = wallGeometry.vertices[x].position;
                var vpBottom = wallGeometry.vertices[x + 1 * (ws + 1)].position;
                var slopeVec = slopeGeometry.vertices[x + 1 * (ws + 1)].position;
                vpTop.z = vpBottom.z = slopeHalfWidth;
                vpTop.y = slopeVec.z;
                vpBottom.y = slopeVec.z - wallHeight;
            }

            var slope = new THREE.Mesh(slopeGeometry, slopeMaterial);
            slope.position.x = w/2 + this.config.mapOffset;
            slope.doubleSided = false;
            slope.rotation.x = -Math.PI / 2;
            this.state.scene.addObject(slope);

            var wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.x = w/2 + this.config.mapOffset;
            wall.doubleSided = true;
            this.state.scene.addObject(wall);
            
            // Slope ground
            var actors = this.factory.createChainActor(points, this.config.mapOffset, 0, 2, {material: slopeMaterial, restitution: 0.1, fixed: true});
            for (var i = 0; i < actors.length; ++i) {
                var actor = actors[i];
                this.trackActor(actor);
            }
        },
        // Factories
        createWrappedMaterial: function(rX, rY, img) {
            var text = THREE.ImageUtils.loadTexture(img, THREE.UVMapping);
            text.wrapS = THREE.RepeatWrapping;
            text.wrapT = THREE.RepeatWrapping;
            text.minFilter = THREE.LinearFilter;    
            text.magFilter = THREE.LinearFilter;
            text.repeat.set(rX, rY);
            text.needsUpdate = true;
            var material = new THREE.MeshLambertMaterial({
                color: 0xffffff, 
                map: text
            });
            return material;
        },
        // Event listeners
        onWindowResize: function(event) {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HALFWIDTH = SCREEN_WIDTH / 2;
            this.state.camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
            this.state.camera.updateProjectionMatrix();
            this.state.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        },
        onMouseMove: function(event) {
            event.preventDefault();
            this.state.mouse.x = (event.clientX - SCREEN_HALFWIDTH);
            this.state.mouse.y = - (event.clientY - SCREEN_HALFHEIGHT);
        },
        onKeyDown: function(event) {
            if (event.which == 38) this.state.input.u = true;
            else if (event.which == 40) this.state.input.d = true;
            else if (event.which == 37) this.state.input.l = true;
            else if (event.which == 39) this.state.input.r = true;
        },
        onKeyUp: function(event) {
            if (event.which == 38) this.state.input.u = false;
            else if (event.which == 40) this.state.input.d = false;
            else if (event.which == 37) this.state.input.l = false;
            else if (event.which == 39) this.state.input.r = false;
        },
    }

    return Game;
})();
