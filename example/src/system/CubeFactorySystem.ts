import {BoxGeometry, Mesh, MeshBasicMaterial} from "three";
import {Component, Entity, System} from "ecs-lib";
import {Object3DComponent} from "../component/Object3DComponent";
import {ColorComponent} from "../component/ColorComponent";
import {BoxComponent} from "../component/BoxComponent";

/**
 * Responsible for creating boxes, when an entity has the color and cube components.
 */
export default class CubeFactorySystem extends System {

    constructor() {
        super([
            ColorComponent.type,
            BoxComponent.type
        ]);
    }

    enter(entity: Entity): void {
        let object = Object3DComponent.oneFrom(entity);
        if (!object) {
            const box = BoxComponent.oneFrom(entity).data;
            const color = ColorComponent.oneFrom(entity).data;

            const geometry = new BoxGeometry(box.width, box.height, box.depth);
            const material = new MeshBasicMaterial({color: color});
            const cube = new Mesh(geometry, material);

            // Append new component to entity
            entity.add(new Object3DComponent(cube));
        }
    }

    change(entity: Entity, added: Component<any>[], removed: Component<any>[]): void {
        console.log('CubeFactorySystem::change', entity, added, removed);
    }
}

