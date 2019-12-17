import {Component} from "ecs-lib";

export type Config = {
    mass: number;
    impulse: number;
}

export const PongComponent = Component.register<Config>();
