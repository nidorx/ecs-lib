import {Entity} from "ecs-lib";
import {ColorComponent} from "../component/ColorComponent";
import {Sphere, SphereComponent} from "../component/SphereComponent";

export default class SphereEntity extends Entity {

    constructor(sphere: Sphere, color: string) {
        super();

        this.add(new SphereComponent(sphere));
        this.add(new ColorComponent(color));
    }
}
