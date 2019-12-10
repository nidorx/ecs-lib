import {Component} from "ecs-lib";

export type Sphere = {
    radius: number;
    widthSegments: number;
    heightSegments: number;
}

export const SphereComponent = Component.register<Sphere>();
