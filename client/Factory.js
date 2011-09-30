var Factory = (function() {
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2World = Box2D.Dynamics.b2World;
    var b2MassData = Box2D.Collision.Shapes.b2MassData;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;

    function Factory(world, physicsScale) {
        this.world = world;
        this.physicsScale = physicsScale;
    }

    Factory.prototype.createPolygonActor = function(vertices, x, y, params) {
        params = params||{};
        var xBounds = {min: null, max: null};
        var yBounds = {min: null, max: null};
        for (var i = 0; i < vertices.length; ++i) {
            var vertice = vertices[i];
            if (xBounds.min == null || vertice.x < xBounds.min) xBounds.min = vertice.x;
            if (xBounds.max == null || vertice.x > xBounds.max) xBounds.max = vertice.x;
            if (yBounds.min == null || vertice.y < yBounds.min) yBounds.min = vertice.y;
            if (yBounds.max == null || vertice.y > yBounds.max) yBounds.max = vertice.y;
        }
        var bottom = yBounds.min - valOrDef(params.bottomPadding, 50);
        var width = xBounds.max - xBounds.min;
        var height = yBounds.max - bottom;
        var ps = this.physicsScale;
        var offsetX = function(x) { return (x - width/2) / ps; }
        var offsetY = function(y) { return 30 + (y - height/2) / ps; }

        var bodyDef = new b2BodyDef();
        bodyDef.position.Set(x / this.physicsScale, y / this.physicsScale);
        if (!params.fixed) bodyDef.type = b2Body.b2_dynamicBody;
        var body = this.world.CreateBody(bodyDef);
        var fixDef = new b2FixtureDef();
        var chain = fixDef.shape = new b2PolygonShape();
        fixDef.restitution = valOrDef(params.restitution, 0.5);
        if (!params.fixed) fixDef.density = valOrDef(params.density, 1.0);
        fixDef.friction = valOrDef(params.friction, 1);
        var vecs = [];
        for (var i = vertices.length - 1; i >= 0; --i) {
            var vertice = vertices[i];
            var vec = new b2Vec2();
            vec.Set(offsetX(vertice.x), offsetY(vertice.y));
            vecs.push(vec);
        }
        //vecs.push(new b2Vec2(offsetX(vertices[vertices.length - 1].x), offsetY(vertices[vertices.length - 1].y)));
        //vecs.push(new b2Vec2(offsetX(vertices[0].x), offsetY(vertices[0].y)));

        vecs.push(new b2Vec2(offsetX(vertices[0].x), offsetY(bottom)));
        vecs.push(new b2Vec2(offsetX(vertices[vertices.length - 1].x), offsetY(bottom)));
        chain.SetAsArray(vecs, vecs.length);
        body.CreateFixture(fixDef);
        return body;
    }

    Factory.prototype.createChainActor = function(vertices, x, y, h, params) {
        params = params||{};
        var xBounds = {min: null, max: null};
        var yBounds = {min: null, max: null};
        for (var i = 0; i < vertices.length; ++i) {
            var vertice = vertices[i];
            if (xBounds.min == null || vertice.x < xBounds.min) xBounds.min = vertice.x;
            if (xBounds.max == null || vertice.x > xBounds.max) xBounds.max = vertice.x;
            if (yBounds.min == null || vertice.y < yBounds.min) yBounds.min = vertice.y;
            if (yBounds.max == null || vertice.y > yBounds.max) yBounds.max = vertice.y;
        }
        var width = xBounds.max - xBounds.min;
        var height = yBounds.max - yBounds.min;
        var ps = this.physicsScale;
        var offsetX = function(x_) { return ((x - width/2) + x_) / ps; }
        var offsetY = function(y_) { return (y + y_) / ps; }

        var bodyDef = new b2BodyDef();
        if (!params.fixed) bodyDef.type = b2Body.b2_dynamicBody;
        var bodies = [];
        var fixDef = new b2FixtureDef();
        fixDef.shape = new b2PolygonShape();
        fixDef.restitution = valOrDef(params.restitution, 0.5);
        if (!params.fixed) fixDef.density = valOrDef(params.density, 1.0);
        fixDef.friction = valOrDef(params.friction, 1);
        for (var i = 1, l = vertices.length; i < l; ++i) {
            var vA = new b2Vec2(vertices[i-1].x, vertices[i-1].y);
            var v = new b2Vec2(vertices[i].x, vertices[i].y);
            v.Subtract(vA);
            var width = v.Length() / ps;
            bodyDef.position.x = offsetX(vA.x + v.x/2);
            bodyDef.position.y = offsetY(vA.y + v.y/2);
            var body = this.world.CreateBody(bodyDef);
            body.SetAngle(Math.atan(v.y / v.x));
            var shape = fixDef.shape = new b2PolygonShape();
            shape.SetAsBox(width / 2, h / 2 / ps);
            body.CreateFixture(fixDef);
            bodies.push(body);
        }
        return bodies;
    }

    Factory.prototype.createCubeActor = function(w, h, d, x, y, z, params) {
        params = params||{};
        var body = this.createPhysicsCube(w, h, x, y, params);
        body.object = this.createCube(new THREE.Vector3(w, h, d), new THREE.Vector3(x, y, z), params);
        return body;
    }

    Factory.prototype.createSphereActor = function(r, x, y, z, params) {
        params = params||{};
        var body = this.createPhysicsSphere(r, x, y, params);
        body.object = this.createSphere(r, new THREE.Vector3(x, y, z), params);
        return body;
    }

    Factory.prototype.createPhysicsCube = function(w, h, x, y, params) {
        params = params||{};
        var bodyDef = new b2BodyDef();
        bodyDef.position.Set(x / this.physicsScale, y / this.physicsScale);
        if (!params.fixed) bodyDef.type = b2Body.b2_dynamicBody;
        var body = this.world.CreateBody(bodyDef);
        var fixDef = new b2FixtureDef();
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox((w/2) / this.physicsScale, (h/2) / this.physicsScale);
        fixDef.restitution = valOrDef(params.restitution, 0.5);
        if (!params.fixed) fixDef.density = valOrDef(params.density, 1.0);
        fixDef.friction = valOrDef(params.friction, 1);
        body.CreateFixture(fixDef);
        body.w = 1.0;
        body.h = 1.0;
        return body;
    }

    Factory.prototype.createPhysicsSphere = function(r, x, y, params) {
        params = params||{};
        var bodyDef = new b2BodyDef();
        bodyDef.position.Set(x / this.physicsScale, y / this.physicsScale);
        if (!params.fixed) bodyDef.type = b2Body.b2_dynamicBody;
        var body = this.world.CreateBody(bodyDef);
        var fixDef = new b2FixtureDef();
        fixDef.shape = new b2CircleShape(r / this.physicsScale);
        fixDef.restitution = valOrDef(params.restitution, 0.5);
        if (!params.fixed) fixDef.density = valOrDef(params.density, 1.0);
        fixDef.friction = valOrDef(params.friction, 1);
        body.CreateFixture(fixDef);
        body.w = 1.0;
        body.h = 1.0;
        return body;
    }

    Factory.prototype.createCube = function(s, p, params) {
        var cube = new THREE.Mesh(
            new THREE.CubeGeometry(s.x, s.y, s.z, valOrDef(params.segmentsX, 1), valOrDef(params.segmentsY, 1), valOrDef(params.segmentsZ, 1)),
            params.material || new THREE.MeshLambertMaterial({color: 0xffffff})
        );
        cube.position = p;
        cube.castShadow = true;
        cube.receiveShadow = true;
        return cube;
    }

    Factory.prototype.createSphere = function(r, p, params) {
        var sphere = new THREE.Mesh (
            new THREE.SphereGeometry(r, valOrDef(params.segmentsW, 20), valOrDef(params.segmentsH, 20)),
            params.material || new THREE.MeshLambertMaterial({color: 0xffffff})
        );
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.position = p;
        return sphere;
    }

    return Factory;
})();
