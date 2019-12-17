import {Entity, System} from "ecs-lib";
import {Object3DComponent} from "../component/Object3DComponent";
import {ParticleComponent} from "../component/ParticleComponent";
import {AdditiveBlending, Geometry, Mesh, Points, PointsMaterial, TextureLoader, Vector3} from "three";

const textureLoader = new TextureLoader();

export default class ParticleSystem extends System {

    constructor() {
        super([
            ParticleComponent.type
        ]);
    }

    update(time: number, delta: number, entity: Entity): void {
        let object = Object3DComponent.oneFrom(entity);
        if (object) {
            let particleSystem = object.data;
            let config = ParticleComponent.oneFrom(entity);
            let data = config.data;

            particleSystem.rotateY(delta * 0.00005);

            const geometry = ((particleSystem as Mesh).geometry as Geometry);

            let count = data.particles;
            while (count--) {

                // get the particle
                let particle = geometry.vertices[count];
                let velocity = config.attr.velocity[count];

                // check if we need to reset
                if (particle.y < 0) {
                    particle.y = 100;
                    velocity.y = -Math.random();
                }

                // update the velocity with a splat of randomniz
                // velocity.y -= Math.random() * delta * 0.00005;
                // particle.add(velocity);
                particle.y += velocity.y * delta * 0.005;
            }

            // flag to the particle system that we've changed its vertices.
            geometry.verticesNeedUpdate = true;
        }
    }

    enter(entity: Entity): void {
        let object = Object3DComponent.oneFrom(entity);
        if (!object) {
            let config = ParticleComponent.oneFrom(entity);
            let data = config.data;

            // Saves particle velocity
            config.attr.velocity = [];

            // create the particle variables
            let particles = new Geometry();
            let pMaterial = new PointsMaterial({
                color: 0xFFFFFF,
                size: data.size,
                map: textureLoader.load("circle_05.png"),
                blending: AdditiveBlending,
                transparent: true,
                depthTest: false,
                sizeAttenuation: true
            });

            // now create the individual particles
            for (var p = 0; p < data.particles; p++) {

                // create a particle with random
                // position values, -100 -> 100
                let pX = Math.random() * 200 - 100;
                let pY = Math.random() * 100 ;
                let pZ = Math.random() * 200 - 100;
                let particle = new Vector3(pX, pY, pZ);

                config.attr.velocity.push(new Vector3(0, -Math.random(), 0));

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

