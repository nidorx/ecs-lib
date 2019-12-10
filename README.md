# ecs-lib

ecs-lib is a tiny and easy to use [Entity Component System](https://en.wikipedia.org/wiki/Entity_component_system) library for game programming and much more written in Typescript (But you can use on node.js an Browser too). 


**TLDR;** Take a look on [Example](https://github.com/nidorx/ecs-lib/) 


```bash
npm install --save ecs-lib
```


## Concepts and how to use

## World

A container for Entities, Components, and Systems. In **ecs-lib** the world is presented by the ECS class.

```typescript
import ECS from "ecs-lib";

const world = new ECS();
```


### Component

Represents the different facets of an entity, such as geometry, physics, and hit points for example. Components store only raw data for one aspect of the object, and how it interacts with the world.

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

The register method generates a new class that represents this type of component, which has a unique identifier (You also have access to the type id from the created instances).

```typescript
const boxData = new BoxComponent({width:10, height:10, depth:10});

// prints true, in this case type = 1
console.log(BoxComponent.type === boxData.type);
```

Component instance displays raw data by property "data"

```typescript
boxData.data.width = 33;
console.log(boxData.data.height);
```

> You can also have access to the `Component` class from ECS (`import ECS from "ecs-lib" ... ECS.Component.register`). 


### Entity

The entity is a general purpose object. It consists only of a unique ID and the list of components that make up this entity.

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

Then you can add multiple instances of the same entity in the world. Each entity is given a unique identifier at creation time.

```typescript
const cube = new CubeEntity({
    width: 10,
    height: 10,
    depth: 10
}, '#FF0000');

console.log(cube, cube.id);

world.addEntity(cube);

world.removeEntity(cube);
world.removeEntity(cube.id);
```

At any point in the entity's life flow, you can add or remove components, using `add` and `remove` methods.

```typescript
cube.add(boxData);
cube.remove(boxData);
```

Ecs-lib entities can have more than one component per type, it is up to the programmer to control the addition and removal of entity components.

```typescript
cube.add(new BoxComponent({width:10, height:10, depth:10}));
cube.add(new BoxComponent({width:20, height:20, depth:20}));
```

In ecs-lib you can be informed when a component is added or removed from an entity by simply subscribing to the entity.

To unsubscribe, simply invoke the function you received at the time of subscription.

```typescript
const cancel = cube.subscribe((entity)=>{
    console.log(entity === cube);
});

cancel();
```

To gain access to the components of an entity, simply use the "allFrom" and "oneFrom" methods of the Component class to get all or the first instance of this component respectively.

```typescript
BoxComponent.allFrom(cube)
    .forEach((boxData)=>{
        console.log(boxData.data.height);
    });

const boxData = BoxComponent.oneFrom(cube);
console.log(boxData.data.height);
```


> You can also have access to the `Entity` class from ECS (`import ECS from "ecs-lib" ... extends ECS.Entity`). 

### System

Represents the logic that transforms component data of an entity from its current state to its next state. A system runs on entities that have a specific set of component types.

Each system runs continuously (as if each system had its own thread).


In ecs-lib, a system has a strong connection with component types. You must define which components this system works on in the System abstract class constructor.

Whenever an entity with the characteristics expected by this system is added or removed, the system is informed via the "enter" and "exit" methods. These same methods are triggered when the system is added or removed from the world and this world has the pattern of components expected by the system.
