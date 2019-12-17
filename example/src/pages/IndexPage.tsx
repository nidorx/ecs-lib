import React from "react";
import {GUI} from "dat.gui";
import {
    AxesHelper,
    Camera,
    Clock,
    Color,
    GridHelper,
    Material,
    OrthographicCamera,
    PerspectiveCamera,
    Scene,
    WebGLRenderer
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {PAGES} from "../Constants";
import GUISession from "../utils/GUISession";
import {createCubeEnv} from "../utils/cubeEnv";
import ECS from "ecs-lib";
import SceneObjectSystem from "../system/SceneObjectSystem";
import LogSystem from "../system/LogSystem";

const ENVMAPS = [
    {
        texture: 'lake',
        title: 'Lake'
    },
    {
        texture: 'bridge',
        title: 'Bridge'
    },
    {
        texture: 'miramar',
        title: 'Miramar'
    }
];

type Props = {};
type State = {
    world?: ECS;
    scene?: Scene;
    camera?: Camera;
    renderer?: WebGLRenderer;
    gui: GUI,
    page?: typeof React.Component,
    // A Sessão é o experimento ativo no momento
    session?: GUISession
};

export class IndexPage extends React.PureComponent<Props, State> {

    state: State = {
        gui: new GUI()
    };

    private pageRef = React.createRef<any>();

    componentDidMount(): void {

        const gui = this.state.gui;
        gui.width = 300;

        const APPKEY = 'ecs-lib-examples-';

        class StorageProxy {
            constructor(private key: string, private type: 'number' | 'bool' | 'string' = 'number') {

            }

            get(def?: any): any {
                switch (this.type) {
                    case 'number':
                        return Number.parseInt(window.localStorage.getItem(APPKEY + this.key) || (def ? '' + def : undefined) || '0');
                        break;
                    case 'bool':
                        let value = window.localStorage.getItem(APPKEY + this.key);
                        if (value === 'true') {
                            return true;
                        }
                        if (value === 'false') {
                            return false;
                        }
                        if (def === undefined) {
                            return true;
                        }
                        return def;
                        break;
                    case 'string':
                        return window.localStorage.getItem(APPKEY + this.key) || def;
                        break;
                }
            }

            set(value: any) {
                window.localStorage.setItem(APPKEY + this.key, value);
            }
        }

        // Funções a serem executadas sempre que alterar a página
        const onPageChange: Array<Function> = [];

        var scene: Scene,
            camera: Camera,
            controls: OrbitControls,
            HEIGHT = window.innerHeight,
            WIDTH = window.innerWidth,
            windowHalfX = WIDTH / 2,
            windowHalfY = HEIGHT / 2,
            cubeEnv: any;

        const renderer = new WebGLRenderer({
            canvas: document.getElementById('canvas') as HTMLCanvasElement,
            // alpha: true,
            antialias: true
        });
        renderer.setSize(WIDTH, HEIGHT);
        renderer.setPixelRatio(window.devicePixelRatio);

        let aspect = WIDTH / HEIGHT;
        var frustumSize = 120;
        const perspectiveCamera = new PerspectiveCamera(60, aspect, 1, 2000);
        const orthographicCamera = new OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            -120,
            2000
        );

        perspectiveCamera.position.y = 60;
        perspectiveCamera.position.x = 60;
        perspectiveCamera.position.z = 60;

        orthographicCamera.position.y = 60;
        orthographicCamera.position.x = 60;
        orthographicCamera.position.z = 60;

        const perspectiveControls = new OrbitControls(perspectiveCamera, renderer.domElement);
        const orthographicControls = new OrbitControls(orthographicCamera, renderer.domElement);

        perspectiveControls.enableKeys = false;
        orthographicControls.enableKeys = false;

        // ----------------------------------------------------------------
        // CONTROLE DE RENDERIZAÇÃO
        // ----------------------------------------------------------------
        (() => {
            window.addEventListener('resize', function () {
                HEIGHT = window.innerHeight;
                WIDTH = window.innerWidth;
                windowHalfX = WIDTH / 2;
                windowHalfY = HEIGHT / 2;

                if (renderer) {
                    renderer.setSize(WIDTH, HEIGHT);
                }

                let aspect = WIDTH / HEIGHT;

                perspectiveCamera.aspect = aspect;
                perspectiveCamera.updateProjectionMatrix();

                orthographicCamera.left = frustumSize * aspect / -2;
                orthographicCamera.right = frustumSize * aspect / 2;
                orthographicCamera.top = frustumSize / 2;
                orthographicCamera.bottom = frustumSize / -2;
                orthographicCamera.updateProjectionMatrix();

                if (cubeEnv) {
                    cubeEnv.onResize(aspect);
                }
            }, false);


            const render = () => {
                if (scene && camera) {

                    // Render page
                    if (this.pageRef.current && this.pageRef.current.render3D) {
                        this.pageRef.current.render3D();
                    }

                    renderer.render(scene, camera);
                }
            };

            let clock = new Clock();
            let delta = 0;
            // 60 fps
            let interval = 1 / 60;


            const animate = () => {
                requestAnimationFrame(animate);

                // Update ECS

                if (this.state.world) {
                    this.state.world.update();
                }

                perspectiveControls.update();
                orthographicControls.update();

                delta += clock.getDelta();

                // Animate page
                if (this.pageRef.current && this.pageRef.current.animate3D) {
                    this.pageRef.current.animate3D();
                }

                if (delta > interval) {
                    // The draw or time dependent code are here
                    render();

                    delta = delta % interval;
                }
            };

            animate();
        })();


        // ----------------------------------------------------------------
        // SELEÇÃO DE PÁGINA (Experimento/Ferramenta)
        // ----------------------------------------------------------------
        (() => {
            const pages: {
                [key: string]: any
            } = {};

            PAGES.map((page, i) => {
                pages[page.title] = i;
            });

            const pageStorage = new StorageProxy('page');
            const pageParams = {
                page: pageStorage.get()
            };
            const pageController = gui.add(pageParams, 'page', pages)
                .onChange((index) => {

                    pageStorage.set(pageParams.page);

                    const page = PAGES[pageParams.page];
                    const oldSession = this.state.session;

                    // Realiza a limpeza da página anerior
                    this.setState({
                        page: undefined,
                        session: new GUISession(this.state.gui, page.title)
                    }, () => {

                        // Remove os controles criados pelo experimento anterior
                        if (oldSession) {
                            oldSession.destroy();
                        }

                        if (scene) {
                            // Remove os elementos inseridos na página atual, incluindo a própria cena
                            scene.dispose();
                        }
                        scene = new Scene();
                        scene.background = new Color(0x888888);
                        // scene.fog = new Fog(scene.background, 10, 20);

                        // scene.add(new Mesh(new BoxBufferGeometry(20, 20, 20), new MeshLambertMaterial({color: Math.random() * 0xffffff})));


                        onPageChange.forEach(fn => {
                            fn();
                        });

                        if (this.state.world) {
                            this.state.world.destroy();
                        }

                        let world = new ECS([
                            new SceneObjectSystem(scene),
                            new LogSystem()
                        ]);

                        // Renderiza a nova página
                        this.setState({
                            scene: scene,
                            camera: camera,
                            renderer: renderer,
                            page: page,
                            world: world
                        });
                    });
                });

            setTimeout(function () {
                pageController.setValue(pageParams.page)
            }, 10)
        })();

        // ----------------------------------------------------------------
        // AMBIENTE
        // ----------------------------------------------------------------
        var environment = gui.addFolder('Environment');


        setTimeout(() => {

            // ----------------------------------------------------------------
            // CAMERA
            // ----------------------------------------------------------------
            const cameras = {
                Perspective: 'P',
                Orthographic: 'O',
            };
            const cameraStorage = new StorageProxy('camera', 'string');
            const cameraParams = {
                camera: cameraStorage.get('P'),
            };
            let cameraUpdate = () => {

                cameraStorage.set(cameraParams.camera);

                if (cameraParams.camera === 'P') {
                    // Perspective
                    camera = perspectiveCamera;
                } else {
                    // Orthographic
                    camera = orthographicCamera;
                }

                this.setState({
                    camera: camera,
                });
            };
            onPageChange.push(cameraUpdate);
            environment.add(cameraParams, 'camera', cameras)
                .onChange(cameraUpdate)
                .setValue(cameraParams.camera);

            // ----------------------------------------------------------------
            // ENVMAP
            // ----------------------------------------------------------------
            const envmaps: {
                [key: string]: any
            } = {};

            ENVMAPS.forEach((item, i) => {
                envmaps[item.title] = i;
            });

            const envmapStorage = new StorageProxy('envmap');
            const envmapParams = {
                envmap: envmapStorage.get(),
            };
            let envmapUpdate = () => {

                envmapStorage.set(envmapParams.envmap);

                const envmap = ENVMAPS[envmapParams.envmap].texture;

                if (cubeEnv) {
                    cubeEnv.destroy();
                }

                if (renderer) {
                    cubeEnv = createCubeEnv(envmap, WIDTH / HEIGHT, renderer);
                }
            };
            onPageChange.push(envmapUpdate);
            environment.add(envmapParams, 'envmap', envmaps)
                .onChange(envmapUpdate)
                .setValue(envmapParams.envmap);


            // ----------------------------------------------------------------
            // GRID
            // ----------------------------------------------------------------
            const grid = environment.addFolder('Grid');
            const gridStorageShow = new StorageProxy('grid-show', 'bool');
            const gridStorageSize = new StorageProxy('grid-size');
            const gridStorageDivisions = new StorageProxy('grid-divisions');
            const gridStorageColor1 = new StorageProxy('grid-color1', 'string');
            const gridStorageColor2 = new StorageProxy('grid-color2', 'string');
            const gridParams = {
                show: gridStorageShow.get(),
                size: gridStorageSize.get(200),
                divisions: gridStorageDivisions.get(20),
                color1: gridStorageColor1.get('#9923D2'),
                color2: gridStorageColor2.get('#F5D0FE'),
            };
            var gridHelper: GridHelper;
            let gridUpdate = function () {

                gridStorageShow.set(gridParams.show);
                gridStorageSize.set(gridParams.size);
                gridStorageDivisions.set(gridParams.divisions);
                gridStorageColor1.set(gridParams.color1);
                gridStorageColor2.set(gridParams.color2);

                if (!scene) {
                    return;
                }
                if (gridHelper) {
                    scene.remove(gridHelper);
                    gridHelper = undefined;
                }

                if (gridParams.show) {
                    gridHelper = new GridHelper(gridParams.size, gridParams.divisions, gridParams.color1, gridParams.color2);
                    scene.add(gridHelper);
                }
            };
            onPageChange.push(gridUpdate);
            grid.add(gridParams, 'show').onChange(gridUpdate).setValue(gridParams.show);
            grid.add(gridParams, 'size', 10, 500, 5).onChange(gridUpdate).setValue(gridParams.size);
            grid.add(gridParams, 'divisions', 5, 50, 5).onChange(gridUpdate).setValue(gridParams.divisions);
            grid.addColor(gridParams, 'color1').onChange(gridUpdate).setValue(gridParams.color1);
            grid.addColor(gridParams, 'color2').onChange(gridUpdate).setValue(gridParams.color2);


            // ----------------------------------------------------------------
            // AXIS
            // ----------------------------------------------------------------
            const axes = environment.addFolder('Axes');
            const axesStorageShow = new StorageProxy('axes-show', 'bool');
            const axesStorageSize = new StorageProxy('axes-size');
            const axesStorageDepthTest = new StorageProxy('axes-depthTest', 'bool');
            const axesParams = {
                show: axesStorageShow.get(),
                size: axesStorageSize.get(100),
                depthTest: axesStorageDepthTest.get(false),
            };
            var axesHelper: AxesHelper;
            let axesUpdate = function () {

                axesStorageShow.set(axesParams.show);
                axesStorageDepthTest.set(axesParams.depthTest);
                axesStorageSize.set(axesParams.size);

                if (!scene) {
                    return;
                }

                if (axesHelper) {
                    scene.remove(axesHelper);
                    axesHelper = undefined;
                }

                if (axesParams.show) {
                    axesHelper = new AxesHelper(axesParams.size);
                    if (!axesParams.depthTest) {
                        (axesHelper.material as Material).depthTest = false;
                        axesHelper.renderOrder = 1;
                    }
                    scene.add(axesHelper);
                }
            };
            onPageChange.push(axesUpdate);
            axes.add(axesParams, 'show').onChange(axesUpdate).setValue(axesParams.show);
            axes.add(axesParams, 'size', 10, 260, 5).onChange(axesUpdate).setValue(axesParams.size);
            axes.add(axesParams, 'depthTest').onChange(axesUpdate).setValue(axesParams.depthTest);
        }, 100);
    }

    render() {
        const PageComponent = this.state.page;
        return (
            <div>
                {
                    PageComponent
                        ? (
                            <div>
                                <div id={'page-title'}>
                                    <h1>ECS (Entity Component System) library for game programming</h1>
                                    <a href="https://github.com/nidorx/ecs-lib/tree/master/example">https://github.com/nidorx/ecs-lib/tree/master/example</a>
                                    <h2>{(PageComponent as any).title}</h2>
                                    {(PageComponent as any).help}
                                </div>
                                <PageComponent
                                    ref={this.pageRef}
                                    gui={this.state.session}
                                    world={this.state.world}
                                    scene={this.state.scene}
                                    camera={this.state.camera}
                                    renderer={this.state.renderer}
                                />
                            </div>
                        )
                        : null
                }
            </div>
        );
    }
}
