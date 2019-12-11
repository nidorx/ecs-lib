let NOW: () => number;

let requestAnimationFrame: (cb: () => void) => void = () => 0;

if (typeof window !== 'undefined') {
    requestAnimationFrame = window.requestAnimationFrame;
    if (window.performance) {
        NOW = window.performance.now.bind(window.performance);
    }
} else {
    const start = Date.now();
    NOW = () => {
        return Date.now() - start;
    };

    requestAnimationFrame = setImmediate;
}

let SEQ_SYSTEM = 1;

let SEQ_ENTITY = 1;

let SEQ_COMPONENT = 1;

type Susbcription = (entity: Entity, added: Component<any>[], removed: Component<any>[]) => void;

/**
 * Representation of an entity in ECS
 */
export abstract class Entity {

    public static sequence(): number {
        return SEQ_ENTITY++;
    }

    /**
     * Lista de interessados sobre a atualiação dos componentes
     */
    private subscriptions: Array<Susbcription> = [];

    /**
     * Informs that subscriptions have been triggered.
     */
    private queued = false;

    /**
     * Quais componentes foram adicionados nessa entidade antes de informar aos interessados
     */
    private added: Component<any>[] = [];

    /**
     *  Quais componentes foram removidos dessa entidade antes de informar aos interessados
     */
    private removed: Component<any>[] = [];

    /**
     * Components by type
     */
    private components: {
        [key: number]: Component<any>[]
    } = {};

    public id: number;

    /**
     * Informs if the entity is active
     */
    public active: boolean = true;

    constructor() {
        this.id = Entity.sequence();
    }

    private dispatch() {
        if (!this.queued) {
            this.queued = true;
            // Informa aos interessados sobre a atualização
            requestAnimationFrame(() => {
                this.queued = false;
                const added = this.added;
                const removed = this.removed;
                this.added = [];
                this.removed = [];
                this.subscriptions.forEach(cb => cb(this, added, removed));
            });
        }
    }

    /**
     * Allows interested parties to receive information when this entity's component list is updated
     *
     * @param handler
     */
    public subscribe(handler: Susbcription): () => Entity {
        this.subscriptions.push(handler);

        return () => {
            const idx = this.subscriptions.indexOf(handler);
            if (idx >= 0) {
                this.subscriptions.splice(idx, 1);
            }
            return this;
        }
    }

    /**
     * Add a component to the entity
     *
     * @param component
     */
    public add(component: Component<any>) {
        const type = component.type;
        if (!this.components[type]) {
            this.components[type] = [];
        }

        this.components[type].push(component);

        this.added.push(component);

        this.dispatch();
    }

    /**
     * Removes a component's reference from this entity
     *
     * @param component
     */
    public remove(component: Component<any>) {
        const type = component.type;
        if (!this.components[type]) {
            return;
        }

        const idx = this.components[type].indexOf(component);
        if (idx >= 0) {
            this.components[type].splice(idx, 1);
            this.removed.push(component);
        }

        this.dispatch();
    }
}

/**
 * Force typing
 */
export type ComponentClassType<P> = (new (data: P) => Component<P>) & {

    /**
     * Static reference to type
     */
    type: number;

    /**
     * Get all instances of this component from entity
     *
     * @param entity
     */
    allFrom(entity: Entity): Component<P>[];

    /**
     * Get one instance of this component from entity
     *
     * @param entity
     */
    oneFrom(entity: Entity): Component<P>;
}

/**
 * Representation of a component in ECS
 */
export class Component<T> {

    /**
     * Register a new component class
     */
    public static register<P>(): ComponentClassType<P> {
        const typeID = SEQ_COMPONENT++;

        class ComponentImpl extends Component<P> {

            static type = typeID;

            static allFrom(entity: Entity): ComponentImpl[] {
                let components: ComponentImpl[] = (entity as any).components[typeID];
                return components || [];
            }

            static oneFrom(entity: Entity): ComponentImpl | undefined {
                let components = ComponentImpl.allFrom(entity);
                if (components && components.length > 0) {
                    return components[0];
                }
            }

            constructor(data: P) {
                super(typeID, data);
            }
        }

        return (ComponentImpl as any) as ComponentClassType<P>;
    }

    public type: number;

    public data: T;

    constructor(type: number, data: T) {
        this.type = type;
        this.data = data;
    }
}


/**
 * Represents the logic that transforms component data of an entity from its current state to its next state. A system
 * runs on entities that have a specific set of component types.
 */
export abstract class System {

    /**
     * Identificador único de uma instancia deste sistema
     */
    public id: number;

    /**
     * IDs of the types of components this system expects the entity to have before it can act on. If you want to
     * create a system that acts on all entities, enter [-1]
     */
    private components: number[] = [];

    /**
     * The maximum times per second this system should be updated.
     */
    public frequence: number;

    /**
     * Invoked in updates, limited to the value set in the "frequency" attribute
     *
     * @param time
     * @param delta
     * @param entity
     */
    public update?(time: number, delta: number, entity: Entity): void;

    /**
     * Invoked when an expected feature of this system is added or removed from the entity.
     *
     * @param entity
     * @param added
     * @param removed
     */
    public change?(entity: Entity, added: Component<any>[], removed: Component<any>[]): void;

    /**
     * Invoked when:
     * a) An entity with the characteristics (components) expected by this system is added in the world;
     * b) This system is added in the world and this world has one or more entities with the characteristics expected by
     * this system;
     * c) An existing entity in the same world receives a new component at runtime and all of its new components match
     * the standard expected by this system.
     *
     * @param entity
     */
    public enter?(entity: Entity): void;

    /**
     * Invoked when:
     * a) An entity with the characteristics (components) expected by this system is removed from the world;
     * b) This system is removed from the world and this world has one or more entities with the characteristics
     * expected by this system;
     * c) An existing entity in the same world loses a component at runtime and its new component set no longer matches
     * the standard expected by this system
     *
     * @param entity
     */
    public exit?(entity: Entity): void;

    /**
     * @param components IDs of the types of components this system expects the entity to have before it can act on.
     * If you want to create a system that acts on all entities, enter [-1]
     * @param frequence The maximum times per second this system should be updated. Defaults 0
     */
    constructor(components: number[], frequence: number = 0) {
        this.id = SEQ_SYSTEM++;
        this.components = components;
        this.frequence = frequence;
    }

    public getComponents(): number[] {
        return this.components.slice();
    }
}

/**
 * The very definition of the ECS. Also called Admin or Manager in other implementations.
 */
export default class ECS {

    public static System = System;

    public static Entity = Entity;

    public static Component = Component;

    /**
     * All systems in this world
     */
    private systems: System[] = [];

    /**
     * All entities in this world
     */
    private entities: Entity[] = [];

    /**
     * Indexes the systems that must be run for each entity
     */
    private entitySystems: { [key: number]: System[] } = {};

    /**
     * Records the last instant a system was run in this world for an entity
     */
    private entitySystemLastUpdate: { [key: number]: { [key: number]: number } } = {};

    /**
     * Saves subscriptions made to entities
     */
    private entitySubscription: { [key: number]: () => void } = {};

    constructor(systems?: System[]) {
        if (systems) {
            systems.forEach(system => {
                this.addSystem(system);
            });
        }
    }

    /**
     * Get an entity by id
     *
     * @param id
     */
    public getEntity(id: number): Entity | undefined {
        return this.entities.find(entity => entity.id === id);
    }

    /**
     * Add an entity to this world
     *
     * @param entity
     */
    public addEntity(entity: Entity) {
        if (!entity || this.entities.indexOf(entity) >= 0) {
            return;
        }

        this.entities.push(entity);
        this.entitySystemLastUpdate[entity.id] = {};

        // Remove subscription
        if (this.entitySubscription[entity.id]) {
            this.entitySubscription[entity.id]();
        }

        // Add new subscription
        this.entitySubscription[entity.id] = entity
            .subscribe((entity, added, removed) => {
                this.onEntityUpdate(entity, added, removed);
                this.indexEntity(entity);
            });

        this.indexEntity(entity);
    }

    /**
     * Remove an entity from this world
     *
     * @param idOrInstance
     */
    public removeEntity(idOrInstance: number | Entity) {
        let entity: Entity = idOrInstance as Entity;
        if (typeof idOrInstance === 'number') {
            entity = this.getEntity(idOrInstance) as Entity;
        }

        if (!entity) {
            return;
        }

        const idx = this.entities.indexOf(entity);
        if (idx >= 0) {
            this.entities.splice(idx, 1);
        }

        // Remove subscription, if any
        if (this.entitySubscription[entity.id]) {
            this.entitySubscription[entity.id]();
        }

        // Invoke system exit
        let systems = this.entitySystems[entity.id];
        if (systems) {
            systems.forEach(system => {
                if (system.exit) {
                    system.exit(entity as Entity);
                }
            });
        }

        // Remove associative indexes
        delete this.entitySystems[entity.id];
        delete this.entitySystemLastUpdate[entity.id];
    }

    /**
     * Add the system in this world
     *
     * @param system
     */
    public addSystem(system: System) {
        if (!system) {
            return;
        }

        if (this.systems.indexOf(system) >= 0) {
            return;
        }

        this.systems.push(system);

        // Indexes entities
        this.entities.forEach(entity => {
            this.indexEntity(entity, system);
        });

        // Invokes system enter
        this.entities.forEach(entity => {
            if (entity.active) {
                let systems = this.entitySystems[entity.id];
                if (systems && systems.indexOf(system) >= 0) {
                    if (system.enter) {
                        system.enter(entity);
                    }
                }
            }
        });
    }

    /**
     * Remove the system from this world
     *
     * @param system
     */
    public removeSystem(system: System) {
        if (!system) {
            return;
        }

        const idx = this.systems.indexOf(system);
        if (idx >= 0) {
            // Invoke system exit
            this.entities.forEach(entity => {
                if (entity.active) {
                    let systems = this.entitySystems[entity.id];
                    if (systems && systems.indexOf(system) >= 0) {
                        if (system.exit) {
                            system.exit(entity);
                        }
                    }
                }
            });

            this.systems.splice(idx, 1);

            // Indexes entities
            this.entities.forEach(entity => {
                this.indexEntity(entity, system);
            });
        }
    }

    /**
     * Invokes the "update" method of the systems in this world.
     */
    public update() {
        let now = NOW();

        this.entities.forEach(entity => {
            if (!entity.active) {
                // Entidade inativa
                return this.removeEntity(entity);
            }

            let systems = this.entitySystems[entity.id];
            if (!systems) {
                return;
            }

            const entityLastUpdates = this.entitySystemLastUpdate[entity.id];
            let elapsed, interval;

            systems.forEach(system => {
                if (system.update) {

                    elapsed = now - entityLastUpdates[system.id];

                    // Limit FPS
                    if (system.frequence > 0) {
                        interval = 1000 / system.frequence;
                        if (elapsed < interval) {
                            return;
                        }

                        // adjust for fpsInterval not being a multiple of RAF's interval (16.7ms)
                        entityLastUpdates[system.id] = now - (elapsed % interval);
                    } else {
                        entityLastUpdates[system.id] = now;
                    }

                    system.update(now, elapsed, entity);
                }
            });
        });
    }

    /**
     * When an entity receives or loses components, invoking the change method of the systems
     *
     * @param entity
     */
    private onEntityUpdate(entity: Entity, added: Component<any>[], removed: Component<any>[]) {
        if (!this.entitySystems[entity.id]) {
            return;
        }


        const toNotify: System[] = this.entitySystems[entity.id].slice(0);

        for (var idx = toNotify.length - 1; idx >= 0; idx--) {
            let system = toNotify[idx];

            let update = false;

            // System is listening to updates on entity?
            if (system.change) {
                let systemComponents = system.getComponents();

                // Listen to all systems
                if (systemComponents.indexOf(-1) >= 0) {
                    update = true;
                    break;
                }

                for (var a = 0, l = added.length; a < l; a++) {
                    if (systemComponents.indexOf(added[a].type) >= 0) {
                        update = true;
                        break;
                    }
                }
                if (!update) {
                    for (var a = 0, l = removed.length; a < l; a++) {
                        if (systemComponents.indexOf(removed[a].type) >= 0) {
                            update = true;
                            break;
                        }
                    }
                }
            }

            if (!update) {
                toNotify.splice(idx, 1);
            }
        }

        // Notify systems
        toNotify.forEach(system => {
            (system.change as any)(entity, added, removed);
        });
    }

    private indexEntitySystem = (entity: Entity, entityComponentIDs: number[], system: System) => {
        const idx = this.entitySystems[entity.id].indexOf(system);

        // Sistema não existe neste mundo, remove indexação
        if (this.systems.indexOf(system) < 0) {
            if (idx >= 0) {
                this.entitySystems[entity.id].splice(idx, 1);
                delete this.entitySystemLastUpdate[entity.id][system.id];
            }
            return;
        }

        const systemComponentIDs = system.getComponents();

        for (var a = 0, l = systemComponentIDs.length; a < l; a++) {
            if (entityComponentIDs.indexOf(systemComponentIDs[a]) < 0) {
                // remove
                if (idx >= 0) {
                    // Informs the system of relationship removal
                    if (system.exit) {
                        system.exit(entity);
                    }
                    this.entitySystems[entity.id].splice(idx, 1);
                    delete this.entitySystemLastUpdate[entity.id][system.id];
                }
                return
            }
        }

        // Entity has all the components this system needs
        if (idx < 0) {
            this.entitySystems[entity.id].push(system);
            this.entitySystemLastUpdate[entity.id][system.id] = NOW();

            // Informs the system about the new relationship
            if (system.enter) {
                system.enter(entity);
            }
        }
    };

    /**
     * Indexes an entity
     *
     * @param entity
     */
    private indexEntity(entity: Entity, system?: System) {

        if (!this.entitySystems[entity.id]) {
            this.entitySystems[entity.id] = [];
        }

        // -1 = All components. Allows a system to receive updates from all entities in the world.
        const entityComponentIDs: number[] = [-1].concat(
            Object.keys((entity as any).components).map(v => Number.parseInt(v, 10))
        );

        if (system) {
            // Index entity for a specific system
            this.indexEntitySystem(entity, entityComponentIDs, system);

        } else {
            // Indexes the entire entity
            this.systems.forEach((system) => {
                this.indexEntitySystem(entity, entityComponentIDs, system);
            });
        }
    }
}

