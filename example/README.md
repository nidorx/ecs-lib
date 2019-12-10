# ecs-lib Example


This is an example of using ecs-lib  (using Typescript and Threejs, you can use pure js too).


```bash
npm install
npm start

# Navigate to http://localhost:8080
```


## Components

- **ColorComponent** - Simple component that determines entity color
- **BoxComponent** - Configuration data of a box geometry. 
- **SphereComponent** - Configuration data of a sphere geometry. 
- **Object3DComponent** - Configuration data of a 3D Object. In this game, all 3D objects are inserted into the scene automatically (See SceneObjectSystem.ts)

## Entities

- **CubeEntity** - An entity that has the **color** and **box** components. In our game, after this component receives a 3D Object (see Object3DComponent.ts and SceneObjectSystem.ts) this entity is eligible to be managed by the keyboard (see KeyboardSystem.ts).
- **SphereEntity** - An entity that has the **color** and **sphere** components. In our game, after this component receives a 3D Object (see Object3DComponent.ts and SceneObjectSystem.ts) this entity is eligible to be considered an artificial intelligence (NPC) (see AISystem.ts)

## Systems

- **CubeFactorySystem** - Whenever an entity with **color** and **box** components is added, this system performs the creation of the 3D object of that entity.
- **SphereFactorySystem** - Whenever an entity with **color** and **sphere** components is added, this system performs the creation of the 3D object of that entity.
- **SceneObjectSystem** - Whenever an entity with the **3D Object** component is added, or when an existing entity receives a **3D Object**, this system adds the 3D Object of that entity to the scene.
- **KeyboardSystem** - For any entity that has the **box** and **3D Object** components, this system moves the 3D Object of that entity based on the keys pressed by the user. **This system therefore represents the player's actions in the game**.
- **AISystem** - For any entity that has the **sphere** and **3D Object** components, this system randomly moves the 3D Object from that entity. This system therefore represents the actions of NPC and artificial intelligence in the game.


