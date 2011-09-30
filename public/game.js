function init(){Detector.webgl?(container=document.createElement("div"),document.getElementById("scene").appendChild(container),info=document.getElementById("info"),window.onresize=Game.onWindowResize.bind(Game),container.onmousemove=Game.onMouseMove.bind(Game),window.onkeydown=Game.onKeyDown.bind(Game),window.onkeyup=Game.onKeyUp.bind(Game),Game.init(container)):Detector.addGetWebGLMessage()}function valOrDef(a,b){return typeof a!="undefined"?a:b}var SCREEN_WIDTH=window.innerWidth,SCREEN_HEIGHT=400,SCREEN_HALFWIDTH=SCREEN_WIDTH/2,SCREEN_HALFHEIGHT=SCREEN_HEIGHT/2,Game=function(){var a=Box2D.Collision.b2AABB,b=Box2D.Common.Math.b2Vec2,c=Box2D.Dynamics.b2BodyDef,d=Box2D.Dynamics.b2Body,e=Box2D.Dynamics.b2FixtureDef,f=Box2D.Dynamics.b2Fixture,g=Box2D.Dynamics.b2World,h=Box2D.Collision.Shapes.b2MassData,i=Box2D.Collision.Shapes.b2PolygonShape,j=Box2D.Collision.Shapes.b2CircleShape,k=Box2D.Dynamics.b2DebugDraw,l={config:{mapOffset:-100,mapWidth:2e5,groundThickness:50,maxPlayerAngularVelocity:10,floorWidth:1e4,groundHeight:200,groundDepth:400,physicsScale:20,gravity:-20,playerForce:1e4,superchargeDelay:1e4,superchargeMultiplyer:5,playerStartOffset:{x:200,y:200}},state:{idCounter:0,camera:null,cameraCube:null,scene:null,projector:null,renderer:null,info:null,mouse:{x:0,y:0},sun:null,world:null,player:null,bodies:[],input:{u:!1,d:!1,l:!1,r:!1},actions:[],geometries:{}},_idCounter:0,init:function(a){this.state.camera=new THREE.Camera(0,SCREEN_WIDTH/SCREEN_HEIGHT,1,1e4),this.state.cameraCube=new THREE.Camera(0,SCREEN_WIDTH/SCREEN_HEIGHT,1,1e5),this.state.cameraCube.position.z=1200,this.state.camera.position.z=1200,this.state.scene=new THREE.Scene,this.state.sceneCube=new THREE.Scene,this.state.scene.fog=new THREE.Fog(16777215,600,6e3),projector=new THREE.Projector,this.state.renderer=new THREE.WebGLRenderer({antialias:!0}),this.state.renderer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT),this.state.renderer.setClearColor(this.state.scene.fog.color,1),this.state.renderer.setFaceCulling(0),this.state.renderer.autoClear=!1,a.appendChild(this.state.renderer.domElement);var b=new THREE.AmbientLight(11184810);this.state.scene.addLight(b),this.state.sun=new THREE.PointLight(11184810),this.state.sun.position.set(0,200,0),this.state.scene.addLight(this.state.sun);var c=this.createWrappedMaterial(100,1,"path90.jpg"),d=this.createWrappedMaterial(100,2,"stone.jpg"),e=new THREE.MeshBasicMaterial({color:12237502,shading:THREE.FlatShading,wireframe:!0}),f=new THREE.MeshLambertMaterial({color:16777215,map:THREE.ImageUtils.loadTexture("wood.jpg",THREE.UVMapping)}),g=new THREE.MeshLambertMaterial({color:16777215,map:THREE.ImageUtils.loadTexture("ball.jpg",THREE.UVMapping)});this.initPhysics(),this.factory=new Factory(this.state.world,this.config.physicsScale),this.createPlayer(g),this.state.cameraCube.target=this.state.player.object,this.state.sun.target=this.state.player.object;for(var h=0;h<500;++h){var i=Math.random()*this.config.mapWidth,j=Math.random()*500+100,k=Math.random()*200+25,l=Math.random()*200+25,m=this.factory.createCubeActor(k,l,100,i,j,0,{material:f,density:.2});this.trackActor(m)}this.state.stats=new Stats,this.state.stats.domElement.style.position="absolute",this.state.stats.domElement.style.top="0px",a.appendChild(this.state.stats.domElement),this.createSlopes(c,d),this.animate()},initPhysics:function(){var a=new b(0,this.config.gravity);this.state.world=new g(a,!0)},trackActor:function(a){typeof a!="undefined"&&(a.object&&this.state.scene.addObject(a.object),this.state.bodies.push(a))},createPlayer:function(a){this.state.player=this.factory.createSphereActor(100,this.config.playerStartOffset.x,this.config.playerStartOffset.y,0,{density:1,restitution:.1,material:a}),this.trackActor(this.state.player),this.state.player.SetBullet(!0)},animate:function(){requestAnimationFrame(this.animate.bind(this)),this.stepFrame(),this.state.stats.update()},controlPlayerSpeed:function(){if(this.state.input.l||this.state.input.r){var a=this.state.player.GetAngularVelocity(),b=0;this.state.input.l&&a<this.config.maxPlayerAngularVelocity&&(b=this.config.playerForce),this.state.input.r&&a>-this.config.maxPlayerAngularVelocity&&(b=-this.config.playerForce),b&&this.state.player.ApplyTorque(b)}},superCharge:function(){var a=Date.now();this._previousCharge&&a-this._previousCharge<this.config.superchargeDelay?document.getElementById("gameInfo").innerText="SuperCharge ready in "+Math.ceil((this.config.superchargeDelay-(a-this._previousCharge))/1e3)+"s":(this._previousCharge=a,this.state.player.SetAngularVelocity(this.state.player.GetAngularVelocity()*this.config.superchargeMultiplyer))},stepFrame:function(){this.controlPlayerSpeed(),this.state.world.Step(1/30,10),this.state.world.ClearForces();for(var a=0,b=this.state.bodies.length;a<b;++a){var c=this.state.bodies[a];if(!c.object)continue;var d=c.m_xf;c.object.position.x=d.position.x*this.config.physicsScale,c.object.position.y=d.position.y*this.config.physicsScale,c.object.rotation.z=c.GetAngle()}var e=this.state.player.GetLinearVelocity().x,f=this.state.player.GetLinearVelocity().y,g=f>0?1:-1;this.state.camera.position.x+=(this.state.player.object.position.x-this.state.camera.position.x)*.05,this.state.camera.position.y+=(this.state.player.object.position.y+e*5-this.state.camera.position.y)*.1,this.state.camera.target.position.x+=(this.state.player.object.position.x+e*70-this.state.camera.target.position.x)*.02,this.state.camera.target.position.y=this.state.player.object.position.y,this.state.camera.target.position.z=this.state.player.object.position.z,this.state.cameraCube.position.x=this.state.camera.position.x,this.state.cameraCube.position.y=this.state.camera.position.y,this.state.cameraCube.position.z=this.state.camera.position.z,this.state.sun.position.x=this.state.camera.position.x,this.state.sun.position.y=this.state.camera.position.y+100,this.state.sun.position.z=this.state.camera.position.z,this.state.renderer.clear(),this.state.renderer.render(this.state.scene,this.state.camera)},createSlopes:function(a,b){var c=this.config.mapWidth,d=.005,e=c*d,f=1e3,g=f/2,h=5e3,i=new THREE.PlaneGeometry(c,1e3,e,1),j=new THREE.PlaneGeometry(c,1e3,e,10),k=[],l=800;for(var m=0;m<e+1;++m){for(var n=0;n<11;++n){var o=m*-40+Math.sin(Math.PI/11*n)*300+Math.sin(Math.PI/(e+1)*200*m)*100-l/2;n==5&&k.push({x:m*(c/e),y:o}),j.vertices[m+n*(e+1)].position.z=o}var p=i.vertices[m].position,q=i.vertices[m+1*(e+1)].position,r=j.vertices[m+1*(e+1)].position;p.z=q.z=g,p.y=r.z,q.y=r.z-h}var s=new THREE.Mesh(j,a);s.position.x=c/2+this.config.mapOffset,s.doubleSided=!1,s.rotation.x=-Math.PI/2,this.state.scene.addObject(s);var t=new THREE.Mesh(i,b);t.position.x=c/2+this.config.mapOffset,t.doubleSided=!0,this.state.scene.addObject(t);var u=this.factory.createCubeActor(100,h,f,this.config.mapOffset-100,200,0,{fixed:!0,material:null});this.trackActor(u);var v=this.factory.createChainActor(k,this.config.mapOffset,0,2,{material:a,restitution:.1,fixed:!0});for(var w=0;w<v.length;++w){var x=v[w];this.trackActor(x)}},createWrappedMaterial:function(a,b,c){var d=THREE.ImageUtils.loadTexture(c,THREE.UVMapping);d.wrapS=THREE.RepeatWrapping,d.wrapT=THREE.RepeatWrapping,d.minFilter=THREE.LinearFilter,d.magFilter=THREE.LinearFilter,d.repeat.set(a,b),d.needsUpdate=!0;var e=new THREE.MeshLambertMaterial({color:16777215,map:d});return e},onWindowResize:function(a){SCREEN_WIDTH=window.innerWidth,SCREEN_HALFWIDTH=SCREEN_WIDTH/2,this.state.camera.aspect=SCREEN_WIDTH/SCREEN_HEIGHT,this.state.camera.updateProjectionMatrix(),this.state.renderer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT)},onMouseMove:function(a){a.preventDefault(),this.state.mouse.x=a.clientX-SCREEN_HALFWIDTH,this.state.mouse.y=-(a.clientY-SCREEN_HALFHEIGHT)},onKeyDown:function(a){a.which==38?this.state.input.u=!0:a.which==40?this.state.input.d=!0:a.which==37?this.state.input.l=!0:a.which==39?this.state.input.r=!0:a.which==32&&this.superCharge()},onKeyUp:function(a){a.which==38?this.state.input.u=!1:a.which==40?this.state.input.d=!1:a.which==37?this.state.input.l=!1:a.which==39&&(this.state.input.r=!1)}};return l}()