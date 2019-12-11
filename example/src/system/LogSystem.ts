import {Entity, System} from "ecs-lib";

export default class LogSystem extends System {

    constructor() {
        super([-1], 0.5); // Logs all entities every 2 seconds (0.5 FPS)
    }

    update(time: number, delta: number, entity: Entity): void {
        console.log('LogSystem', entity);
    }
}

