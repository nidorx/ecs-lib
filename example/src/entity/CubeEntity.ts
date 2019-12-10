import {Entity} from "ecs-lib";
import {ColorComponent} from "../component/ColorComponent";
import {Box, BoxComponent} from "../component/BoxComponent";

export default class CubeEntity extends Entity {

    constructor(cube: Box, color: string) {
        super();

        this.add(new BoxComponent(cube));
        this.add(new ColorComponent(color));
    }
}
