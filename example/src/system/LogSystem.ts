import {Component, Entity, System} from "ecs-lib";
import {NodeLib} from "three/examples/jsm/nodes/core/NodeLib";

export default class LogSystem extends System {

    constructor() {
        super([-1], 0.5); // Logs all entities every 2 seconds (0.5 FPS)
    }

    update(time: number, delta: number, entity: Entity): void {
        console.log('LogSystem', entity);
    }

    change(entity: Entity, added: Component<any>[], removed: Component<any>[]): void {
        console.log('LogSystem::change', entity, added, removed);
    }
}

