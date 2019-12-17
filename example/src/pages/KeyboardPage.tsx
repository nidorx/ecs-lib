import React from "react";
import {PerspectiveCamera, Scene, WebGLRenderer} from "three";
import KeyboardSystem from "../system/KeyboardSystem";
import NPCSystem from "../system/NPCSystem";
import ECS from "ecs-lib";
import SphereFactorySystem from "../system/SphereFactorySystem";
import CubeFactorySystem from "../system/CubeFactorySystem";
import CubeEntity from "../entity/CubeEntity";
import SphereEntity from "../entity/SphereEntity";
import GUISession from "../utils/GUISession";

type Props = {
    gui: GUISession,
    world: ECS,
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
};

type State = {};

export class KeyboardPage extends React.PureComponent<Props, State> {

    static title = 'Keyboard & Npc';

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

        // Player and NPC
        world.addSystem(new SphereFactorySystem());
        world.addSystem(new CubeFactorySystem());

        // Add our player (CUBE)
        world.addEntity(new CubeEntity({
            width: 10,
            height: 10,
            depth: 10
        }, '#FF0000'));

        // Add AI player (Sphere)
        world.addEntity(new SphereEntity({
            radius: 5,
            heightSegments: 8,
            widthSegments: 8
        }, '#0000FF'));

        const keyboardSystem = new KeyboardSystem();
        const aiSystem = new NPCSystem();

        const guiOptions = {
            KeyboardSystem: false,
            NPCSystem: false,
        };

        gui.add(guiOptions, 'KeyboardSystem').onChange(() => {
            if (guiOptions.KeyboardSystem) {
                world.addSystem(keyboardSystem);
            } else {
                world.removeSystem(keyboardSystem);
            }
        });

        gui.add(guiOptions, 'NPCSystem').onChange(() => {
            if (guiOptions.NPCSystem) {
                world.addSystem(aiSystem);
            } else {
                world.removeSystem(aiSystem);
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
