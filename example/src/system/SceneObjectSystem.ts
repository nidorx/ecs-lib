import {Scene} from "three";
import {Entity, System} from "ecs-lib";
import {Object3DComponent} from "../component/Object3DComponent";

/**
 * All Entity with Object3DComponent will be added and removed from scene
 */
export default class SceneObjectSystem extends System {

    private scene: Scene;

    constructor(scene: Scene) {
        super([
            Object3DComponent.type
        ]);

        this.scene = scene;
    }

    enter(entity: Entity): void {
        let model = Object3DComponent.oneFrom(entity);

        if (this.scene.children.indexOf(model.data) < 0) {
            this.scene.add(model.data);
        }
    }

    exit(entity: Entity): void {
        let model = Object3DComponent.oneFrom(entity);
        this.scene.remove(model.data);
    }
}

