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

let SEQ_ENTITY = 1;

let SEQ_SYSTEM = 1;

let SEQ_COMPONENT = 1;


/**
 * Representação de uma entidade o ECS
 */
export abstract class Entity {

    public static sequence(): number {
        return SEQ_ENTITY++;
    }

    /**
     * Lista de interessados sobre a atualiação dos componentes
     */
    private subscriptions: Array<(entity: Entity) => void> = [];

    /**
     *
     */
    public id: number;

    /**
     * Informs that subscriptions have been triggered.
     */
    private queued = false;

    /**
     * Informa se a entidade está ativa
     */
    public active: boolean = true;

    /**
     * Componentes por tipo
     *
     * ATENÇÃO! Apesar de a lista de componentes ser publica, não fazer modificação na mesma, utilizar os metodos add e
     * remove para tal
     */
    public components: {
        [key: number]: Component<any>[]
    } = {};

    constructor() {
        this.id = Entity.sequence();
    }

    /**
     *
     */
    private dispatch() {
        if (!this.queued) {
            this.queued = true;
            // Informa aos interessados sobre a atualização
            requestAnimationFrame(() => {
                this.queued = false;
                this.subscriptions.forEach(cb => cb(this));
            });
        }
    }

    /**
     * Permite aos interessados receber informação quando a lista de componentes dessa entidade receber atualização
     *
     * @param handler
     */
    public subscribe(handler: () => void): () => Entity {
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
     * Adiciona um componente à entidade
     *
     * @param component
     */
    public add(component: Component<any>) {
        const type = component.type;
        if (!this.components[type]) {
            this.components[type] = [];
        }

        this.components[type].push(component);

        // Informa aos interessados sobre a atualização
        this.dispatch();
    }

    /**
     * Remove a referencia de um componente dessa entidade
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
        }

        // Informa aos interessados sobre a atualização
        this.dispatch();
    }
}

/**
 * Force typing
 */
export type ComponentClassType<P> = (new (data: P) => Component<P>) & {

    type: number;

    allFrom(entity: Entity): Component<P>[];

    oneFrom(entity: Entity): Component<P>;
}

/**
 * Informações sobre um componente
 */
export class Component<T> {

    /**
     * Registra uma nova classe de componente
     */
    public static register<P>(): ComponentClassType<P> {
        const typeID = SEQ_COMPONENT++;

        class ComponentImpl extends Component<P> {

            /**
             * Static reference to type
             */
            static type = typeID;

            /**
             * Get all instances of this component from entity
             *
             * @param entity
             */
            static allFrom(entity: Entity): ComponentImpl[] {
                let components: ComponentImpl[] = entity.components[typeID];
                return components || [];
            }

            /**
             * Get one instance of this component from entity
             *
             * @param entity
             */
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

    /**
     * Obtem o id do tipo do componente
     */
    public type: number;

    /**
     * Obtem o id do tipo do componente
     */
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
     * @param entity Identificador da entidade
     * @param components De uma entidade
     */
    public update?(time: number, delta: number, entity: Entity): void;

    /**
     * Invoked when:
     * a) An entity with the characteristics (components) expected by this system is added in the world;
     * b) This system is added in the world and this world has one or more entities with the characteristics expected by
     * this system;
     * c) An existing entity in the same world receives a new component at runtime and all of its new components match
     * the standard expected by this system.
     *
     * @param entity
     * @param components
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
     * @param components
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
 * A propria definição do ECS. Também chamada de Admin ou Manager em outras implementações
 */
export default class ECS {

    public static System = System;

    public static Entity = Entity;

    public static Component = Component;

    /**
     * Todos os Systems existentes nesse mundo
     */
    private systems: System[] = [];

    /**
     * Todas as entidades existentes neste mundo
     */
    private entities: Entity[] = [];

    /**
     * Indexa os sistemas que devem ser executados para cada entidade
     */
    private entitySystems: { [key: number]: System[] } = {};

    /**
     * Registra o último instante que um sistema foi executado neste mundo para uma entidade
     */
    private entitySystemLastUpdate: { [key: number]: { [key: number]: number } } = {};

    /**
     * Guarda as subscrições realizadas para entidades
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
     * Obtém uma entidade por id
     *
     * @param id
     */
    public getEntity(id: number): Entity | undefined {
        return this.entities.find(entity => entity.id === id);
    }

    /**
     * Adiciona uma entidade nesse mundo
     *
     * @param entity
     */
    public addEntity(entity: Entity) {
        if (!entity) {
            return;
        }

        if (this.entities.indexOf(entity) < 0) {
            this.entities.push(entity);
            this.entitySystemLastUpdate[entity.id] = {};

            // Remove a subscrição, se existir
            if (this.entitySubscription[entity.id]) {
                this.entitySubscription[entity.id]();
            }

            // Adiciona nova subscrição
            this.entitySubscription[entity.id] = entity.subscribe(() => {
                this.indexEntity(entity);
            });
        }

        this.indexEntity(entity);
    }


    /**
     * Remove uma entidade desse mundo
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

        // Remove a subscrição, se existir
        if (this.entitySubscription[entity.id]) {
            this.entitySubscription[entity.id]();
        }

        // Invoca "exit" dos sistemas
        let systems = this.entitySystems[entity.id];
        if (systems) {
            systems.forEach(system => {
                if (system.exit) {
                    system.exit(entity as Entity);
                }
            });
        }

        // Remove índices associativos
        delete this.entitySystems[entity.id];
        delete this.entitySystemLastUpdate[entity.id];
    }

    /**
     * Adiciona o sistema nesse mundo
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

        // Reindexa entidades
        this.entities.forEach(entity => {
            this.indexEntity(entity, system);
        });

        // Invoca "enter" do sistema
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
     * Remove o sistema desse mundo
     *
     * @param system
     */
    public removeSystem(system: System) {
        if (!system) {
            return;
        }

        const idx = this.systems.indexOf(system);
        if (idx >= 0) {
            // Invoca "exit" do sistema
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

            // Reindexa entidades
            this.entities.forEach(entity => {
                this.indexEntity(entity, system);
            });
        }
    }

    /**
     * Realiza a atualização dos sistemas desse mundo
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
                    // Informa ao sistema sobre a remoção do relacionamento
                    if (system.exit) {
                        system.exit(entity);
                    }
                    this.entitySystems[entity.id].splice(idx, 1);
                    delete this.entitySystemLastUpdate[entity.id][system.id];
                }
                return
            }
        }

        // Entidade possui todos os componentes que esse sistema precisa
        if (idx < 0) {
            this.entitySystems[entity.id].push(system);
            this.entitySystemLastUpdate[entity.id][system.id] = NOW();

            // Informa ao sistema sobre o novo relacionamento
            if (system.enter) {
                system.enter(entity);
            }
        }
    };


    /**
     * Faz a indexação de uma entidade
     *
     * @param entity
     */
    private indexEntity(entity: Entity, system?: System) {

        if (!this.entitySystems[entity.id]) {
            this.entitySystems[entity.id] = [];
        }

        // -1 = All components. Allows a system to receive updates from all entities in the world.
        const entityComponentIDs: number[] = [-1].concat(
            Object.keys(entity.components).map(v => Number.parseInt(v, 10))
        );

        if (system) {
            // Indexa a entidade para um sistema específico
            this.indexEntitySystem(entity, entityComponentIDs, system);

        } else {
            // Reindexa toda a entidade
            this.systems.forEach((system) => {
                this.indexEntitySystem(entity, entityComponentIDs, system);
            });
        }
    }
}

