import {Entity, System} from "ecs-lib";
import {Object3DComponent} from "../component/Object3DComponent";
import {Vector3} from "three";
import {PongComponent} from "../component/PongComponent";
import {SphereComponent} from "../component/SphereComponent";

const GRAVITY = 0.0005;

export default class PongSystem extends System {

    constructor() {
        super([
            PongComponent.type,
            SphereComponent.type,
            Object3DComponent.type,
        ], 60);
    }

    update(time: number, delta: number, entity: Entity): void {
        let object = Object3DComponent.oneFrom(entity);
        let sphere = SphereComponent.oneFrom(entity);
        let config = PongComponent.oneFrom(entity);


        config.attr.velocity.y -= (GRAVITY * config.data.mass) * delta;
        object.data.position.y += config.attr.velocity.y * delta;

        // Ground, impulse up
        let ground = sphere.data.radius;
        if (object.data.position.y <= ground) {
            object.data.position.y = ground;
            config.attr.velocity.y = config.data.impulse;
        }
    }

    enter(entity: Entity): void {
        let config = PongComponent.oneFrom(entity);
        if (!config.attr.velocity) {
            config.attr.velocity = new Vector3(0, config.data.impulse, 0);
        }
    }
}

