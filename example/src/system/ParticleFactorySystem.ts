import {Entity, System} from "ecs-lib";
import {Object3DComponent} from "../component/Object3DComponent";
import {ParticleComponent} from "../component/ParticleComponent";
import {AdditiveBlending, Geometry, Points, PointsMaterial, TextureLoader, Vector3} from "three";

const textureLoader = new TextureLoader();

export default class ParticleFactorySystem extends System {

    constructor() {
        super([
            ParticleComponent.type
        ]);
    }

    update(time: number, delta: number, entity: Entity): void {
        let object = Object3DComponent.oneFrom(entity);
        if (object) {
            let particleSystem = object.data;
            console.log(time, delta);
            particleSystem.rotateY(delta * 0.1);
        }
    }

    enter(entity: Entity): void {
        let object = Object3DComponent.oneFrom(entity);
        if (!object) {
            let config = ParticleComponent.oneFrom(entity).data;

            // create the particle variables
            let particleCount = config.particles;
            let particles = new Geometry();
            let pMaterial = new PointsMaterial({
                color: 0xFFFFFF,
                size: config.size,
                map: textureLoader.load("particle.png"),
                blending: AdditiveBlending,
                transparent: true
            });

            // now create the individual particles
            for (var p = 0; p < particleCount; p++) {

                // create a particle with random
                // position values, -250 -> 250
                var pX = Math.random() * 500 - 250,
                    pY = Math.random() * 500 - 250,
                    pZ = Math.random() * 500 - 250,
                    particle = new Vector3(pX, pY, pZ);

                // add it to the geometry
                particles.vertices.push(particle);
            }

            // create the particle system
            var particleSystem = new Points(particles, pMaterial);

            // add it to the scene
            entity.add(new Object3DComponent(particleSystem));
        }
    }
}

