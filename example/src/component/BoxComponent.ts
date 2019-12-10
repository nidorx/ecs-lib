import {Component} from "ecs-lib";

export type Box = {
    width: number;
    height: number;
    depth: number;
}

export const BoxComponent = Component.register<Box>();
