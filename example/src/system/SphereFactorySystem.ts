import {Mesh, MeshBasicMaterial, SphereGeometry} from "three";
import {Entity, System} from "ecs-lib";
import {Object3DComponent} from "../component/Object3DComponent";
import {ColorComponent} from "../component/ColorComponent";
import {SphereComponent} from "../component/SphereComponent";

/**
 * Responsible for creating Sphere, when an entity has the color and sphere components.
 */
export default class SphereFactorySystem extends System {

    constructor() {
        super([
            ColorComponent.type,
            SphereComponent.type
        ]);
    }

    enter(entity: Entity): void {
        let object = Object3DComponent.oneFrom(entity);
        if (!object) {
            const sphere = SphereComponent.oneFrom(entity).data;
            const color = ColorComponent.oneFrom(entity).data;

            const geometry = new SphereGeometry(sphere.radius, sphere.widthSegments, sphere.heightSegments);
            const material = new MeshBasicMaterial({color: color});
            const object3d = new Mesh(geometry, material);

            // Append new component to entity
            entity.add(new Object3DComponent(object3d));
        }
    }
}

