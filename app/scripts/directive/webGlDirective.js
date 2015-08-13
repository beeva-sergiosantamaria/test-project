/**
 * Created by sergiosantamaria on 20/07/15.
 */
angular.module('testProjectApp')

  .directive('webGl', function() {
    return {
      restrict: 'EA',
      scope: {},
      link: function($scope, $element) {
        // 1 micrometer to 100 billion light years in one scene, with 1 unit = 1 meter?  preposterous!  and yet...
        var NEAR = 1e-6, FAR = 1e27;
        var SCREEN_WIDTH = window.innerWidth;
        var SCREEN_HEIGHT = window.innerHeight;
        var screensplit = .25, screensplit_right = 0;
        var mouse = [.5, .5];
        var zoompos = -100, minzoomspeed = .015;
        var zoomspeed = minzoomspeed;

        var container;
        var objects = {};

        // Generate a number of text labels, from 1µm in size up to 100,000,000 light years
        // Try to use some descriptive real-world examples of objects at each scale

        var labeldata = [
          { size: .01,           scale: .001, label: "Nivel 1", scale: .0001 }, // FIXME - triangulating text fails at this size, so we scale instead
          { size: .01,           scale: 0.1,  label: "Nivel 2", scale: .1},
          { size: .01,           scale: 1.0,  label: "Nivel 3", scale: 1 },
          { size: 1,             scale: 1.0,  label: "Nivel 4", scale: 1 },
          { size: 10,            scale: 1.0,  label: "Nivel 5", scale: 1 },
          { size: 100,           scale: 1.0,  label: "Nivel 6", scale: 1 },
          { size: 1000,          scale: 1.0,  label: "Nivel 7", scale: 1 },
          { size: 10000,         scale: 1.0,  label: "Nivel 8", scale: 1 },
          { size: 3400000,       scale: 1.0,  label: "Nivel 9", scale: 1 },
          { size: 12000000,      scale: 1.0,  label: "Nivel 10", scale: 1 },
          { size: 1400000000,    scale: 1.0,  label: "Nivel 11", scale: 1 },
          { size: 7.47e12,       scale: 1.0,  label: "Nivel 12", scale: 1 },
          { size: 9.4605284e15,  scale: 1.0,  label: "Nivel 13", scale: 1 },
          { size: 3.08567758e16, scale: 1.0,  label: "Nivel 14", scale: 1 },
          { size: 1e19,          scale: 1.0,  label: "Nivel 15", scale: 1 },
          { size: 1.135e21,      scale: 1.0,  label: "Nivel 16", scale: 1 },
          { size: 9.46e23,       scale: 1.0,  label: "Nivel 17", scale: 1 }
        ];

        init();
        animate();

        function init() {

          container = document.getElementById( 'container' );

          // Initialize two copies of the same scene, one with normal z-buffer and one with logarithmic z-buffer
          //objects.normal = initScene('normal', false);
          objects.logzbuf = initScene('logzbuf', true);

          // Resize border allows the user to easily compare effects of logarithmic depth buffer over the whole scene
          //border = document.getElementById( 'renderer_border' );
          //border.addEventListener("mousedown", onBorderMouseDown);

          window.addEventListener( 'resize', onWindowResize, false );
          window.addEventListener( 'mousewheel', onMouseWheel, false );
          window.addEventListener( 'DOMMouseScroll', onMouseWheel, false );
          window.addEventListener( 'mousemove', onMouseMove, false );

          render();
        }

        function initScene(name, logDepthBuf) {

          var scene = new THREE.Scene();
          var framecontainer = document.getElementById('container_' + name);

          var camera = new THREE.PerspectiveCamera( 50, screensplit * SCREEN_WIDTH / SCREEN_HEIGHT, NEAR, FAR );
          scene.add(camera);

          var light = new THREE.DirectionalLight(0xffffff, 1);
          light.position.set(100,100,100);
          scene.add(light);

          var materialargs = {
            color: 0xffffff,
            specular: 0xffaa00,
            shininess: 50,
            shading: THREE.SmoothShading,
            emissive: 0x000000
          };

          var geomtransform = new THREE.Matrix4();
          var tmpvec = new THREE.Vector3();
          var meshes = [];
          var coloroffset = 0;
          var colorskip = ['black', 'antiquewhite', 'bisque', 'beige', 'blanchedalmond', 'darkblue', 'darkcyan'];
          var colorkeys = Object.keys( THREE.ColorKeywords );

          for (var i = 0; i < labeldata.length; i++) {
            var scale = labeldata[i].scale || 1;
            var labelgeo = new THREE.TextGeometry( labeldata[i].label, {
              size: labeldata[i].size,
              height: labeldata[i].size / 2,
              font: 'helvetiker'
            });
            labelgeo.computeBoundingSphere();

            // center text
            geomtransform.setPosition( tmpvec.set( -labelgeo.boundingSphere.radius, 0, 0 ) );
            labelgeo.applyMatrix( geomtransform );

            // Pick a color at "random".  Exclude black, because it looks bad.
            while ( colorskip.indexOf( colorkeys[ i + coloroffset ] ) != -1 ) {
              coloroffset++;
            }
            materialargs.color = THREE.ColorKeywords[ colorkeys[ i + coloroffset ] ];

            var material = new THREE.MeshPhongMaterial( materialargs );

            var textmesh = new THREE.Mesh( labelgeo, material );
            textmesh.scale.set(scale, scale, scale);
            textmesh.position.z = -labeldata[i].size * scale;
            textmesh.position.y = labeldata[i].size / 4 * scale;
            textmesh.updateMatrix();

            var dotmesh = new THREE.Mesh(new THREE.SphereGeometry(labeldata[i].size * scale / 2, 24, 12), material);
            dotmesh.position.y = -labeldata[i].size / 4 * scale;
            dotmesh.updateMatrix();

            var merged = new THREE.Geometry();
            merged.merge( textmesh.geometry, textmesh.matrix );
            merged.merge( dotmesh.geometry, dotmesh.matrix );

            var mesh = new THREE.Mesh(merged, material);
            mesh.position.z = -labeldata[i].size * 1 * scale;

            scene.add(mesh);
          }

          var renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: logDepthBuf });
          renderer.setPixelRatio( window.devicePixelRatio );
          renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
          renderer.domElement.style.position = "relative";
          renderer.domElement.id = 'renderer_' + name;
          framecontainer.appendChild(renderer.domElement);

          return { container: framecontainer, renderer: renderer, scene: scene, camera: camera }
        }

        function updateRendererSizes() {

          // Recalculate size for both renderers when screen size or split location changes

          SCREEN_WIDTH = window.innerWidth;
          SCREEN_HEIGHT = window.innerHeight;

          screensplit_right = 1 - screensplit;

          objects.logzbuf.renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
          objects.logzbuf.camera.aspect = screensplit_right * SCREEN_WIDTH / SCREEN_HEIGHT;
          objects.logzbuf.camera.updateProjectionMatrix();
          objects.logzbuf.camera.setViewOffset( SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH * screensplit, 0, SCREEN_WIDTH * screensplit_right, SCREEN_HEIGHT );
          objects.logzbuf.container.style.width = '100%';

        }

        function animate() {

          requestAnimationFrame( animate );
          render();

        }

        function render() {

          // Put some limits on zooming
          var minzoom = labeldata[0].size * labeldata[0].scale*1;
          var maxzoom = labeldata[labeldata.length-1].size * labeldata[labeldata.length-1].scale * 100;
          var damping = (Math.abs(zoomspeed) > minzoomspeed ? .95 : 1.0);

          // Zoom out faster the further out you go
          var zoom = THREE.Math.clamp(Math.pow(Math.E, zoompos), minzoom, maxzoom);
          zoompos = Math.log(zoom);

          // Slow down quickly at the zoom limits
          if ((zoom == minzoom && zoomspeed < 0) || (zoom == maxzoom && zoomspeed > 0)) {
            damping = .85;
          }

          zoompos += zoomspeed;
          zoomspeed *= damping;

          objects.logzbuf.camera.position.x = Math.sin(.5 * Math.PI * (mouse[0] - .5)) * zoom;
          objects.logzbuf.camera.position.y = Math.sin(.25 * Math.PI * (mouse[1] - .5)) * zoom;
          objects.logzbuf.camera.position.z = Math.cos(.5 * Math.PI * (mouse[0] - .5)) * zoom;
          objects.logzbuf.camera.lookAt(objects.logzbuf.scene.position);

          // Update renderer sizes if the split has changed
          if (screensplit_right != 1 - screensplit) {
            updateRendererSizes();
          }
          objects.logzbuf.renderer.render(objects.logzbuf.scene, objects.logzbuf.camera);

        }

        function onWindowResize(event) {
          updateRendererSizes();
        }

        function onBorderMouseDown(ev) {
          // activate draggable window resizing bar
          window.addEventListener("mousemove", onBorderMouseMove);
          window.addEventListener("mouseup", onBorderMouseUp);
          ev.stopPropagation();
          ev.preventDefault();
        }
        function onBorderMouseMove(ev) {
          screensplit = Math.max(0, Math.min(1, ev.clientX / window.innerWidth));
          ev.stopPropagation();
        }
        function onBorderMouseUp(ev) {
          window.removeEventListener("mousemove", onBorderMouseMove);
          window.removeEventListener("mouseup", onBorderMouseUp);
        }
        function onMouseMove(ev) {
          mouse[0] = ev.clientX / window.innerWidth;
          mouse[1] = ev.clientY / window.innerHeight;
        }
        function onMouseWheel(ev) {
          var amount = -ev.wheelDeltaY || ev.detail;
          var dir = amount / Math.abs(amount);
          zoomspeed = dir/10;

          // Slow down default zoom speed after user starts zooming, to give them more control
          minzoomspeed = 0.001;
        }
      }
    }
  })
  .directive('webLens', function(filteredData,cpRelations) {
    return {
      restrict: 'EA',
      scope: {},
      link: function() {

        var container, group, groupCubos;

        var camera, scene, renderer, controls;
        var filterdata = [], CPRelations = [];
        var contPoints = 0;
        var originalCameraPosition = { x: 0, y: 3000, z: 15000 };
        var centerCameraPosition = { x: 0, y: 18000, z: 1000 };

        var clock = new THREE.Clock();
        var obj = initSVGObject();

        filteredData.then(function(data){
          filterdata = data;
          cpRelations.then(function(data){
              CPRelations = data;
              init();
              animate();
            });
          });

        function init() {

          console.log('filtered data: ', filterdata);
          console.log('cp relations: ', CPRelations);

          container = document.getElementById( 'containerLens' );

          // camera

          camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 20000 );
          camera.position.z = originalCameraPosition.z;
          camera.position.y = originalCameraPosition.y;
          //
          controls = new THREE.FlyControls( camera );

          controls.movementSpeed = 300;
          controls.domElement = container;
          //controls.rollSpeed = Math.PI / 30     ;
          controls.autoForward = false;
          controls.dragToLook = false;

          controls.enabled = true;

          // scene

          scene = new THREE.Scene();
          scene.fog = new THREE.Fog( 0x000000, 3500, 30000 );
          scene.fog.color.setHSL( 0.51, 0.4, 0.01 );

          group = new THREE.Group();
          groupCubos = new THREE.Group();

          // world

          var s = 50;

          //var cube = new THREE.BoxGeometry( 5*s, 4*s, s/2 );
          var cube = new THREE.BoxGeometry( s, s, s );
          var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 50 } );


          for ( var i = 0; i < 500; i ++ ) {

            var mesh = new THREE.Mesh( cube, material );

            mesh.position.x = 8000 * ( 2.0 * Math.random() - 1.0 );
            mesh.position.y = 8000 * ( 2.0 * Math.random() - 1.0 );
            mesh.position.z = 8000 * ( 2.0 * Math.random() - 1.0 );

            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.rotation.z = Math.random() * Math.PI;

            groupCubos.add( mesh );
          }
          scene.add(groupCubos);
          // lights

          var ambient = new THREE.AmbientLight( 0xffffff );
          ambient.color.setHSL( 0.1, 0.3, 0.2 );
          scene.add( ambient );


          var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
          dirLight.position.set( 0, -1, 0 ).normalize();
          scene.add( dirLight );

          dirLight.color.setHSL( 0.1, 0.7, 0.5 );

          // lens flares

          var textureFlare0 = THREE.ImageUtils.loadTexture( "images/lensflare0.png" );
          var textureFlare2 = THREE.ImageUtils.loadTexture( "images/lensflare2.png" );
          var textureFlare3 = THREE.ImageUtils.loadTexture( "images/lensflare3.png" );

          //addLight( 0.55, 0.9, 0.5, 5000, 0, -1000 );
          //addLight( 0.08, 0.8, 0.5, -5000, 0, -1000 );
          addLight( 0.995, 0.5, 0.9, 5000, 5000, -1000 );

          console.log('scene: ', scene.children);

          function addLight( h, s, l, x, y, z ) {

            var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
            light.color.setHSL( h, s, l );
            light.position.set( x, y, z );
            scene.add( light );

            var flareColor = new THREE.Color( 0xffffff );
            flareColor.setHSL( h, s, l + 0.5 );

            var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

            lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
            lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
            lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

            lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
            lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
            lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
            lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

            lensFlare.customUpdateCallback = lensFlareUpdateCallback;
            lensFlare.position.copy( light.position );

            scene.add( lensFlare );

          }
          scene.add(group);

          addGeoObject(group, obj);

          // renderer

          renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
          renderer.setClearColor( scene.fog.color );
          renderer.setPixelRatio( window.devicePixelRatio );
          renderer.setSize( window.innerWidth, window.innerHeight );
          container.appendChild( renderer.domElement );
          //
          renderer.gammaInput = true;
          renderer.gammaOutput = true;
          // events
          document.getElementById("containerLens").addEventListener("mousewheel", MouseWheelHandler, false);
          document.getElementById("containerLens").addEventListener( 'resize', onWindowResize, false );
        }

        function MouseWheelHandler( event ) {
          var Distritos = scene.getObjectByName( "grupoDistritos" ).children;
          console.log('evento mouse wheel: ', event.x, event.y);
          console.log('camera: ',camera)
          if(event.wheelDelta == 120 && contPoints == 0) {
            if(camera.position.y){
              movement(centerCameraPosition.x,centerCameraPosition.y,centerCameraPosition.z,camera.position,0);
              movement((-90 * Math.PI / 180), camera.rotation.y,camera.rotation.z,camera.rotation,0);
              for(var a = 0; a<(Distritos.length); a++){
                movement(Distritos[a].position.x*(0.1*a), Distritos[a].position.y, Distritos[a].position.z, Distritos[a].position, 800);
              }
            }
            contPoints = 1;
          }
          if(event.wheelDelta == -120 && contPoints == 1) {
            movement(originalCameraPosition.x,originalCameraPosition.y,originalCameraPosition.z,camera.position,0);
            movement(0,camera.rotation.y,camera.rotation.z,camera.rotation,0);
            for(var a = 0; a<(Distritos.length); a++){
              movement(Distritos[a].position.x/(0.1*a), Distritos[a].position.y, Distritos[a].position.z, Distritos[a].position, 800);
            }
            contPoints = 0;
           }
        }
        function movement(valueX, valueY, valueZ, object,delay){
          var tween = new TWEEN.Tween(object).to({
            x: valueX,
            y: valueY,
            z: valueZ
          }).easing(TWEEN.Easing.Sinusoidal.InOut).onUpdate(function () {
          }).delay(delay).start();
        }
        function lensFlareUpdateCallback( object ) {

          var f, fl = object.lensFlares.length;
          var flare;
          var vecX = -object.positionScreen.x * 2;
          var vecY = -object.positionScreen.y * 2;

          for( f = 0; f < fl; f++ ) {

            flare = object.lensFlares[ f ];

            flare.x = object.positionScreen.x + vecX * flare.distance;
            flare.y = object.positionScreen.y + vecY * flare.distance;

            flare.rotation = 0;
          }
          object.lensFlares[ 2 ].y += 0.025;
          object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
        }

        function onWindowResize( event ) {
          renderer.setSize( window.innerWidth, window.innerHeight );
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }

        function animate() {

          requestAnimationFrame( animate );
          TWEEN.update();
          render();

        }

        function render() {

          var delta = clock.getDelta();

          controls.update( delta );
          renderer.render( scene, camera );

        }

        var points = [{"id":1,"point":{"x":-350,"y":12,"z":2300}},{"id":2,"point":{"x":-85,"y":12,"z":3000}},{"id":3,"point":{"x":250,"y":12,"z":2500}},
          {"id":4,"point":{"x":300,"y":12,"z":2000}},{"id":5,"point":{"x":400,"y":12,"z":1300}},{"id":6,"point":{"x":-90,"y":12,"z":1000}},
          {"id":7,"point":{"x":-300,"y":12,"z":1700}},{"id":8,"point":{"x":-1800,"y":12,"z":-1000}},{"id":9,"point":{"x":-1400,"y":12,"z":1400}},
          {"id":10,"point":{"x":-2200,"y":12,"z":3300}},{"id":11,"point":{"x":-1200,"y":12,"z":3500}},{"id":12,"point":{"x":-400,"y":12,"z":3500}},
          {"id":13,"point":{"x":500,"y":12,"z":3500}},{"id":14,"point":{"x":1200,"y":12,"z":2800}},{"id":15,"point":{"x":1100,"y":12,"z":2000}},
          {"id":16,"point":{"x":1300,"y":12,"z":500}},{"id":17,"point":{"x":-200,"y":12,"z":4500}},{"id":18,"point":{"x":1500,"y":12,"z":4500}},
          {"id":19,"point":{"x":2500,"y":12,"z":3200}},{"id":20,"point":{"x":2000,"y":12,"z":2100}},{"id":21,"point":{"x":2700,"y":12,"z":800}}];

        function initSVGObject() {
          var obj = {};
          obj.paths = [
            //1
            "M 219.4375,343.59375 L 219.4375,343.75 L 222.5,349.4375 L 220,358.21875 C 220,358.21875 219.67746,358.17746 219.125,358.25 C 218.57254,358.32254 217.77679,358.49554 216.90625,358.875 C 216.03571,359.25446 215.07924,359.86049 214.125,360.78125 C 213.17076,361.70201 212.24107,362.95982 211.4375,364.65625 L 211.4375,368.5625 L 217.3125,368.75 L 217.84375,377.84375 C 220.05357,379.11607 222.2583,380.10205 224.375,380.8125 C 226.4917,381.52295 228.52874,381.98633 230.5,382.25 C 232.47126,382.51367 234.35149,382.56801 236.125,382.5 C 237.89851,382.43199 239.57031,382.2221 241.09375,381.9375 C 242.61719,381.6529 243.9977,381.29234 245.21875,380.90625 C 246.20994,380.59284 247.02054,380.28034 247.78125,379.96875 L 244.46875,377.25 L 245.21875,364.875 L 250.15625,354.25 C 247.29202,352.71901 244.60122,351.41122 242.125,350.28125 C 239.63721,349.146 237.35519,348.19726 235.25,347.40625 C 231.03962,345.82422 227.57813,344.8817 224.84375,344.3125 C 222.41799,343.80755 220.7555,343.66212 219.4375,343.59375 z",
            //2
            "M 247.78125,379.96875 C 247.02054,380.28034 246.20994,380.59284 245.21875,380.90625 C 243.9977,381.29234 242.61719,381.6529 241.09375,381.9375 C 239.57031,382.2221 237.89851,382.43199 236.125,382.5 C 234.35149,382.56801 232.47126,382.51367 230.5,382.25 C 228.52874,381.98633 226.4917,381.52295 224.375,380.8125 C 222.2583,380.10205 220.05357,379.11607 217.84375,377.84375 L 217.3125,368.75 L 211.4375,368.5625 L 211.4375,377.84375 L 209.9375,379.65625 L 210,379.65625 L 210,387.15625 L 211.4375,390 L 217.5,389.65625 L 229.28125,399.65625 L 245.625,419.25 C 245.73135,419.23151 246.21677,419.14496 247.15625,418.84375 C 248.19008,418.51229 249.61009,417.94575 251.09375,417.125 C 251.83558,416.71463 252.59896,416.24979 253.34375,415.6875 C 254.08854,415.12521 254.794,414.48394 255.46875,413.75 C 256.1435,413.01606 256.78079,412.17532 257.3125,411.25 C 257.84421,410.32468 258.27808,409.32392 258.59375,408.1875 L 267.6875,403.125 L 268.21875,402.15625 C 267.92791,401.12584 267.62449,400.07576 267.0625,398.9375 C 266.36407,397.52289 265.441,396.02591 264.21875,394.46875 C 262.9965,392.91159 261.45622,391.29807 259.59375,389.625 L 247.78125,379.96875 z",
            //3
            "M 286.21875,366 L 280.53125,363.5625 L 252.6875,361.59375 L 246.03125,363.15625 L 245.21875,364.875 L 244.46875,377.25 L 259.59375,389.625 C 261.45622,391.29807 262.9965,392.91159 264.21875,394.46875 C 265.441,396.02591 266.36407,397.52289 267.0625,398.9375 C 267.62449,400.07576 267.92791,401.12584 268.21875,402.15625 L 278.3125,383.9375 C 278.3125,383.9375 279.10569,382.7621 280.25,380.78125 C 281.39431,378.8004 282.86199,376.00143 284.15625,372.75 C 284.80338,371.12429 285.40808,369.40394 285.90625,367.59375 C 286.04729,367.08125 286.09497,366.52602 286.21875,366 z",
            //4
            "M 287.375,328.09375 L 266.25,337.84375 L 251.65625,334.625 L 251.78125,338.46875 L 253.5625,342.375 L 253.15625,347.8125 L 246.03125,363.15625 L 252.6875,361.59375 L 280.53125,363.5625 L 286.21875,366 C 286.53216,364.66808 286.87001,363.33503 287.03125,361.96875 C 287.25617,360.06288 287.32888,358.13153 287.15625,356.21875 C 286.98362,354.30597 286.56948,352.42465 285.875,350.59375 L 288.40625,336.46875 L 287.375,335.9375 L 287.375,328.09375 z",
            //5
            "M 276.75,267.03125 L 263.03125,268.78125 L 259.59375,282.03125 L 259.46875,282 C 259.46521,282.01207 259.47231,282.01914 259.46875,282.03125 L 251.28125,322.4375 L 251.65625,334.625 L 266.25,337.84375 L 287.375,328.09375 L 287.375,324.84375 L 285.875,319.78125 L 283.84375,301.59375 L 279.3125,290 L 274.75,273.3125 C 274.75,273.3125 275.07226,272.09732 275.65625,270.1875 C 275.9116,269.35242 276.39806,268.08089 276.75,267.03125 z",
            //6
            "M 229.65625,318.28125 L 251.3125,323.03125 L 251.28125,322.4375 L 259.46875,282.03125 C 259.47231,282.01914 259.46521,282.01207 259.46875,282 L 244.59375,279.25 L 241.0625,282.15625 L 234.875,282.65625 L 228.375,288.125 C 228.94932,288.74145 229.54387,289.34573 230,290.03125 C 230.65796,291.02011 231.17132,292.08454 231.53125,293.21875 C 231.89118,294.35296 232.09148,295.55495 232.09375,296.84375 C 232.09602,298.13255 231.88379,299.48486 231.46875,300.9375 C 231.05371,302.39014 230.42324,303.93678 229.53125,305.5625 C 228.63926,307.18822 227.49107,308.91071 226.0625,310.71875 C 227.33547,312.74829 228.4928,314.3676 229.1875,315.6875 C 229.53485,316.34745 229.77432,316.91742 229.84375,317.4375 C 229.88541,317.74955 229.73817,318.00528 229.65625,318.28125 z",
            //7
            "M 229.65625,318.28125 C 229.60164,318.46523 229.65021,318.68165 229.53125,318.84375 C 229.3199,319.13176 229.02384,319.28025 228.625,319.375 C 228.22616,319.46975 227.71866,319.50189 227.09375,319.53125 C 225.84392,319.58998 224.10443,319.65438 221.71875,320.21875 C 221.71875,320.21875 220.48822,320.51659 219.34375,321.3125 C 218.77152,321.71046 218.20596,322.23948 217.84375,322.90625 C 217.48154,323.57302 217.32143,324.36161 217.5,325.34375 L 219.65625,332.84375 L 219.4375,343.59375 C 220.7555,343.66212 222.41799,343.80755 224.84375,344.3125 C 227.57813,344.8817 231.03962,345.82422 235.25,347.40625 C 237.35519,348.19726 239.63721,349.146 242.125,350.28125 C 244.60122,351.41122 247.29202,352.71901 250.15625,354.25 L 253.15625,347.8125 L 253.5625,342.375 L 251.78125,338.46875 L 251.3125,323.03125 L 229.65625,318.28125 z",
            //8
            "M 314.28125,31.25 C 309.13756,31.487526 303.01562,35.656249 301.0625,52.84375 C 301.0625,52.84375 302.8616,65.352679 290.71875,69.28125 C 290.71875,69.28125 272.49554,74.299111 269.28125,92.15625 C 269.28125,92.15625 270.37054,98.933034 249.65625,115.71875 L 230.34375,115.34375 L 221.78125,111.0625 L 212.15625,109.65625 C 212.15625,109.65625 209.62946,103.91964 200.34375,98.5625 L 164.28125,82.15625 L 158.21875,84.28125 L 138.21875,83.5625 L 140.71875,75.71875 L 139.28125,73.21875 L 137.15625,72.5 L 128.9375,67.84375 L 125,67.5 L 132.84375,82.5 C 132.84375,82.5 127.84375,89.651782 100.34375,88.9375 L 93.9375,92.84375 L 91.78125,90.71875 L 83.5625,90.71875 L 70,96.78125 L 64.28125,93.9375 L 58.21875,88.9375 L 49.28125,91.0625 L 39.65625,99.65625 C 39.65625,99.65625 38.928571,109.64732 35,113.21875 C 35,113.21875 28.205355,120.72322 33.5625,126.4375 C 33.5625,126.4375 37.85268,128.92411 34.28125,134.28125 L 46.0625,138.5625 L 68.9375,200.34375 L 66.78125,205.71875 C 66.78125,205.71875 61.419646,214.28572 83.5625,220 L 82.84375,229.28125 L 88.21875,243.21875 L 83.21875,260.34375 C 83.21875,260.34375 83.189599,260.5235 83.1875,260.53125 L 125.75,279.375 L 143.9375,274.59375 L 168.1875,274.59375 C 168.1875,274.59375 168.47322,275.55369 169,276.625 C 169.26339,277.16066 169.59512,277.71029 169.96875,278.1875 C 170.34238,278.66471 170.78044,279.08001 171.25,279.28125 C 171.71956,279.48249 172.23006,279.47974 172.78125,279.1875 C 173.33244,278.89526 173.91273,278.31575 174.53125,277.3125 C 175.14977,276.30925 175.79721,274.86927 176.46875,272.9375 C 177.14029,271.00573 177.82099,268.57781 178.53125,265.5 L 190.28125,276.71875 L 199.28125,276.78125 C 199.28125,276.78125 202.39062,277.11049 206.6875,278.03125 C 208.83594,278.49163 211.27427,279.10477 213.78125,279.90625 C 216.28823,280.70773 218.86161,281.68973 221.25,282.90625 C 222.4442,283.51451 223.58116,284.18037 224.65625,284.90625 C 225.73134,285.63213 226.7599,286.4285 227.65625,287.28125 C 227.93121,287.54283 228.12087,287.85223 228.375,288.125 L 234.875,282.65625 L 241.0625,282.15625 L 244.59375,279.25 L 259.59375,282.03125 L 263.03125,268.78125 L 276.75,267.03125 C 277.20293,265.68039 277.55227,264.49648 278.15625,262.96875 C 279.22954,260.25396 280.53212,257.4149 282,255 C 282.73394,253.79255 283.52892,252.67532 284.34375,251.75 C 285.15858,250.82468 285.99112,250.09883 286.875,249.59375 C 288.45863,248.538 290.28763,247.57878 292.03125,246.1875 C 292.90306,245.49186 293.77488,244.67524 294.5625,243.6875 C 295.35012,242.69976 296.06686,241.54365 296.6875,240.125 C 297.30814,238.70635 297.81664,237.05087 298.1875,235.0625 C 298.55836,233.07413 298.77422,230.7594 298.8125,228.0625 C 298.83222,226.67334 298.64766,224.85506 298.5625,223.25 C 296.39762,221.09058 294.33725,218.67275 292.5,215.71875 C 292.5,215.71875 291.42857,206.0625 277.5,203.5625 C 277.5,203.5625 290.0134,196.77678 282.15625,183.5625 C 282.15625,183.5625 277.85714,177.49107 275,163.5625 C 275,163.5625 270.35268,132.14286 254.28125,122.5 C 254.28125,122.5 260.0134,124.28571 277.15625,115 L 289.65625,109.28125 C 289.65625,109.28125 300.72322,98.200895 308.9375,115.34375 L 312.5,125.34375 C 316.6425,135.0591 334.51274,137.84122 350.34375,133.5625 C 354.98661,132.17959 358.21874,126.44958 365.71875,123.21875 C 365.71875,123.21875 386.79466,107.86161 356.4375,95.71875 C 356.4375,95.71875 360.70534,75.357142 346.0625,72.5 C 346.0625,72.5 349.6518,43.214285 328.9375,40 C 328.9375,40 329.29911,38.562502 322.15625,33.5625 C 322.15625,33.5625 319.67076,31.852121 316.40625,31.375 C 315.72614,31.2756 315.01606,31.216068 314.28125,31.25 z",
            //9
            "M 211.4375,364.65625 C 212.24107,362.95982 213.17076,361.70201 214.125,360.78125 C 215.07924,359.86049 216.03571,359.25446 216.90625,358.875 C 217.77679,358.49554 218.57254,358.32254 219.125,358.25 C 219.67746,358.17746 220,358.21875 220,358.21875 L 222.5,349.4375 L 219.4375,343.75 L 219.65625,332.84375 L 217.5,325.34375 C 217.32143,324.36161 217.48154,323.57302 217.84375,322.90625 C 218.20596,322.23948 218.77152,321.71046 219.34375,321.3125 C 220.48822,320.51659 221.71875,320.21875 221.71875,320.21875 C 224.10443,319.65438 225.84392,319.58998 227.09375,319.53125 C 227.71866,319.50189 228.22616,319.46975 228.625,319.375 C 229.02384,319.28025 229.3199,319.13176 229.53125,318.84375 C 229.82864,318.4385 229.91318,317.95758 229.84375,317.4375 C 229.77432,316.91742 229.53485,316.34745 229.1875,315.6875 C 228.4928,314.3676 227.33547,312.74829 226.0625,310.71875 C 227.49107,308.91071 228.63926,307.18822 229.53125,305.5625 C 230.42324,303.93678 231.05371,302.39014 231.46875,300.9375 C 231.88379,299.48486 232.09602,298.13255 232.09375,296.84375 C 232.09148,295.55495 231.89118,294.35296 231.53125,293.21875 C 231.17132,292.08454 230.65796,291.02011 230,290.03125 C 229.34204,289.04239 228.5526,288.134 227.65625,287.28125 C 226.7599,286.4285 225.73134,285.63213 224.65625,284.90625 C 223.58116,284.18037 222.4442,283.51451 221.25,282.90625 C 218.86161,281.68973 216.28823,280.70773 213.78125,279.90625 C 211.27427,279.10477 208.83594,278.49163 206.6875,278.03125 C 202.39062,277.11049 199.28125,276.78125 199.28125,276.78125 L 190.28125,276.71875 L 178.53125,265.5 C 177.82099,268.57781 177.14029,271.00573 176.46875,272.9375 C 175.79721,274.86927 175.14977,276.30925 174.53125,277.3125 C 173.91273,278.31575 173.33244,278.89526 172.78125,279.1875 C 172.23006,279.47974 171.71956,279.48249 171.25,279.28125 C 170.78044,279.08001 170.34238,278.66471 169.96875,278.1875 C 169.59512,277.71029 169.26339,277.16066 169,276.625 C 168.47322,275.55369 168.1875,274.59375 168.1875,274.59375 L 143.9375,274.59375 L 125.75,279.375 L 83.1875,260.53125 C 83.031882,261.10549 77.275384,282.5 86.4375,282.5 C 86.4375,282.5 136.42411,274.63839 134.28125,319.28125 L 143.21875,316.4375 L 156.4375,318.9375 L 155,341.4375 C 155,341.4375 131.41517,347.86608 147.84375,383.9375 L 147.78125,383.9375 C 148.37048,384.34985 148.94608,384.76174 149.5625,385.03125 C 150.34802,385.3747 151.15262,385.61189 151.96875,385.75 C 152.78488,385.88811 153.60594,385.94366 154.4375,385.90625 C 155.26906,385.86884 156.10568,385.74561 156.9375,385.5625 C 158.60114,385.19629 160.27009,384.55134 161.84375,383.78125 C 163.41741,383.01116 164.8877,382.12291 166.25,381.1875 C 167.6123,380.25209 168.84542,379.26842 169.875,378.40625 C 171.93415,376.68192 173.21875,375.34375 173.21875,375.34375 L 189.28125,372.84375 L 191.78125,369.28125 L 211.4375,364.28125 L 211.4375,364.65625 z",
            //10
            "M 146.6875,444.90625 L 157.5,435.71875 L 158.21875,426.78125 L 166.78125,419.65625 L 167.5,416.4375 L 164.65625,410.34375 C 164.65625,410.34375 165.42634,410.70089 166.6875,410.96875 C 167.31808,411.10268 168.07338,411.19978 168.90625,411.25 C 169.73912,411.30022 170.63393,411.29018 171.59375,411.15625 C 172.55357,411.02232 173.58231,410.76228 174.59375,410.34375 C 175.60519,409.92522 176.60603,409.36607 177.59375,408.5625 C 178.58147,407.75893 179.54883,406.72656 180.4375,405.4375 C 181.32617,404.14844 182.12946,402.59375 182.84375,400.71875 L 186.4375,400.71875 L 193.5625,390.71875 L 205.34375,380 L 209.65625,380 L 211.4375,377.84375 L 211.4375,364.28125 L 191.78125,369.28125 L 189.28125,372.84375 L 173.21875,375.34375 C 173.21875,375.34375 171.93415,376.68192 169.875,378.40625 C 168.84542,379.26842 167.6123,380.25209 166.25,381.1875 C 164.8877,382.12291 163.41741,383.01116 161.84375,383.78125 C 160.27009,384.55134 158.60114,385.19629 156.9375,385.5625 C 156.10568,385.74561 155.26906,385.86884 154.4375,385.90625 C 153.60594,385.94366 152.78488,385.88811 151.96875,385.75 C 151.15262,385.61189 150.34802,385.3747 149.5625,385.03125 C 148.94608,384.76174 148.37048,384.34985 147.78125,383.9375 L 144.28125,384.65625 C 144.28125,384.65625 137.49554,396.77232 129.28125,392.84375 L 117.15625,392.84375 C 117.15625,392.84375 107.49107,393.58483 103.5625,392.15625 C 103.5625,392.15625 100.72768,387.15626 77.15625,384.65625 L 100,435 L 103.5625,431.78125 L 110.71875,437.84375 L 117.5,437.5 C 117.5,437.5 123.57143,452.14732 135,440.71875 L 146.6875,444.90625 z",
            //11
            "M 209.9375,379.65625 L 209.65625,380 L 207.4375,380 L 205,380.3125 L 193.5625,390.71875 L 186.4375,400.71875 L 182.84375,400.71875 C 182.12946,402.59375 181.32617,404.14844 180.4375,405.4375 C 179.54883,406.72656 178.58147,407.75893 177.59375,408.5625 C 176.60603,409.36607 175.60519,409.92522 174.59375,410.34375 C 173.58231,410.76228 172.55357,411.02232 171.59375,411.15625 C 170.63393,411.29018 169.73912,411.30022 168.90625,411.25 C 168.07338,411.19978 167.31808,411.10268 166.6875,410.96875 C 165.42634,410.70089 164.65625,410.34375 164.65625,410.34375 L 167.5,416.4375 L 166.78125,419.65625 L 158.21875,426.78125 L 157.5,435.71875 L 146.6875,444.90625 L 163.9375,451.0625 L 207.0625,441.875 C 207.06092,441.8709 207.15928,441.78428 207.15625,441.78125 L 207.1875,441.78125 C 207.34748,439.37295 207.52983,437.0188 207.78125,434.75 C 208.04608,432.36021 208.37741,430.05022 208.8125,427.8125 C 209.24759,425.57478 209.76157,423.40095 210.4375,421.3125 C 211.11343,419.22405 211.95014,417.22321 212.9375,415.28125 C 213.92486,413.33929 215.06812,411.45452 216.4375,409.65625 C 217.80688,407.85798 219.39676,406.12612 221.21875,404.46875 C 223.04074,402.81138 225.09232,401.238 227.4375,399.71875 C 227.78254,399.49523 228.23651,399.28307 228.59375,399.0625 L 217.5,389.65625 L 211.4375,390 L 210,387.15625 L 210,379.65625 L 209.9375,379.65625 z",
            //12
            "M 228.59375,399.0625 C 228.23651,399.28307 227.78254,399.49523 227.4375,399.71875 C 225.09232,401.238 223.04074,402.81138 221.21875,404.46875 C 219.39676,406.12612 217.80688,407.85798 216.4375,409.65625 C 215.06812,411.45452 213.92486,413.33929 212.9375,415.28125 C 211.95014,417.22321 211.11343,419.22405 210.4375,421.3125 C 209.76157,423.40095 209.24759,425.57478 208.8125,427.8125 C 208.37741,430.05022 208.04608,432.36021 207.78125,434.75 C 207.52983,437.0188 207.34748,439.37295 207.1875,441.78125 L 207.34375,441.8125 L 207.5,441.78125 L 207.5,441.84375 L 223.21875,444.28125 L 243.5625,445.34375 L 252.21875,450.84375 C 252.31349,450.11115 252.3737,449.29615 252.53125,448.71875 C 252.78379,447.79324 253.03125,446.91691 253.03125,445.5625 C 253.03125,444.12459 252.93635,442.98603 252.75,441.96875 C 252.56365,440.95147 252.29599,440.05897 252.03125,439 C 251.81963,438.15351 251.5285,437.62058 251.21875,437.28125 C 250.909,436.94192 250.58993,436.78515 250.25,436.625 C 249.91007,436.46485 249.55216,436.30896 249.25,436 C 248.94784,435.69104 248.69644,435.22326 248.5,434.4375 C 248.34923,433.83446 248.39948,432.45756 248.40625,431.03125 C 248.41302,429.60494 248.3814,428.13779 248,427.375 C 247.62235,426.6197 247.49427,425.62115 247.34375,424.5625 C 247.19323,423.50385 247.00425,422.3835 246.46875,421.3125 C 246.13203,420.63906 245.80547,419.95469 245.46875,419.28125 C 245.46875,419.28125 245.61432,419.25186 245.625,419.25 L 229.28125,399.65625 L 228.59375,399.0625 z",
            //13
            "M 252.21875,450.75 C 253.87491,450.96761 255.45771,451.10896 256.96875,451.15625 C 258.57933,451.20665 260.10979,451.18248 261.5625,451.0625 C 263.01521,450.94252 264.41669,450.73525 265.71875,450.46875 C 267.02081,450.20225 268.24763,449.85792 269.40625,449.46875 C 271.72349,448.69042 273.74449,447.68832 275.53125,446.5625 C 277.31801,445.43668 278.87351,444.18867 280.1875,442.90625 C 281.50149,441.62383 282.56982,440.31064 283.46875,439.0625 C 284.36768,437.81436 285.08342,436.64798 285.625,435.625 C 286.70815,433.57905 287.125,432.15625 287.125,432.15625 L 321.59375,424.09375 L 325.09375,412.8125 L 301.25,401.25 L 296.25,393.75 C 296.25,393.75 295.60324,392.79353 294.25,391.4375 C 293.57338,390.75949 292.71603,389.98479 291.6875,389.1875 C 290.65897,388.39021 289.45201,387.55134 288.0625,386.78125 C 286.67299,386.01116 285.10331,385.2839 283.34375,384.6875 C 281.89555,384.19663 280.23572,383.87651 278.53125,383.59375 C 278.51264,383.6217 278.3125,383.9375 278.3125,383.9375 L 267.6875,403.125 L 258.59375,408.1875 C 258.27808,409.32392 257.84421,410.32468 257.3125,411.25 C 256.78079,412.17532 256.1435,413.01606 255.46875,413.75 C 254.794,414.48394 254.08854,415.12521 253.34375,415.6875 C 252.59896,416.24979 251.83558,416.71463 251.09375,417.125 C 249.61009,417.94575 248.19008,418.51229 247.15625,418.84375 C 246.12242,419.17521 245.46875,419.28125 245.46875,419.28125 C 245.80547,419.95469 246.13203,420.63906 246.46875,421.3125 C 247.00425,422.3835 247.19323,423.50385 247.34375,424.5625 C 247.49427,425.62115 247.62235,426.6197 248,427.375 C 248.3814,428.13779 248.41302,429.60494 248.40625,431.03125 C 248.39948,432.45756 248.34923,433.83446 248.5,434.4375 C 248.69644,435.22326 248.94784,435.69104 249.25,436 C 249.55216,436.30896 249.91007,436.46485 250.25,436.625 C 250.58993,436.78515 250.909,436.94192 251.21875,437.28125 C 251.5285,437.62058 251.81963,438.15351 252.03125,439 C 252.29599,440.05897 252.56365,440.95147 252.75,441.96875 C 252.93635,442.98603 253.03125,444.12459 253.03125,445.5625 C 253.03125,446.91691 252.78379,447.79324 252.53125,448.71875 C 252.3805,449.27122 252.31432,450.06018 252.21875,450.75 z",
            //14
            "M 332.65625,377.15625 L 327.3125,374.8125 L 311.96875,374.65625 L 305.34375,375.53125 L 296.25,373.21875 L 293.03125,368.75 L 286.25,365.9375 C 286.12191,366.48584 286.05315,367.05998 285.90625,367.59375 C 285.40808,369.40394 284.80338,371.12429 284.15625,372.75 C 282.86199,376.00143 281.39431,378.8004 280.25,380.78125 C 279.23157,382.5442 278.6818,383.36758 278.53125,383.59375 C 280.23572,383.87651 281.89555,384.19663 283.34375,384.6875 C 285.10331,385.2839 286.67299,386.01116 288.0625,386.78125 C 289.45201,387.55134 290.65897,388.39021 291.6875,389.1875 C 292.71603,389.98479 293.57338,390.75949 294.25,391.4375 C 295.60324,392.79353 296.25,393.75 296.25,393.75 L 301.25,401.25 L 318.9375,409.84375 L 332.84375,377.5 L 332.6875,377.15625 L 332.65625,377.15625 z",
            //15
            "M 276.8125,266.84375 C 276.43385,267.96581 275.92671,269.30301 275.65625,270.1875 C 275.07226,272.09732 274.75,273.3125 274.75,273.3125 L 279.3125,290 L 283.84375,301.59375 L 285.875,319.78125 L 287.375,324.84375 L 287.375,335.9375 L 288.40625,336.46875 L 285.875,350.59375 C 286.56948,352.42465 286.98362,354.30597 287.15625,356.21875 C 287.32888,358.13153 287.25617,360.06288 287.03125,361.96875 C 286.87265,363.31263 286.55629,364.62626 286.25,365.9375 L 293.03125,368.75 L 296.25,373.21875 L 305.34375,375.53125 L 311.96875,374.65625 L 327.3125,374.8125 L 332.65625,377.15625 L 314.15625,340.5 L 316.6875,337.46875 L 314.53125,333.4375 L 312.65625,333.5625 C 310.602,330.64323 308.56617,327.38283 306.5625,324.0625 C 304.55883,320.74217 302.56255,317.35007 300.53125,314.09375 C 298.49995,310.83743 296.44964,307.72725 294.3125,305 C 293.24393,303.63637 292.14094,302.36291 291.03125,301.21875 C 289.92156,300.07459 288.81684,299.05406 287.65625,298.1875 L 285.375,278.375 L 292.0625,271.4375 L 276.8125,266.84375 z",
            //16
            "M 361.46875,243.84375 L 347.84375,232.5 C 347.84375,232.5 317.86001,242.4989 298.5625,223.25 C 298.64766,224.85506 298.83222,226.67334 298.8125,228.0625 C 298.77422,230.7594 298.55836,233.07413 298.1875,235.0625 C 297.81664,237.05087 297.30814,238.70635 296.6875,240.125 C 296.06686,241.54365 295.35012,242.69976 294.5625,243.6875 C 293.77488,244.67524 292.90306,245.49186 292.03125,246.1875 C 290.28763,247.57878 288.45863,248.538 286.875,249.59375 C 285.99112,250.09883 285.15858,250.82468 284.34375,251.75 C 283.52892,252.67532 282.73394,253.79255 282,255 C 280.53212,257.4149 279.22954,260.25396 278.15625,262.96875 C 277.58003,264.42624 277.25145,265.54303 276.8125,266.84375 L 292.0625,271.4375 L 285.375,278.375 L 287.65625,298.1875 C 288.81684,299.05406 289.92156,300.07459 291.03125,301.21875 C 292.14094,302.36291 293.24393,303.63637 294.3125,305 C 296.44964,307.72725 298.49995,310.83743 300.53125,314.09375 C 302.2131,316.78988 303.87334,319.57926 305.53125,322.34375 L 324.46875,324.46875 C 335.85171,324.75864 345.82157,325.23566 355.3125,325.75 L 355.53125,319.46875 L 353.75,318.40625 C 351.42857,317.84821 349.32031,317.02002 347.40625,316.03125 C 345.49219,315.04248 343.75893,313.87026 342.21875,312.59375 C 340.67857,311.31724 339.32478,309.9525 338.125,308.53125 C 336.92522,307.11 335.89286,305.64174 335,304.21875 C 333.21429,301.37277 332.00893,298.65123 331.25,296.65625 C 330.49107,294.66127 330.1875,293.40625 330.1875,293.40625 L 333.5625,294.46875 L 332.5,285.53125 C 334.57589,284.48214 336.37939,283.41553 337.96875,282.34375 C 339.55811,281.27197 340.92606,280.20675 342.09375,279.15625 C 343.26144,278.10575 344.2516,277.07903 345.0625,276.09375 C 345.8734,275.10847 346.51228,274.15737 347.03125,273.28125 C 348.0692,271.52902 348.58426,270.0519 348.84375,269 C 349.10324,267.9481 349.09375,267.3125 349.09375,267.3125 C 352.01786,266.79911 354.44971,266.17236 356.46875,265.4375 C 358.48779,264.70264 360.10686,263.87472 361.375,263 C 362.64314,262.12528 363.57861,261.18297 364.25,260.25 C 364.92139,259.31703 365.3337,258.37835 365.5625,257.46875 C 365.7913,256.55915 365.84089,255.67962 365.78125,254.875 C 365.72161,254.07038 365.53767,253.33677 365.34375,252.71875 C 364.95592,251.4827 364.46875,250.71875 364.46875,250.71875 L 361.46875,243.84375 z",
            //17
            "M 252.21875,450.84375 L 243.5625,445.34375 L 223.21875,444.28125 L 207.5,441.84375 L 197.15625,485 L 210.71875,500.34375 L 210.71875,503.9375 L 223.21875,506.4375 C 223.21875,506.4375 244.65179,513.92411 251.4375,501.78125 L 256.0625,502.5 C 256.0625,502.5 263.57589,512.13392 268.21875,498.5625 C 268.21875,498.5625 270.99726,501.8898 277.125,500.375 C 275.69899,498.89652 274.02633,496.61512 273.25,495.0625 C 272.80388,494.17026 272.71145,493.20022 272.65625,492.125 C 272.60105,491.04978 272.59322,489.84163 272.25,488.46875 C 271.58036,485.79018 270.78719,485.21132 270.21875,482.9375 C 270.16031,482.70376 268.29585,476.87499 268.1875,476.875 C 266.44061,476.875 265.3247,477.03725 264.625,476.75 C 264.27515,476.60638 264.02821,476.36674 263.875,475.90625 C 263.72179,475.44576 263.65625,474.78448 263.65625,473.84375 C 263.65625,473.1816 263.57073,471.61943 263.40625,470.1875 C 263.24177,468.75557 262.97722,467.45736 262.625,467.28125 C 262.00293,466.97021 260.92837,466.16981 259.90625,465.28125 C 258.88413,464.39269 257.93396,463.39918 257.59375,462.71875 C 257.33785,462.20697 257.08659,460.84653 256.78125,459.46875 C 256.47591,458.09097 256.10557,456.69932 255.5625,456.15625 C 255.2194,455.81315 254.32936,455.18094 253.53125,454.4375 C 253.1322,454.06578 252.77785,453.64305 252.5,453.25 C 252.22215,452.85695 252.03125,452.48686 252.03125,452.125 C 252.03125,451.55724 252.16163,451.28542 252.21875,450.84375 z",
            //18
            "M 252.21875,450.75 C 252.15422,451.21578 252.03125,451.51657 252.03125,452.125 C 252.03125,452.48686 252.22215,452.85695 252.5,453.25 C 252.77785,453.64305 253.1322,454.06578 253.53125,454.4375 C 254.32936,455.18094 255.2194,455.81315 255.5625,456.15625 C 256.10557,456.69932 256.47591,458.09097 256.78125,459.46875 C 257.08659,460.84653 257.33785,462.20697 257.59375,462.71875 C 257.93396,463.39918 258.88413,464.39269 259.90625,465.28125 C 260.92837,466.16981 262.00293,466.97021 262.625,467.28125 C 262.97722,467.45736 263.24177,468.75557 263.40625,470.1875 C 263.57073,471.61943 263.65625,473.1816 263.65625,473.84375 C 263.65625,474.78448 263.72179,475.44576 263.875,475.90625 C 264.02821,476.36674 264.27515,476.60638 264.625,476.75 C 265.3247,477.03725 266.44061,476.875 268.1875,476.875 C 268.29585,476.87499 270.16031,482.70376 270.21875,482.9375 C 270.78719,485.21132 271.58036,485.79018 272.25,488.46875 C 272.59322,489.84163 272.60105,491.04978 272.65625,492.125 C 272.71145,493.20022 272.80388,494.17026 273.25,495.0625 C 274.02633,496.61512 275.69899,498.89652 277.125,500.375 C 277.26578,500.3402 277.35563,500.38385 277.5,500.34375 L 288.5625,495 L 298.9375,505.34375 C 298.9375,505.34375 310.71429,519.64286 322.5,520 C 322.5,520 336.41963,533.92411 351.0625,531.78125 L 366.4375,530 L 365.34375,527.15625 C 360.27829,521.81272 363.56329,514.84676 375,503.21875 C 380.75648,497.80097 382.54831,490.02992 404.625,469.3125 L 396.25,465.71875 L 389.65625,463.03125 L 374.09375,451.4375 L 366.0625,450.34375 L 361.0625,445.71875 L 350.71875,439.28125 L 350.90625,431.25 L 352.6875,427.5 L 350,426.0625 L 349.09375,421.59375 L 325.53125,413.03125 L 325.09375,412.8125 L 321.59375,424.09375 L 287.125,432.15625 C 287.125,432.15625 286.70815,433.57905 285.625,435.625 C 285.08342,436.64798 284.36768,437.81436 283.46875,439.0625 C 282.56982,440.31064 281.50149,441.62383 280.1875,442.90625 C 278.87351,444.18867 277.31801,445.43668 275.53125,446.5625 C 273.74449,447.68832 271.72349,448.69042 269.40625,449.46875 C 268.24763,449.85792 267.02081,450.20225 265.71875,450.46875 C 264.41669,450.73525 263.01521,450.94252 261.5625,451.0625 C 260.10979,451.18248 258.57933,451.20665 256.96875,451.15625 C 255.45771,451.10896 253.87491,450.96761 252.21875,450.75 z",
            //19
            "M 378.5,370.21875 L 367.84375,390.53125 L 343.5625,378.5625 L 343.5625,373.03125 L 332.6875,377.15625 L 332.84375,377.5 L 318.9375,409.84375 L 325.53125,413.03125 L 349.09375,421.59375 L 350,426.0625 L 352.6875,427.5 L 350.90625,431.25 L 350.71875,439.28125 L 361.0625,445.71875 L 366.0625,450.34375 L 374.09375,451.4375 L 389.65625,463.03125 L 396.25,465.71875 L 404.625,469.3125 C 404.63806,469.30025 404.64318,469.29351 404.65625,469.28125 C 404.65625,469.28125 406.08482,443.21428 422.15625,415 C 422.15625,415 442.14731,425.72768 448.21875,417.15625 C 448.21875,417.15625 464.99106,384.64732 431.0625,370.71875 C 431.0625,370.71875 426.05803,396.43752 402.84375,381.4375 L 392.15625,381.4375 C 392.15625,381.4375 381.41963,388.93303 381.0625,378.21875 C 381.0625,378.21875 380.94952,374.44295 378.5,370.21875 z",
            //20
            "M 438.53125,336.34375 C 438.46408,336.32522 438.44285,336.29985 438.375,336.28125 C 435.30197,335.43896 431.53013,334.52567 426.9375,333.59375 C 422.34487,332.66183 416.92236,331.70724 410.5625,330.78125 C 404.20264,329.85526 396.90597,328.9495 388.53125,328.125 C 380.15653,327.3005 370.73096,326.56494 360.09375,325.9375 C 349.45654,325.31006 337.61607,324.80357 324.46875,324.46875 L 305.53125,322.34375 C 305.87572,322.91814 306.21781,323.4913 306.5625,324.0625 C 308.56617,327.38283 310.602,330.64323 312.65625,333.5625 L 314.53125,333.4375 L 316.6875,337.46875 L 314.15625,340.5 L 332.65625,377.15625 L 332.6875,377.15625 L 343.5625,373.03125 L 343.5625,378.5625 L 367.84375,390.53125 L 378.5,370.21875 C 377.84226,369.08448 377.12089,367.91524 376.0625,366.78125 C 376.0625,366.78125 365.71429,358.93304 382.5,353.21875 C 382.5,353.21875 381.79465,345.72323 391.4375,346.4375 C 391.4375,346.4375 405.70089,352.87054 412.84375,342.15625 L 433.21875,338.5625 L 438.53125,336.34375 z",
            //21
            "M 361.46875,243.84375 L 364.46875,250.71875 C 364.46875,250.71875 364.95592,251.4827 365.34375,252.71875 C 365.53767,253.33677 365.72161,254.07038 365.78125,254.875 C 365.84089,255.67962 365.7913,256.55915 365.5625,257.46875 C 365.3337,258.37835 364.92139,259.31703 364.25,260.25 C 363.57861,261.18297 362.64314,262.12528 361.375,263 C 360.10686,263.87472 358.48779,264.70264 356.46875,265.4375 C 354.44971,266.17236 352.01786,266.79911 349.09375,267.3125 C 349.09375,267.3125 349.10324,267.9481 348.84375,269 C 348.58426,270.0519 348.0692,271.52902 347.03125,273.28125 C 346.51228,274.15737 345.8734,275.10847 345.0625,276.09375 C 344.2516,277.07903 343.26144,278.10575 342.09375,279.15625 C 340.92606,280.20675 339.55811,281.27197 337.96875,282.34375 C 336.37939,283.41553 334.57589,284.48214 332.5,285.53125 L 333.5625,294.46875 L 330.1875,293.40625 C 330.1875,293.40625 330.49107,294.66127 331.25,296.65625 C 332.00893,298.65123 333.21429,301.37277 335,304.21875 C 335.89286,305.64174 336.92522,307.11 338.125,308.53125 C 339.32478,309.9525 340.67857,311.31724 342.21875,312.59375 C 343.75893,313.87026 345.49219,315.04248 347.40625,316.03125 C 349.32031,317.02002 351.42857,317.84821 353.75,318.40625 L 355.53125,319.46875 L 355.3125,325.75 C 356.7836,325.82972 358.66624,325.8533 360.09375,325.9375 C 370.73096,326.56494 380.15653,327.3005 388.53125,328.125 C 396.90597,328.9495 404.20264,329.85526 410.5625,330.78125 C 416.92236,331.70724 422.34487,332.66183 426.9375,333.59375 C 431.53013,334.52567 435.30197,335.43896 438.375,336.28125 C 438.44285,336.29985 438.46408,336.32522 438.53125,336.34375 L 442.5,334.65625 L 438.21875,325.34375 L 438.9375,323.5625 L 447.84375,325 C 447.84375,325 442.49106,318.21429 448.5625,307.5 C 448.5625,307.5 453.20982,303.57588 449.28125,300.71875 C 449.28125,300.71875 440.35714,302.85714 440,290 L 438.21875,275 L 432.5,270.71875 L 432.84375,262.5 L 416.4375,252.5 C 416.4375,252.5 421.42857,247.1384 420,236.78125 C 420,236.78125 405.00894,227.8616 373.9375,245.71875 C 373.9375,245.71875 368.91517,251.07143 362.84375,245 L 361.46875,243.84375 z",
          ];

          obj.distritosName = ["Centro","arganzuela","Retiro","Salamanca","Chamartin","Tetuán","Chamberí","Fuencarral","Moncloa","Latina","Carabanchel","Usera","p. Vallecas","Moratalaz","C. Lineal","Hortaleza","Villaverde","v. vallecas","Vicálvaro","San blas","Barajas"];


          obj.ingre = [12103180.7099999995,8576300.06, 12410529.270000001, 8789358.900000001, 6133347.0700000003, 1153657.589999996, 6100302.180000001,5283972.949999999,  7445158.280000002, 8851385.190000001, 1499600.0899999994, 3576610.54999999999,714746.0899999999, 2190689.66, 2999744.24, 3933369.829999994, 8534999.2, 5643697.22,6279695.979999999,5924191.12, 11209682.1300000001 ];

          var color = [0x3B0B0B, 0x3B170B, 0x3A2F0B, 0X0B2F3A, 0X0B243B, 0X0B173B, 0X0B0B3B];

          obj.amounts = [];

          obj.relaciones = [];

          obj.ids = [];

          for (var i = 0; i < obj.paths.length; i+=1) { obj.ids[i] = i; }
          for(var i = 0; i < obj.paths.length; i+=1){ obj.amounts[i]=200; }

          obj.colors =  [];

          for(var i = 0; i < obj.paths.length; i+=1){
            if (obj.ingre[i]<2030000) obj.colors[i] = color[0];
            else if (obj.ingre[i]>2030000 && obj.ingre[i]<3860000) obj.colors[i] = color[1];
            else if (obj.ingre[i]>3860000 && obj.ingre[i]<5690000) obj.colors[i] = color[2];
            else if (obj.ingre[i]>5690000 && obj.ingre[i]<7520000) obj.colors[i] = color[3];
            else if (obj.ingre[i]>7520000 && obj.ingre[i]<9350000) obj.colors[i] = color[4];
            else if (obj.ingre[i]>9350000 && obj.ingre[i]<11180000) obj.colors[i] = color[5];
            else if (obj.ingre[i]>11180000) obj.colors[i] = color[6];

          }
          obj.center = { x:5000, y:5000 };
          obj.center2 = { x:5000, y:5000, z:5000 };
          return obj;
        };

        function addGeoObject ( group, svgObject ) {

          var i,j, len, len1;
          var path, mesh, color, material, amount, simpleShapes, simpleShape, shape3d;
          var thePaths = svgObject.paths;
          var theAmounts = svgObject.amounts;
          var theColors = svgObject.colors;
          var theCenter = svgObject.center;

          len = thePaths.length;

          for (i = 0; i < len; ++i) {
            path = $d3g.transformSVGPath( thePaths[i] );
            color = new THREE.Color( theColors[i] );
            material = new THREE.MeshLambertMaterial({
              color: color,
              ambient: color,
              emissive: color,
              transparent: true,
              opacity: 0.7

            });
            amount = theAmounts[i];
            simpleShapes = path.toShapes(true);

            len1 = simpleShapes.length;

            for (j = 0; j < len1; ++j) {
              simpleShape = simpleShapes[j];
              shape3d = simpleShape.extrude({
                amount: amount,
                bevelEnabled: false
              });

              mesh = new THREE.Mesh(shape3d, material);
              mesh.rotation.x = Math.PI / 2;
              mesh.translateZ( - (amount) - 1);
              mesh.translateX( - theCenter.x);
              mesh.translateY( - theCenter.y);
              mesh.scale.x = 20;
              mesh.scale.y = 20;
              mesh.verticesNeedUpdate = true;
              mesh.name = svgObject.distritosName[i];

              group.add(mesh);
            }
            group.name='grupoDistritos';
          }
        };
      }
    }
  })

  .directive('wordGalaxy', function(vectorWords, $localStorage) {
    return {
      restrict: 'EA',
      scope: {},
      link: function (scope) {
        var renderer, scene, camera,container, controls;
        var vectores = [];
        var particles, uniforms, attributes;
        var clock = new THREE.Clock();
        var letrerosInside = new THREE.Object3D();
        var clusterInside = new THREE.Object3D();
        var PARTICLE_SIZE = 20;
        var categories = [];
        var catPosition = [];
        var coloresPers = { 'r':[],'g':[],'b':[] };
        var dispersionValue = 100;
        var cameraPositionTotal = 0;

        var letrerosCluster;
        //var seleccionCluster = ["that", "these", "developing", "read", "because", "cathedral", "dominant", "journals", "searching", "soon", "calculations", "time"];
        //var seleccionCluster = ["that", "should", "these", "developing", "read", "because", "treatments", "examine", "cathedral", "dominant", "journals", "searching", "soon", "calculations", "time", "hold", "weekends", "explain", "controversy", "website", "unless", "finally", "placing", "glossary", "investors", "taking", "plaintiff", "conclusions", "listings", "scholarship", "argument", "infrastructure", "especially", "clicking", "subtle", "optimal", "psychological", "price", "thirty", "drug", "votes", "articles", "literary", "everyone", "payment", "states", "hiring", "into", "tutorial", "iran", "before", "definition", "meaning", "waste", "portraits", "sender", "making", "principle", "speeds", "reaction", "universities", "city", "governmental", "enormous", "same", "afraid", "commands", "compliance", "document", "after", "third", "users", "sustained"];
        //var seleccionCluster = ["that", "should", "these", "developing", "read", "because", "treatments", "examine", "cathedral", "dominant", "journals", "searching", "soon", "calculations", "time", "hold", "weekends", "explain", "controversy", "website", "unless", "finally", "placing", "glossary", "investors", "taking", "plaintiff", "conclusions", "listings", "scholarship", "argument", "infrastructure", "especially", "clicking", "subtle", "optimal", "psychological", "price", "thirty", "drug", "votes", "articles", "literary", "everyone", "payment", "states", "hiring", "into", "tutorial", "iran", "before", "definition", "meaning", "waste", "portraits", "sender", "making", "principle", "speeds", "reaction", "universities", "city", "governmental", "enormous", "same", "afraid", "commands", "compliance", "document", "after", "third", "users", "sustained", "clothes", "sometimes", "leaving", "medicine", "pending", "organizations", "excerpt", "improved", "november", "expand", "references", "educators", "although", "provide", "diary", "inside", "attractions", "visiting", "always", "adware", "says", "constitutional", "democrat", "left", "university", "mail", "text"];
        //var seleccionCluster = ["that", "should", "these", "developing", "read", "because", "treatments", "examine", "cathedral", "dominant", "journals", "searching", "soon", "calculations", "time", "hold", "weekends", "explain", "controversy", "website", "unless", "finally", "placing", "glossary", "investors", "taking", "plaintiff", "conclusions", "listings", "scholarship", "argument", "infrastructure", "especially", "clicking", "subtle", "optimal", "psychological", "price", "thirty", "drug", "votes", "articles", "literary", "everyone", "payment", "states", "hiring", "into", "tutorial", "iran", "before", "definition", "meaning", "waste", "portraits", "sender", "making", "principle", "speeds", "reaction", "universities", "city", "governmental", "enormous", "same", "afraid", "commands", "compliance", "document", "after", "third", "users", "sustained", "clothes", "sometimes", "leaving", "medicine", "pending", "organizations", "excerpt", "improved", "november", "expand", "references", "educators", "although", "provide", "diary", "inside", "attractions", "visiting", "always", "adware", "says", "constitutional", "democrat", "left", "university", "mail", "text","although", "provide", "developing", "diary", "inside", "attractions", "read", "visiting", "always", "these", "adware", "says", "that", "constitutional", "democrat", "left", "university", "november", "mail", "sometimes", "text", "customer", "scholarship", "think", "play", "medicine", "transaction", "revenue", "united", "hotel", "difficult", "compatibility", "military", "situated", "pharmacology", "should", "launch", "surprised", "theories", "after", "parliament", "edge", "definition", "before", "beaches", "classification", "time", "usually", "because", "investment", "plaintiff", "prisoners", "statutes", "cordless", "principle", "website", "sells", "file", "army", "interventions", "states", "trading", "afraid", "interface", "ports", "examine", "regulatory", "forums", "student", "passing", "enormous", "wanna", "white", "making", "convenient", "price", "specialist", "recognize", "mothers", "allow", "proceed", "liability", "south", "tournaments", "same", "volumes", "tutorial", "studies", "sports", "accommodation", "profit", "spain", "german", "techno", "photographs", "deficit", "retain", "networking", "engineering", "applications"];
        //var seleccionCluster = ["that", "should", "these", "developing", "read", "because", "treatments", "examine", "cathedral", "dominant", "journals", "searching", "soon", "calculations", "time", "hold", "weekends", "explain", "controversy", "website", "unless", "finally", "placing", "glossary", "investors", "taking", "plaintiff", "conclusions", "listings", "scholarship", "argument", "infrastructure", "especially", "clicking", "subtle", "optimal", "psychological", "price", "thirty", "drug", "votes", "articles", "literary", "everyone", "payment", "states", "hiring", "into", "tutorial", "iran", "before", "definition", "meaning", "waste", "portraits", "sender", "making", "principle", "speeds", "reaction", "universities", "city", "governmental", "enormous", "same", "afraid", "commands", "compliance", "document", "after", "third", "users", "sustained", "clothes", "sometimes", "leaving", "medicine", "pending", "organizations", "excerpt", "improved", "november", "expand", "references", "educators", "although", "provide", "diary", "inside", "attractions", "visiting", "always", "adware", "says", "constitutional", "democrat", "left", "university", "mail", "text","although", "provide", "developing", "diary", "inside", "attractions", "read", "visiting", "always", "these", "adware", "says", "that", "constitutional", "democrat", "left", "university", "november", "mail", "sometimes", "text", "customer", "scholarship", "think", "play", "medicine", "transaction", "revenue", "united", "hotel", "difficult", "compatibility", "military", "situated", "pharmacology", "should", "launch", "surprised", "theories", "after", "parliament", "edge", "definition", "before", "beaches", "classification", "time", "usually", "because", "investment", "plaintiff", "prisoners", "statutes", "cordless", "principle", "website", "sells", "file", "army", "interventions", "states", "trading", "afraid", "interface", "ports", "examine", "regulatory", "forums", "student", "passing", "enormous", "wanna", "white", "making", "convenient", "price", "specialist", "recognize", "mothers", "allow", "proceed", "liability", "south", "tournaments", "same", "volumes", "tutorial", "studies", "sports", "accommodation", "profit", "spain", "german", "techno", "photographs", "deficit", "retain", "networking", "engineering", "applications","tournaments", "same", "volumes", "tutorial", "time", "studies", "sports", "accommodation", "difficult", "profit", "these", "spain", "german", "techno", "photographs", "parliament", "deficit", "retain", "after", "networking", "engineering", "adware", "applications", "four", "approximately", "payment", "plaintiff", "downloads", "allow", "improved", "think", "south", "fraction", "languages", "regulatory", "cars", "hiring", "dresses", "reaction", "contributions", "obligation", "taking", "listings", "wines", "directory", "century", "stock", "alter", "white", "text", "dose", "registrar", "warming", "government", "mothers", "thirty", "educators", "parking", "meaning", "forums", "verizon", "cost", "firewire", "noon", "proceed", "treatments", "diary", "robert", "liability", "seems", "passing", "naked", "army", "heroes", "mental", "convenient", "confirmed", "developing", "incidence", "medline", "coding", "territory", "investment", "everyone", "university", "articles", "compatibility", "reply", "customer", "november", "refer", "portraits", "kings", "sussex", "cards", "investors", "provide", "dealers", "users", "girlfriend"];

        var raycaster, intersects;
        var palabras = new THREE.Object3D();
        var palabrasCluster = new THREE.Group();
        var mouse, INTERSECTED;
        vectorWords.then(function(data){
          vectores = data;
          $.each(data, function(index, value) {
          //   if ($.inArray(value.cluster, seleccionCluster) != -1) {
          //        vectores.push(value);
          //   }
          //  if ($.inArray( value.cluster, categories) === -1 && index>299 ) {
          //  if ($.inArray( value.cluster, categories) === -1 ) {
          //    categories.push(value.cluster);
          //  }
           });
          //console.log('vectores: ', vectores);
          init();
          animate();
        });

        function init() {

          container = document.getElementById( 'containerGalaxy' );

          scene = new THREE.Scene();
          scene.fog = new THREE.Fog(0xffffff, 10, 60);

          camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
          camera.position.z = 930;

          controls = new THREE.TrackballControls( camera );

          controls.rotateSpeed = 2.0;
          controls.zoomSpeed = 1.2;
          controls.panSpeed = 0.8;

          controls.noZoom = false;
          controls.noPan = false;

          controls.staticMoving = false;
          controls.dynamicDampingFactor = 0.3;

          controls.keys = [ 65, 83, 68 ];

          $.each(vectores, function(index, value) {
              coloresPers['r'].push(Math.floor((Math.random() * 255) + 20));
              coloresPers['g'].push(Math.floor((Math.random() * 255) + 20));
              coloresPers['b'].push(Math.floor((Math.random() * 255) + 20));
              if ($.inArray(value.cluster, categories) === -1) {
                   categories.push(value.cluster);
                   catPosition.push({ 'x': value['x']*dispersionValue, 'y': value['y']*dispersionValue, 'z': value['z']*dispersionValue })
              }
            });

//          addLeters(vectores, categories, palabras);
          addClutserLetters(categories, catPosition);
          addSprites(vectores, categories);

          letrerosCluster = scene.getObjectByName( "letrerosCluster").children;

          function addClutserLetters(categories, catPosition) {
            for ( var o = 0; o<categories.length; o++){
              var spritey = makeTextSprite( categories[o],
                { fontsize: 40,
                  borderColor: { r:255, g:0, b:0, a:0 },
                  backgroundColor: {r:coloresPers['r'][categories.indexOf(vectores[o].cluster)], g:coloresPers['g'][categories.indexOf(vectores[o].cluster)], b:coloresPers['b'][categories.indexOf(vectores[o].cluster)], a:0.8},
                  color: { r:255, g:255, b:255, a:1 } }, 50, 25);
              spritey.position.set( (catPosition[o]['x']), (catPosition[o]['y']), (catPosition[o]['z']) );
              spritey.name = categories[o]+'Leters';
              palabrasCluster.add(spritey);
            }
            palabrasCluster.name='letrerosCluster';
            scene.add(palabrasCluster);
          }

          function addLeters(vectores,categories, palabras) {
            for ( var o = 0; o<vectores.length; o++){
              var spritey = makeTextSprite( vectores[o].word,
                { fontsize: 40,
                  borderColor: {r:255, g:0, b:0, a:0},
                  backgroundColor: {r:100, g:100, b:100, a:0},
                  color: { r:255, g:255, b:255, a:1 } } );
                spritey.position.set( (vectores[o]['x']*dispersionValue), (vectores[o]['y']*dispersionValue), (vectores[o]['z']*dispersionValue) );
                spritey.name = vectores[o]["cluster"];
                palabras.add(spritey);
              }
            palabras.name='letreros';
            scene.add(palabras);
          }

          function addSprites(vectores, categories){
            attributes = {
              size:        { type: 'f', value: [] },
              customColor: { type: 'c', value: [] },
              originalColor: { type: 'c', value: [] },
              nombre: { type: 'c', value: [] },
              cluster: { type: 'c', value: [] },
              posicion: { type: 'c', value: { 'x':0, 'y':0, 'z':0 } }
            };

            uniforms = {
              color:   { type: "c", value: new THREE.Color( 0xffffff ) },
              texture: { type: "t", value: THREE.ImageUtils.loadTexture( "images/wiki.png" ) }
            };

            var shaderMaterial = new THREE.ShaderMaterial( {
             uniforms: uniforms,
             attributes: attributes,
             transparent:true,
             vertexShader: document.getElementById( 'vertexshader' ).textContent,
             fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
             alphaTest: 0.9
            } );

            var geometry = new THREE.Geometry();

            var nombre = attributes.nombre.value;
            var cluster = attributes.cluster.value;
            var posicion = attributes.posicion.value;

            for ( var o = 0; o<vectores.length; o++){
              geometry.vertices.push( new THREE.Vector3(vectores[o]['x']*dispersionValue, vectores[o]['y']*dispersionValue, vectores[o]['z']*dispersionValue));
              nombre[ o ] = vectores[o].word;
              cluster[ o ] = vectores[o].cluster;
              posicion[ o ]= { 'x': vectores[o].x * dispersionValue, 'y': vectores[o].y * dispersionValue, 'z': vectores[o].z * dispersionValue };
            }

            particles = new THREE.PointCloud( geometry, shaderMaterial );

            var values_size = attributes.size.value;
            var values_color = attributes.customColor.value;
            var original_color = attributes.originalColor.value;

            var vertices = (particles.geometry.vertices.length);

            for( var v = 0,  vl = vertices; v < vl; v++ ) {

              values_size[ v ] = PARTICLE_SIZE * 0.5;

              values_color[ v ] = new THREE.Color().setHex(0xaaccff*((categories.indexOf(vectores[v].cluster)+1)*2) );
              original_color[ v ] = new THREE.Color().setHex(0xaaccff*((categories.indexOf(vectores[v].cluster)+1)*2) );

            }
            particles.name='particulas';
            scene.add( particles );
          }

          console.log(scene);

          scene.getObjectByName("particulas").material.visible = false;

          renderer = new THREE.WebGLRenderer({ alpha: true, antialias:true });
          renderer.setPixelRatio( window.devicePixelRatio );
          renderer.setSize( window.innerWidth, window.innerHeight );
          renderer.setClearColor( 0x081223, 1);
          container.appendChild( renderer.domElement );

          //

          raycaster = new THREE.Raycaster();
          mouse = new THREE.Vector2()

          //

          window.addEventListener( 'resize', onWindowResize, false );
          document.getElementById("containerGalaxy").addEventListener( "mousewheel", MouseWheelHandler, false);
          document.getElementById("containerGalaxy").addEventListener( 'mousemove', onDocumentMouseMove, false );
          document.getElementById("containerGalaxy").addEventListener( 'dblclick', onDocumentMouseDown, false );

        }

        function MouseWheelHandler( event ) {
          cameraPositionTotal = Math.abs(camera.position.z)+Math.abs(camera.position.y)+Math.abs(camera.position.x);
          if ((Math.abs(cameraPositionTotal)) >= 900) {
            scene.getObjectByName("particulas").material.visible = false;
            scene.getObjectByName("letrerosCluster").visible = true;
          } else {
            scene.getObjectByName("particulas").material.visible = true;
            //scene.getObjectByName("letrerosCluster").visible = false;
          }
          if (event.wheelDelta == 120 && letrerosCluster[0].material.opacity > 0 && Math.abs(cameraPositionTotal) <= 900) {
              for (var a = 0; a < letrerosCluster.length; a++) {
                letrerosCluster[a].material.opacity = letrerosCluster[a].material.opacity - cameraPositionTotal/2000;
              }
          }
          if (event.wheelDelta == -120 && letrerosCluster[0].material.opacity <1 && Math.abs(cameraPositionTotal) >= 800) {
              for (var a = 0; a < letrerosCluster.length; a++) {
                letrerosCluster[a].material.opacity = letrerosCluster[a].material.opacity + cameraPositionTotal/2000;
              }
          }
        }

        function onDocumentMouseMove( event ) {

          event.preventDefault();

          mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
          mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        }
        function onDocumentMouseDown ( event ) {
//          if (event.shiftKey || !event.ctrlKey || event.metaKey)  console.log('hay control');

          raycaster.setFromCamera( mouse, camera );

          intersects = raycaster.intersectObject( scene.getObjectByName( "particulas" ) );

          switch (event.button) {

            case 0: // left
              if ( intersects.length > 0 ) {
                if (INTERSECTED != intersects[0]) {
                  if(!event.ctrlKey) {
                      letrerosInside = new THREE.Object3D();
                      clusterInside = new THREE.Object3D();
                      scene.remove(scene.getObjectByName( "uniqCluster"));
                      scene.remove(scene.getObjectByName( "letreros"));
                  }
                  INTERSECTED = intersects[0].index;
                  var spritey = makeTextSprite( attributes.cluster.value[INTERSECTED],
                    { fontsize: 30,
                      borderColor: { r:255, g:0, b:0, a:0 },
                      backgroundColor: {r:100, g:100, b:100, a:0.7},
                      color: { r:255, g:255, b:255, a:1 } }, 25, 13);
                  spritey.position.set( (intersects[0].point['x']), (intersects[0].point['y']), (intersects[0].point['z']) );
                  clusterInside.name = 'uniqCluster';
                  clusterInside.add(spritey);
                  scene.add(clusterInside);
                  var longFor = attributes.customColor.value.length;
                  for (var e = 0; e < longFor; e++) {
                    if (!event.ctrlKey && attributes.cluster.value[e] != attributes.cluster.value[INTERSECTED]) attributes.customColor.value[e] = new THREE.Color().setHex(0x222222);
                    if (attributes.cluster.value[e] == attributes.cluster.value[INTERSECTED]) {
                        attributes.customColor.value[e] = attributes.originalColor.value[INTERSECTED];
                        var spritey = makeTextSprite( attributes.nombre.value[e],
                            { fontsize: 60,
                                borderColor: { r:255, g:0, b:0, a:0 },
                                backgroundColor: {r:100, g:100, b:100, a:0},
                                color: { r:255, g:255, b:255, a:1 } }, 10, 5);
                        spritey.position.set( (attributes.posicion.value[e]['x']), (attributes.posicion.value[e]['y']), (attributes.posicion.value[e]['z']) );
                        spritey.name = 'letrerosIndividuales';
                        letrerosInside.add(spritey);
                    }
                  }
                  letrerosInside.name='letreros';
                  scene.add(letrerosInside);
                  attributes.customColor.needsUpdate = true;
                  movement(intersects[0].point['x'], intersects[0].point['y'],intersects[0].point['z'], controls.target, 0);
                  movement(intersects[0].point['x'], intersects[0].point['y'],intersects[0].point['z']+100, camera.position, 100);
                }
              }; break;

              case 1: //middle
                if(scene.getObjectByName( "uniqCluster")) scene.remove(scene.getObjectByName( "uniqCluster"));
                if(scene.getObjectByName( "letreros"))  { scene.remove(scene.getObjectByName( "letreros")); console.log('letreros: ',scene.getObjectByName( "letreros")); }
                var longFor = attributes.customColor.value.length;
                for (var e = 0; e < longFor; e++) {
                  attributes.customColor.value[e] = attributes.originalColor.value[e];
                }
                attributes.customColor.needsUpdate = true;
                break;
          }
        }

        function onWindowResize() {

          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();

          renderer.setSize( window.innerWidth, window.innerHeight );

        }

        function animate() {

          requestAnimationFrame( animate );
          TWEEN.update();

          render();

        }

        function render() {

          cameraPositionTotal = Math.abs(camera.position.z)+Math.abs(camera.position.y)+Math.abs(camera.position.x);

          if ((Math.abs(cameraPositionTotal)) < 700) {
                scene.getObjectByName("letrerosCluster").visible = false;
           }

          raycaster.setFromCamera( mouse, camera );

          intersects = raycaster.intersectObject( scene.getObjectByName( "particulas" ) );

          if ( intersects.length > 0 ) {

            if ( INTERSECTED != intersects[ 0 ] ) {

              INTERSECTED = intersects[ 0 ].index;

              attributes.size.value[ INTERSECTED ] = PARTICLE_SIZE * 1.25;

              attributes.size.needsUpdate = true;
              //}
            }

          } else if ( INTERSECTED !== null ) {

            attributes.size.value[ INTERSECTED ] = PARTICLE_SIZE/1.75;
            attributes.size.needsUpdate = true;
            INTERSECTED = null;

          }
          var delta = clock.getDelta();

          controls.update( delta );

          renderer.render( scene, camera );

        }

        function movement(valueX, valueY, valueZ, object,delay){
          var tween = new TWEEN.Tween(object).to({
            x: valueX,
            y: valueY,
            z: valueZ
          }).easing(TWEEN.Easing.Sinusoidal.InOut).onUpdate(function () {
          }).delay(delay).start();
        }

        scope.$watch(function () {
          return $localStorage. searchValue;
        }, function (newVal, oldVal) {
            if(!event.ctrlKey) {
                letrerosInside = new THREE.Object3D();
                clusterInside = new THREE.Object3D();
                scene.remove(scene.getObjectByName( "uniqCluster"));
                scene.remove(scene.getObjectByName( "letreros"));
            }
          var cluster='wow';
          if(attributes) {
            var long = attributes.nombre.value.length;
            for(var a = 0; a<long; a++){
              //console.log('cluster y atributo: ', cluster, attributes.cluster.value[a]);
              if(attributes.nombre.value[a] == newVal) {
                cluster = attributes.cluster.value[a];
                var pos = a;
                console.log(cluster);
                scene.getObjectByName("particulas").material.visible = true;
                scene.getObjectByName("letrerosCluster").visible = false;
                attributes.customColor.value[a] = new THREE.Color().setHex(0xffffff);
                attributes.customColor.needsUpdate = true;
              }
              if(attributes.cluster.value[a] == cluster && attributes.nombre.value[a] != newVal) {
                  var spritey = makeTextSprite( attributes.nombre.value[a],
                  { fontsize: 40,
                      borderColor: { r:255, g:0, b:0, a:0 },
                      backgroundColor: {r:100, g:100, b:100, a:0},
                      color: { r:255, g:255, b:255, a:1 } }, 10, 5);
                  spritey.position.set( (attributes.posicion.value[a]['x']), (attributes.posicion.value[a]['y']), (attributes.posicion.value[a]['z']) );
                  spritey.name = 'letrerosIndividuales';
                  letrerosInside.add(spritey);
                  letrerosInside.name='letreros';
                  scene.add(letrerosInside);
                attributes.customColor.value[a] = attributes.originalColor.value[a];
                attributes.customColor.needsUpdate = true;
              } else if(attributes.cluster.value[a] != cluster && attributes.nombre.value[a] != newVal){
                attributes.customColor.value[a] = new THREE.Color().setHex(0x222222);
                attributes.customColor.needsUpdate = true;
              }
            }
            var spritey = makeTextSprite( attributes.cluster.value[pos],
              { fontsize: 30,
                borderColor: { r:255, g:0, b:0, a:0 },
                backgroundColor: {r:100, g:100, b:100, a:0.7},
                color: { r:255, g:255, b:255, a:1 } }, 25, 13);
            spritey.position.set( (attributes.posicion.value[pos]['x']), (attributes.posicion.value[pos]['y']), (attributes.posicion.value[pos]['z']) );
            clusterInside.name = 'uniqCluster';
            clusterInside.add(spritey);
            scene.add(clusterInside);
            movement(attributes.posicion.value[pos]['x'], attributes.posicion.value[pos]['y'],attributes.posicion.value[pos]['z'], controls.target, 0);
            movement(attributes.posicion.value[pos]['x'], attributes.posicion.value[pos]['y'],attributes.posicion.value[pos]['z']+150, camera.position, 100);
          }
        }, true);
      }
    }
  })
