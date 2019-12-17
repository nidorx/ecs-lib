import React from "react";
import {PerspectiveCamera, Scene, WebGLRenderer} from "three";
import ECS from "ecs-lib";
import GUISession from "../utils/GUISession";
import AnimatedEntity from "../entity/AnimatedEntity";
import ParticleFactorySystem from "../system/ParticleFactorySystem";

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
            <p><strong>KeyboardSystem:</strong> Use directional keys to move character (Cube)</p>
            <p><strong>NPCSystem:</strong> System Controlled Character (Sphere)</p>
        </div>
    );

    state: State = {};

    componentDidMount(): void {
        const gui = this.props.gui;
        const world = this.props.world;

        world.addSystem(new ParticleFactorySystem());

        // Add animated entity
        world.addEntity(new AnimatedEntity());

        const guiOptions = {
            timescale: 1
        };

        gui.add(guiOptions, 'timescale', 0.1, 1.8).onChange(() => {
            world.timeScale = guiOptions.timescale;
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
