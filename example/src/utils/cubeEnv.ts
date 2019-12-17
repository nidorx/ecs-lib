/**
 * Obtém um cubo com envmap
 *
 * @returns {Mesh}
 */
import {
    BackSide,
    BoxBufferGeometry,
    CubeTextureLoader,
    Mesh,
    PerspectiveCamera,
    RGBFormat,
    Scene,
    ShaderLib,
    ShaderMaterial,
    WebGLRenderer
} from "three";

const cubeTextureLoader = new CubeTextureLoader();

/**
 * http://www.humus.name/index.php?page=Textures&start=0
 * https://www.cleanpng.com/free/skybox.html
 * http://www.custommapmakers.org/skyboxes.php
 * https://opengameart.org/art-search-advanced?field_art_tags_tid=skybox
 *
 * @param name
 */
function loadCubemap(name: string) {
    var format = '.jpg';
    var parts = name.split('.');
    if (parts.length > 1) {
        name = parts[0];
        format = '.' + parts[1];
    }

    var path = './envmap/' + name + '/';
    // px = positive x
    // nx = negative x
    // py = positive y
    // ny = negative y
    // pz = positive z
    // nz = negative z
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    var textureCube = cubeTextureLoader.load(urls);
    textureCube.format = RGBFormat;
    // textureCube.mapping = CubeReflectionMapping;
    // textureCube.encoding = sRGBEncoding;
    return textureCube;
}

export function createCubeEnv(texture: string, aspect: number, renderer: WebGLRenderer) {

    var textureCube = loadCubemap(texture);

    var shader = ShaderLib.cube;
    var material = new ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: BackSide
    });
    material.uniforms.tCube.value = textureCube;


    Object.defineProperty(material, 'map', {
        get: function () {
            return this.uniforms.tCube.value;
        }
    });

    let geometry = new BoxBufferGeometry(100, 100, 100);
    var mesh = new Mesh(geometry, material);

    var cubeScene = new Scene();
    var cubeCamera = new PerspectiveCamera(70, aspect, 1, 100000);

    cubeScene.add(mesh);

    renderer.autoClearColor = false;

    // Sobrescrever o método antigo para renderizar o cubemap antes
    var oldrender = renderer.render;
    var render = oldrender.bind(renderer);
    renderer.render = function (scene, camera) {
        cubeCamera.rotation.copy(camera.rotation);
        render(cubeScene, cubeCamera);
        render(scene, camera);
    };

    return {
        scene: cubeScene,
        camera: cubeCamera,
        destroy: function () {
            cubeScene.remove(mesh);
            geometry.dispose();
            material.dispose();
            textureCube.dispose();

            renderer.render = oldrender;
        },
        onResize: function (aspect: number) {
            cubeCamera.aspect = aspect;
            cubeCamera.updateProjectionMatrix();
        }
    }
}
