import {Entity, System} from "ecs-lib";
import {Object3DComponent} from "../component/Object3DComponent";
import {BoxComponent} from "../component/BoxComponent";
import KeyboardState from "../utils/KeyboardState";

/**
 * Represents the player, lets you control the cube by keyboard
 */
export default class KeyboardSystem extends System {

    constructor() {
        super([
            Object3DComponent.type,
            BoxComponent.type
        ]);
    }

    update(time: number, delta: number, entity: Entity): void {
        let object3D = Object3DComponent.oneFrom(entity).data;
        if (KeyboardState.pressed("right")) {
            object3D.translateX(0.3);
        } else if (KeyboardState.pressed("left")) {
            object3D.translateX(-0.3);
        } else if (KeyboardState.pressed("up")) {
            object3D.translateZ(-0.3);
        } else if (KeyboardState.pressed("down")) {
            object3D.translateZ(0.3);
        }
    }
}

