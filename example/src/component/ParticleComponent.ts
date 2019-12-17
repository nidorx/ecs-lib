import {Component} from "ecs-lib";

export type Config = {
    particles: number;
    size: number;
}

export const ParticleComponent = Component.register<Config>();
