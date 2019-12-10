let NOW: () => number = () => 0;

if (typeof window !== 'undefined' && window.performance) {
    NOW = window.performance.now.bind(window.performance);
} else {
    const start = Date.now();
    NOW = () => {
        return Date.now() - start;
    };
}

let SEQ_ENTITY = 1;

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
    private subscriptions: Array<() => void> = [];

    public id: number;

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
     * Permite aos interessados receber informação quando a lista de componentes dessa entidade receber atualização
     *
     * @param handler
     */
    public subscribe(handler: () => void): () => void {
        this.subscriptions.push(handler);

        return () => {
            const idx = this.subscriptions.indexOf(handler);
            if (idx >= 0) {
                this.subscriptions.splice(idx, 1);
            }
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
        requestAnimationFrame(() => {
            this.subscriptions.forEach(cb => cb());
        });
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
        requestAnimationFrame(() => {
            this.subscriptions.forEach(cb => cb());
        });
    }
}

/**
 * Force typing
 */
export type ComponentClassType<P> = (new (data: P) => Component<P>) & {

    type: number;

    allFrom(entity: Entity): ComponentClassType<P>[];

    oneFrom(entity: Entity): ComponentClassType<P>;
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
 * Representação de um sistema no ECS
 */
export class System {

    /**
     * Implementação deve informar quais tipo de componentes esse sistema opera sobre
     */
    public components: number[] = [];

    /**
     * Invocado durante atualização
     * @param entity Identificador da entidade
     * @param components De uma entidade
     */
    public update?(time: number, delta: number, entity: Entity): void;

    /**
     * Invocado sempre que uma entidade correspondente é adicionada no sistema, ou para todas as entidades existntes
     * quando o sistema é adicionado no mundo
     *
     * @param entity
     * @param components
     */
    public enter?(entity: Entity): void;

    /**
     * Invocado sempre que uma entidade correspondente é removida do sistema, ou para todas as entidades existntes
     * quando o sistema é removido do mundo
     *
     * @param entity
     * @param components
     */
    public exit?(entity: Entity): void;
}

/**
 * A propria definição do ECS. Também chamada de Admin ou Manager em outras implementações
 */
export default class ECS {

    public static Entity = Entity;

    public static Component = Component;

    public static System = System;

    private lastUpdate: number = NOW();

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
    private entitiesSystems: {
        [key: number]: System[]
    } = {};

    /**
     * Guarda as subscrições realizadas para entidades
     */
    private entitiesSubscriptions: {
        [key: number]: () => void
    } = {};

    constructor(systems?: System[]) {
        if (systems) {
            systems.forEach(system => {
                this.addSystem(system);
            })
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

            // Remove a subscrição, se existir
            if (this.entitiesSubscriptions[entity.id]) {
                this.entitiesSubscriptions[entity.id]();
            }

            // Adiciona nova subscrição
            this.entitiesSubscriptions[entity.id] = entity.subscribe(() => {
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
        if (this.entitiesSubscriptions[entity.id]) {
            this.entitiesSubscriptions[entity.id]();
        }

        // Invoca "exit" dos sistemas
        let systems = this.entitiesSystems[entity.id];
        if (systems) {
            systems.forEach(system => {
                if (system.exit) {
                    system.exit(entity as Entity);
                }
            });
        }

        // Remove índices associativos
        this.entitiesSystems[entity.id] = [];
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
            if (!entity.active) {
                // Entidade inativa
                return this.removeEntity(entity);
            }

            let systems = this.entitiesSystems[entity.id];
            if (systems && systems.indexOf(system) >= 0) {
                if (system.enter) {
                    system.enter(entity);
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
                if (!entity.active) {
                    // Entidade inativa
                    return this.removeEntity(entity);
                }

                let systems = this.entitiesSystems[entity.id];
                if (systems && systems.indexOf(system) >= 0) {
                    if (system.exit) {
                        system.exit(entity);
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
        let elapsed = now - this.lastUpdate;

        this.entities.forEach(entity => {
            if (!entity.active) {
                // Entidade inativa
                return this.removeEntity(entity);
            }

            let systems = this.entitiesSystems[entity.id];
            if (!systems) {
                return;
            }

            systems.forEach(system => {
                const components: {
                    [key: number]: Component<any>[]
                } = {};

                system.components.forEach(typeId => {
                    components[typeId] = entity.components[typeId];
                });

                if (system.update) {
                    system.update(now, elapsed, entity);
                }
            });
        });


        this.lastUpdate = now;
    }


    /**
     * Faz a indexação de uma entidade
     *
     * @param entity
     */
    private indexEntity(entity: Entity, system?: System) {

        if (!this.entitiesSystems[entity.id]) {
            this.entitiesSystems[entity.id] = [];
        }
        let entityComponents: number[] = Object.keys(entity.components).map(v => Number.parseInt(v, 10));

        const indexSystem = (system: System) => {

            const idx = this.entitiesSystems[entity.id].indexOf(system);

            // Sistema não existe neste mundo, remove indexação
            if (this.systems.indexOf(system) < 0) {
                if (idx >= 0) {
                    this.entitiesSystems[entity.id].splice(idx, 1);
                }
                return;
            }


            let systemComponents = system.components;

            for (var a = 0, l = systemComponents.length; a < l; a++) {
                if (entityComponents.indexOf(systemComponents[a]) < 0) {
                    // remove
                    if (idx >= 0) {
                        // Informa ao sistema sobre a remoção do relacionamento
                        if (system.exit) {
                            system.exit(entity);
                        }
                        this.entitiesSystems[entity.id].splice(idx, 1);
                    }
                    return
                }
            }

            // Entidade possui todos os componentes que esse sistema precisa
            if (idx < 0) {
                this.entitiesSystems[entity.id].push(system);

                // Informa ao sistema sobre o novo relacionamento
                if (system.enter) {
                    system.enter(entity);
                }
            }
        };

        if (system) {
            // Indexa a entidade para um sistema específico
            indexSystem(system);

        } else {
            // Reindexa toda a entidade
            this.systems.forEach(indexSystem);
        }
    }
}

