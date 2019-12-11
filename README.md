# ecs-lib

**ecs-lib** is a tiny and easy to use [ECS _(Entity Component System)_](https://en.wikipedia.org/wiki/Entity_component_system) library for game programming and much more. It's written in Typescript but you can use on node.js an web browser too. 


**TLDR;** Take a look at the [example](https://github.com/nidorx/ecs-lib/example) and its [source code](https://github.com/nidorx/ecs-lib/example)


```bash
npm install --save ecs-lib
```

## Table of contents
   * [ecs-lib](#ecs-lib)
   * [Table of contents](#table-of-contents)
   * [Documentation](#documentation)
      * [World](#world)
      * [Component](#component)
         * [Raw data access](#raw-data-access)
      * [Entity](#entity)
         * [Adding and removing from the world](#adding-and-removing-from-the-world)
         * [Adding and Removing Components](#adding-and-removing-components)
         * [Subscribing to changes](#subscribing-to-changes)
         * [Accessing Components](#accessing-components)
      * [System](#system)
         * [Adding and removing from the world](#adding-and-removing-from-the-world-1)
         * [Limiting Frequency (FPS)](#limiting-frequency-fps)
         * [Global Systems - All Entities](#global-systems---all-entities)
         * [Enter - When Adding New Entities](#enter---when-adding-new-entities)
         * [Exit - When Removing Entities](#exit---when-removing-entities)
   * [Feedback, Requests and Roadmap](#feedback-requests-and-roadmap)
   * [Contributing](#contributing)
      * [Translating and documenting](#translating-and-documenting)
      * [Reporting Issues](#reporting-issues)
      * [Fixing defects and adding improvements](#fixing-defects-and-adding-improvements)
   * [License](#license)


## Documentation

Entity-Component-System (ECS) is a distributed and compositional architectural design pattern that is mostly used in game development. It enables flexible decoupling of domain-specific behaviour, which overcomes many of the drawbacks of traditional object-oriented inheritance.

For further details:

- [Entity Systems Wiki](http://entity-systems.wikidot.com/)
- [Evolve Your Hierarchy](http://cowboyprogramming.com/2007/01/05/evolve-your-heirachy/)
- [ECS on Wikipedia](https://en.wikipedia.org/wiki/Entity_component_system)
- [Entity Component Systems in Elixir](https://yos.io/2016/09/17/entity-component-systems/)

### World

A ECS instance is used to describe you game world or **Entity System** if you will. The World is a container for Entities, Components, and Systems.

```typescript
import ECS from "ecs-lib";

const world = new ECS();
```


### Component

Represents the different facets of an entity, such as position, velocity, geometry, physics, and hit points for example. Components store only raw data for one aspect of the object, and how it interacts with the world.

In other words, the component labels the entity as having this particular aspect.


```typescript
import {Component} from "ecs-lib";

export type Box = {
    width: number;
    height: number;
    depth: number;
}

export const BoxComponent = Component.register<Box>();
```

The register method generates a new class that represents this type of component, which has a unique identifier. You also have access to the type id from the created instances.

```typescript
const boxCmp = new BoxComponent({ width:10, height:10, depth:10 });

// prints true, in this case type = 1
console.log(BoxComponent.type === boxCmp.type);
```

> You can also have access to the `Component` class from ECS (`ECS.Component.register`)

#### Raw data access

Component instance displays raw data by property `data`

```typescript
boxCmp.data.width = 33;
console.log(boxCmp.data.width);
```


### Entity

The entity is a general purpose object. An entity is what you use to describe an object in your game. e.g. a player, a gun, etc. It consists only of a unique ID and the list of components that make up this entity.

```typescript
import {Entity} from "ecs-lib";
import {ColorComponent} from "../component/ColorComponent";
import {Box, BoxComponent} from "../component/BoxComponent";

export default class CubeEntity extends Entity {

    constructor(cube: Box, color: string) {
        super();

        this.add(new BoxComponent(cube));
        this.add(new ColorComponent(color));
    }
}
```

> You can also have access to the `Entity` class from ECS (`ECS.Entity`)

#### Adding and removing from the world

You can add multiple instances of the same entity in the world. Each entity is given a **unique identifier** at creation time.

```typescript
const cubeEnt = new CubeEntity({
    width: 10,
    height: 10,
    depth: 10
}, '#FF0000');

console.log(cubeEnt, cubeEnt.id);

world.addEntity(cubeEnt);

world.removeEntity(cubeEnt);
world.removeEntity(cubeEnt.id);
```

#### Adding and Removing Components 

At any point in the entity's life cycle, you can add or remove components, using `add` and `remove` methods.

```typescript
cubeEnt.add(boxCmp);
cubeEnt.remove(boxCmp);
```

**ecs-lib** entities can have more than one component per type, it is up to the programmer to control the addition and removal of entity components.

```typescript
cubeEnt.add(new BoxComponent({ width:10, height:10, depth:10 }));
cubeEnt.add(new BoxComponent({ width:20, height:20, depth:20 }));
```

#### Subscribing to changes

In **ecs-lib** you can be informed when a component is added or removed from an entity by simply subscribing to the entity.

To unsubscribe, simply invoke the function you received at the time of subscription.

```typescript
const cancel = cubeEnt.subscribe((entity)=>{
    console.log(entity === cubeEnt);
});

cancel();
```

#### Accessing Components
To gain access to the components of an entity, simply use the `allFrom` and `oneFrom` methods of the `Component` class to get all or the first instance of this component respectively.

```typescript
BoxComponent.allFrom(cubeEnt)
    .forEach((boxCmp)=>{
        console.log(boxCmp.data.height);
    });

const boxCmp = BoxComponent.oneFrom(cubeEnt);
console.log(boxCmp.data.height);
```


### System

Represents the logic that transforms component data of an entity from its current state to its next state. A system runs on entities that have a specific set of component types.

Each system runs continuously (as if each system had its own thread).

In **ecs-lib**, a system has a strong connection with component types. You must define which components this system works on in the `System` abstract class constructor.

If the `update` method is implemented, it will be invoked for every update in the world. Whenever an entity with the characteristics expected by this system is added or removed on world, or it components is changed, the system is informed via the `enter` and `exit` methods.

```typescript
import {Entity, System} from "ecs-lib";
import KeyboardState from "../utils/KeyboardState";
import {BoxComponent} from "../component/BoxComponent";
import {Object3DComponent} from "../component/Object3DComponent";

export default class KeyboardSystem extends System {

    constructor() {
        super([
            Object3DComponent.type,
            BoxComponent.type
        ]);
    }

    update(time: number, delta: number, entity: Entity): void {
        let object3D = Object3DComponent.oneFrom(entity).data;
        if (KeyboardState.pressed("right")) {
            object3D.translateX(0.3);
        } else if (KeyboardState.pressed("left")) {
            object3D.translateX(-0.3);
        } else if (KeyboardState.pressed("up")) {
            object3D.translateZ(-0.3);
        } else if (KeyboardState.pressed("down")) {
            object3D.translateZ(0.3);
        }
    }
}
```

#### Adding and removing from the world

To add or remove a system to the world, simply use the `addSystem` and `removeSystem` methods.

```typescript
const keyboardSys = new KeyboardSystem();
world.addSystem(keyboardSys);
world.removeSystem(keyboardSys);
```

#### Limiting Frequency (FPS)

It is possible to limit the maximum number of invocations that the `update` method can perform per second (FPS) by simply entering the `frequency` parameter in the class constructor. This control is useful for example to limit the processing of physics systems to a specific frequency in order to decrease the processing cost.

```typescript
export default class PhysicsSystem extends System {

    constructor() {
        super([
            Object3DComponent.type,
            VelocityComponent.type,
            PositionComponent.type,
            DirectionComponent.type
        ], 25);  // <- LIMIT FPS
    }

    // Will run at 25 FPS
    update(time: number, delta: number, entity: Entity): void {
       //... physics stuff
    }
}
```

#### Global Systems - All Entities

You can also create systems that receive updates from all entities, regardless of existing components. To do this, simply enter `[-1]` in the system builder. This functionality may be useful for debugging and other rating mechanisms for your game.

```typescript
import {Entity, System} from "ecs-lib";

export default class LogSystem extends System {

    constructor() {
        super([-1], 0.5); // Logs all entities every 2 seconds (0.5 FPS)
    }

    update(time: number, delta: number, entity: Entity): void {
        console.log(entity);
    }
}
```


#### Enter - When Adding New Entities


Invoked when:

 1. An entity with the characteristics (components) expected by this system is added in the world;
 2. This system is added in the world and this world has one or more entities with the characteristics expected by this system; 
 3. An existing entity in the same world receives a new component at runtime and all of its new components match the standard expected by this system.
 
 It can be used for initialization of new components in this entity, or even registration of this entity in a more complex management system.
 
 ```typescript
 import {Entity, System} from "ecs-lib";
 import {BoxGeometry, Mesh, MeshBasicMaterial} from "three";
 import {BoxComponent} from "../component/BoxComponent";
 import {ColorComponent} from "../component/ColorComponent";
 import {Object3DComponent} from "../component/Object3DComponent";
 
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
 }
 ```


#### Exit - When Removing Entities

Invoked when:
 
 1. An entity with the characteristics (components) expected by this system is removed from the world;
 2. This system is removed from the world and this world has one or more entities with the characteristics expected by this system;
 3. An existing entity in the same world loses a component at runtime and its new component set no longer matches the standard expected by this system;
 
 Can be used to clean memory and references.
 
 ```typescript
import {Scene} from "three";
import {Entity, System} from "ecs-lib";
import {Object3DComponent} from "../component/Object3DComponent";

export default class SceneObjectSystem extends System {

    private scene: Scene;

    constructor(scene: Scene) {
        super([
            Object3DComponent.type
        ]);

        this.scene = scene;
    }

    exit(entity: Entity): void {
        let model = Object3DComponent.oneFrom(entity);
        this.scene.remove(model.data);
    }
}
```

## Feedback, Requests and Roadmap

Please use [GitHub issues] for feedback, questions or comments.

If you have specific feature requests or would like to vote on what others are recommending, please go to the [GitHub issues] section as well. I would love to see what you are thinking.

## Contributing

You can contribute in many ways to this project.

### Translating and documenting

I'm not a native speaker of the English language, so you may have noticed a lot of grammar errors in this documentation.

You can FORK this project and suggest improvements to this document (https://github.com/nidorx/ecs-lib/edit/master/README.md).

If you find it more convenient, report a issue with the details on [GitHub issues].

### Reporting Issues

If you have encountered a problem with this component please file a defect on [GitHub issues].

Describe as much detail as possible to get the problem reproduced and eventually corrected.

### Fixing defects and adding improvements

1. Fork it (<https://github.com/nidorx/ecs-lib/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

## License

This code is distributed under the terms and conditions of the [MIT license](LICENSE).


[GitHub issues]: https://github.com/nidorx/ecs-lib/issues
