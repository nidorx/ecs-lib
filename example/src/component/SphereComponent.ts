import {Component} from "ecs-lib";

export type Sphere = {
    radius: number;
    widthSegments: number;
    heightSegments: number;
    x?:number;
    z?:number;
}

export const SphereComponent = Component.register<Sphere>();
