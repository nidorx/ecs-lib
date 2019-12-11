import {Entity, System} from "ecs-lib";
import {Object3DComponent} from "../component/Object3DComponent";
import {SphereComponent} from "../component/SphereComponent";

/**
 * Represents artificial intelligence, controls sphere animation on map
 */
export default class NPCSystem extends System {

    constructor() {
        super([
            Object3DComponent.type,
            SphereComponent.type
        ]);
    }

    update(time: number, delta: number, entity: Entity): void {
        let object3D = Object3DComponent.oneFrom(entity).data;
        if (Math.random() > 0.7) {
            object3D.translateX(0.3);
            if (object3D.position.x > 50) {
                object3D.position.x = 50;
            }
        } else if (Math.random() > 0.7) {
            object3D.translateX(-0.3);
            if (object3D.position.x < -50) {
                object3D.position.x = -50;
            }
        } else if (Math.random() > 0.7) {
            object3D.translateZ(-0.3);
            if (object3D.position.z > 50) {
                object3D.position.z = 50;
            }
        } else if (Math.random() > 0.7) {
            object3D.translateZ(0.3);
            if (object3D.position.z < -50) {
                object3D.position.z = -50;
            }
        }
    }
}

