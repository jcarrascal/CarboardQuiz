(function () {

    var scene,
        camera,
        renderer,
        element,
        container,
        effect,
        controls,
        clock;

    init();

    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
        camera.position.set(0, 15, 0);
        scene.add(camera);

        renderer = new THREE.WebGLRenderer();
        element = renderer.domElement;
        container = document.getElementById('viewport');
        container.appendChild(element);

        effect = new THREE.StereoEffect(renderer);

        // Fallback controls using mouse and keyboard.
        controls = new THREE.OrbitControls(camera, element);
        controls.target.set(
            camera.position.x + 0.15,
            camera.position.y,
            camera.position.z
        );
        controls.noPan = true;
        controls.noZoom = true;

        // Expected DeviceOrientation using accelerometer.
        function configureDeviceOrientation(e) {
            if (!e.alpha) {
                return;
            }

            controls = new THREE.DeviceOrientationControls(camera, true);
            controls.connect();
            controls.update();

            element.addEventListener('click', fullscreen, false);

            window.removeEventListener('deviceorientation', configureDeviceOrientation, true);
        }
        window.addEventListener('deviceorientation', configureDeviceOrientation, true);

        // Lighting
        var light = new THREE.PointLight(0x999999, 2, 100);
        light.position.set(50, 50, 50);
        scene.add(light);

        var lightScene = new THREE.PointLight(0x999999, 2, 100);
        lightScene.position.set(0, 5, 0);
        scene.add(lightScene);

        // Floor.
        var floorTexture = THREE.ImageUtils.loadTexture('img/wood.jpg');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat = new THREE.Vector2(50, 50);
        floorTexture.anisotropy = renderer.getMaxAnisotropy();

        var floorMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            shininess: 20,
            shading: THREE.FlatShading,
            map: floorTexture
        });

        var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
        var floor = new THREE.Mesh(geometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        // Start rendering.
        clock = new THREE.Clock();
        animate();
    }

    function animate() {
        var elapsedSeconds = clock.getElapsedTime();

        requestAnimationFrame(animate);

        update(clock.getDelta());
        render(clock.getDelta());
    }

    function resize() {
        var width = container.offsetWidth;
        var height = container.offsetHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        effect.setSize(width, height);
    }

    function update(dt) {
        resize();

        camera.updateProjectionMatrix();

        controls.update(dt);
    }

    function render(dt) {
        effect.render(scene, camera);
    }

    function fullscreen() {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    }

})();