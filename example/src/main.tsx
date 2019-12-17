



import React from 'react';
import ReactDOM from 'react-dom';
import {IndexPage} from "./pages/IndexPage";

ReactDOM.render(<IndexPage/>, document.getElementById('root'));

// import {AxesHelper, Color, GridHelper, PerspectiveCamera, Scene, WebGLRenderer} from "three";
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// import ECS from "ecs-lib";
// import SceneObjectSystem from "./system/SceneObjectSystem";
// import CubeFactorySystem from "./system/CubeFactorySystem";
// import SphereFactorySystem from "./system/SphereFactorySystem";
// import CubeEntity from "./entity/CubeEntity";
// import {GUI} from "dat.gui";
// import KeyboardSystem from "./system/KeyboardSystem";
// import NPCSystem from "./system/NPCSystem";
// import SphereEntity from "./entity/SphereEntity";
// import LogSystem from "./system/LogSystem";
//
// var scene: Scene,
//     camera: PerspectiveCamera,
//     controls: OrbitControls,
//     renderer: WebGLRenderer,
//     container,
//     HEIGHT,
//     WIDTH,
//     windowHalfX,
//     windowHalfY,
//     world: ECS,
//     gui: GUI;
//
// function init() {
//     scene = new Scene();
//     scene.background = new Color(0xCCCCCC);
//
//     HEIGHT = window.innerHeight;
//     WIDTH = window.innerWidth;
//     camera = new PerspectiveCamera(40, WIDTH / HEIGHT, 1, 2000);
//
//     camera.position.z = 100;
//     camera.position.y = 100;
//     camera.position.x = 100;
//     renderer = new WebGLRenderer({antialias: true});
//     renderer.setSize(WIDTH, HEIGHT);
//
//     container = document.getElementById('root');
//     container.appendChild(renderer.domElement);
//
//     windowHalfX = WIDTH / 2;
//     windowHalfY = HEIGHT / 2;
//
//     window.addEventListener('resize', function () {
//         HEIGHT = window.innerHeight;
//         WIDTH = window.innerWidth;
//         windowHalfX = WIDTH / 2;
//         windowHalfY = HEIGHT / 2;
//         renderer.setSize(WIDTH, HEIGHT);
//         camera.aspect = WIDTH / HEIGHT;
//         camera.updateProjectionMatrix();
//     }, false);
//
//     controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableKeys = false;
//
//     // Helpers
//     scene.add(new AxesHelper());
//     scene.add(new GridHelper(100, 20, new Color('#9923D2'), new Color('#F5D0FE')));
//
//     initializeWorld();
//     configureGUI();
//     animate();
// }
//
// function initializeWorld() {
//     world = new ECS([
//         new SceneObjectSystem(scene),
//         new SphereFactorySystem(),
//         new CubeFactorySystem(),
//         new LogSystem()
//     ]);
//
//     // Add our player (CUBE)
//     world.addEntity(new CubeEntity({
//         width: 10,
//         height: 10,
//         depth: 10
//     }, '#FF0000'));
//
//
//     // Add AI player (Sphere)
//     world.addEntity(new SphereEntity({
//         radius: 5,
//         heightSegments: 8,
//         widthSegments: 8
//     }, '#0000FF'));
// }
//
// function configureGUI() {
//
//     const keyboardSystem = new KeyboardSystem();
//     const aiSystem = new NPCSystem();
//
//     gui = new GUI();
//
//     const guiOptions = {
//         KeyboardSystem: false,
//         NPCSystem: false,
//     };
//
//     gui.add(guiOptions, 'KeyboardSystem').onChange(() => {
//         if (guiOptions.KeyboardSystem) {
//             world.addSystem(keyboardSystem);
//         } else {
//             world.removeSystem(keyboardSystem);
//         }
//     });
//
//     gui.add(guiOptions, 'NPCSystem').onChange(() => {
//         if (guiOptions.NPCSystem) {
//             world.addSystem(aiSystem);
//         } else {
//             world.removeSystem(aiSystem);
//         }
//     });
// }
//
// function animate() {
//     requestAnimationFrame(animate);
//
//     // Atualiza ECS
//     world.update();
//
//     controls.update();
//
//     render();
// }
//
// function render() {
//     renderer.render(scene, camera);
// }
//
// init();
