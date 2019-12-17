import React from "react";
import {PerspectiveCamera, Scene, WebGLRenderer} from "three";
import ECS from "ecs-lib";
import GUISession from "../utils/GUISession";
import AnimatedEntity from "../entity/AnimatedEntity";
import ParticleSystem from "../system/ParticleSystem";
import PongSystem from "../system/PongSystem";
import SphereEntity from "../entity/SphereEntity";
import SphereFactorySystem from "../system/SphereFactorySystem";
import {PongComponent} from "../component/PongComponent";

type Props = {
    gui: GUISession,
    world: ECS,
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
};

type State = {};

export class TimescalePage extends React.PureComponent<Props, State> {

    static title = 'Timescale (Slow Motion)';

    static help = (
        <div>
            <p>A time scale of 1 means normal speed. 0.5 means half the speed and 2.0 means twice the speed. If you set
                the game's timescale to 0.1, it will be ten times slower but still smooth - a good slow motion effect!
            </p>
        </div>
    );

    state: State = {};

    componentDidMount(): void {
        const gui = this.props.gui;
        const world = this.props.world;

        world.addSystem(new SphereFactorySystem());
        world.addSystem(new PongSystem());
        world.addSystem(new ParticleSystem());

        // Add animated entity
        world.addEntity(new AnimatedEntity());

        let sphereA = new SphereEntity({
            radius: 5,
            heightSegments: 8,
            widthSegments: 8,
            x: 25,
            z: -25
        }, '#0000FF');

        sphereA.add(new PongComponent({
            mass: 2.0,
            impulse: 0.3
        }));
        world.addEntity(sphereA);


        let sphereB = new SphereEntity({
            radius: 5,
            heightSegments: 8,
            widthSegments: 8,
            x: -25,
            z: 25
        }, '#FF0000');

        sphereB.add(new PongComponent({
            mass: 0.5,
            impulse: 0.2
        }));
        world.addEntity(sphereB);

        const guiOptions = {
            timescale: 1.0,
            pause: false
        };

        gui.add(guiOptions, 'timescale', 0.1, 2.0).onChange(() => {
            if (guiOptions.pause) {
                world.timeScale = 0;
            } else {
                world.timeScale = guiOptions.timescale;
            }
        });

        gui.add(guiOptions, 'pause').onChange(() => {
            if (guiOptions.pause) {
                world.timeScale = 0;
            } else {
                world.timeScale = guiOptions.timescale;
            }
        });
    }

    /**
     * Permite animar algum elemento 3D antes de renderizar o canvas
     */
    animate3D() {

    }

    /**
     * Permite executar ações ao renderizar o canvas
     */
    render3D() {
    }

    render() {
        // Esse experimento não possui conteúdo html
        return (<div/>);
    }
}
