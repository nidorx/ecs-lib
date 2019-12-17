import {Entity} from "ecs-lib";
import {ParticleComponent} from "../component/ParticleComponent";

export default class AnimatedEntity extends Entity {

    constructor() {
        super();

        this.add(new ParticleComponent({
            particles: 800,
            size: 5
        }));
    }
}
