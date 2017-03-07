(function () {

    var scene,
        camera,
        renderer,
        element,
        container,
        effect,
        controls,
        clock;

    var questionMesh;

    var questionMesh,
        answersMeshes = [],
        questions = [
        {
            "question": "What...is your name?",
            "answers": ["Sir Lancelot of Camelot", "Sir Tim Berners Lee", "Prince Ruppert"]
        },
        {
            "question": "What...is your quest?",
            "answers": ["To seek the Fountain of Youth", "To seek the Holy Grail", "The British are coming!"]
        },
        {
            "question": "What...is your favorite color?",
            "answers": ["Indigo", "Blue", "Fucshia!"]
        },
        {
            "question": "What...is the capital of Assyria?",
            "answers": ["Cairo", "Mesopotamia", "I don't know THAT!!"]
        },
    ];

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

        updateQuestion();

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

    function updateQuestion() {
        var index = parseInt(Math.random() * questions.length);
        var item = questions[index];
        if (questionMesh) {
            scene.remove(questionMesh);
        }
        if (answersMeshes) {
            for (var answerMesh of answersMeshes) {
                scene.remove(answerMesh);
            }
            answersMeshes = [];
        }

        var questionGeometry = new THREE.TextGeometry(item.question, {
            size: 2,
            height: 0.1
        });
        questionMesh = new THREE.Mesh(questionGeometry, new THREE.MeshBasicMaterial({
            color: 0x468966, opacity: 1
        }));
        questionMesh.position.y = 20;
        questionMesh.position.z = 20;
        questionMesh.rotation.x = 0;
        questionMesh.rotation.y = -180;
        scene.add(questionMesh);

        var y = 15;
        for (var answer of item.answers) {
            var text = answer;
            var answerGeometry = new THREE.TextGeometry(answer, {
                size: 3,
                height: 0.1
            });
            var answerMesh = new THREE.Mesh(answerGeometry, new THREE.MeshBasicMaterial({
                color: 0xFFF0A5, opacity: 0.8
            }));
            answerMesh.position.y = y;
            answerMesh.position.z = 20;
            answerMesh.rotation.x = 0;
            answerMesh.rotation.y = -180;
            answerMesh.click = function () {
                alert(text);
            }
            answersMeshes.push(answerMesh);
            scene.add(answerMesh);
            y -= 5;
        }
    }

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    function onDocumentMouseDown(event) {

        event.preventDefault();

        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            if (intersects[0].object.click) {
                intersects[0].object.click();
            }
        }

    }

    document.addEventListener('mousedown', onDocumentMouseDown);

})();