import {describe} from "mocha";
import ECS, {Component, Entity, System} from "../src";
import {expect} from "chai";


const ComponentA = Component.register<number>();

const ComponentB = Component.register<number>();

const ComponentC = Component.register<number>();

class Entt extends Entity {

}

class SysCompA extends System {
    constructor() {
        super([ComponentA.type]);
    }
}


describe("ECS", () => {

    describe("Components", () => {

        it("must be unique", () => {
            let world = new ECS();

            expect(ComponentA.type).to.not.equal(ComponentB.type);

            let compA = new ComponentA(100);
            let compA2 = new ComponentA(100);
            let compB = new ComponentB(200);

            expect(ComponentA.type).to.eql(compA.type);
            expect(ComponentA.type).to.eql(compA2.type);
            expect(compA2.type).to.eql(compA2.type);

            expect(ComponentB.type).to.eql(compB.type);


            expect(compA.data).to.eql(100);
            expect(compB.data).to.eql(200);
        });
    });

    describe("Entity", () => {

        it("must have unique identifiers", () => {
            let world = new ECS();

            let enttA = new Entt();
            let enttB = new Entt();
            expect(enttA.id).to.not.equal(enttB.id);
            expect(enttA.id).to.eql(enttB.id - 1);
        });
    });


    describe("System", () => {

        it("must add systems at runtime", () => {

            let sys1 = new SysCompA();

            let world = new ECS([sys1]);

            expect((world as any).systems.length).to.eql(1);

            let sys2 = new SysCompA();
            world.addSystem(sys2);
            expect((world as any).systems).to.eql([sys1, sys2]);

            // Must ignore undefined
            world.addSystem(undefined as any);
            expect((world as any).systems).to.eql([sys1, sys2]);

            // Must ignore if exists
            world.addSystem(sys2);
            expect((world as any).systems).to.eql([sys1, sys2]);
        });

        it("must remove systems at runtime", () => {

            let sys1 = new SysCompA();

            let world = new ECS([sys1]);

            expect((world as any).systems.length).to.eql(1);

            let sys2 = new SysCompA();
            world.addSystem(sys2);

            expect((world as any).systems).to.eql([sys1, sys2]);

            // Must ignore undefined
            world.removeSystem(undefined as any);
            expect((world as any).systems).to.eql([sys1, sys2]);

            world.removeSystem(sys1);
            expect((world as any).systems).to.eql([sys2]);

            world.removeSystem(sys2);
            expect((world as any).systems).to.eql([]);
        });


        it("must be invoked in the expected order", () => {

            let callOrder = 1;

            let enterCalled = 0;
            let changedCalled = 0;
            let beforeUpdateAllCalled = 0;
            let updateCalled = 0;
            let afterUpdateAllCalled = 0;
            let exitCalled = 0;

            function clear() {
                callOrder = 1;
                enterCalled = 0;
                changedCalled = 0;
                beforeUpdateAllCalled = 0;
                updateCalled = 0;
                afterUpdateAllCalled = 0;
                exitCalled = 0;
            }

            class Sys extends System {
                constructor(type: number) {
                    super([type]);
                }

                beforeUpdateAll(time: number): void {
                    beforeUpdateAllCalled = callOrder++;
                }

                update(time: number, delta: number, entity: Entity): void {
                    updateCalled = callOrder++;
                }

                afterUpdateAll(time: number, entities: Entity[]): void {
                    afterUpdateAllCalled = callOrder++;
                }

                enter(entity: Entity): void {
                    enterCalled = callOrder++;
                }

                exit(entity: Entity): void {
                    exitCalled = callOrder++;
                }

                change(entity: Entity, added: Component<any>[], removed: Component<any>[]): void {
                    changedCalled = callOrder++;
                }
            }

            let calledSystem = new Sys(ComponentA.type);

            // Control, should never invoke methods of this instance
            let notCalledSystem = new Sys(ComponentC.type);

            let entity = new Entt();
            let entity2 = new Entt();

            let world = new ECS([calledSystem, notCalledSystem]);

            // init
            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(0);


            // update without entities match, do
            world.update();

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(0);

            // does nothing, does not have the expected features of the system
            world.addEntity(entity);

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(0);

            // does nothing, system execution only occurs in the future
            let componentA = new ComponentA(100);
            entity.add(componentA);

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(0);

            // expect enter
            (global as any).setImmediateExec();

            expect(enterCalled).to.eql(1);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(0);
            clear();

            // do nothing, system is not interested in this kind of component
            let componentB = new ComponentB(100);
            entity.add(componentB);
            (global as any).setImmediateExec();

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(0);
            clear();


            // again, do nothing, system is not interested in this kind of component
            entity.remove(componentB);
            (global as any).setImmediateExec();

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(0);
            clear();

            // expect change
            let componentA2 = new ComponentA(100);
            entity.add(componentA2);
            (global as any).setImmediateExec();

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(1);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(0);
            clear();

            // again, expect change
            entity.remove(componentA2);
            (global as any).setImmediateExec();

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(1);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(0);
            clear();

            // expect update, before and after
            world.update();

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(1);
            expect(updateCalled).to.eql(2);
            expect(afterUpdateAllCalled).to.eql(3);
            expect(exitCalled).to.eql(0);

            // again
            world.update();

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(4);
            expect(updateCalled).to.eql(5);
            expect(afterUpdateAllCalled).to.eql(6);
            expect(exitCalled).to.eql(0);
            clear();


            // on remove entity
            world.removeEntity(entity);

            expect(enterCalled).to.eql(0);
            expect(changedCalled).to.eql(0);
            expect(beforeUpdateAllCalled).to.eql(0);
            expect(updateCalled).to.eql(0);
            expect(afterUpdateAllCalled).to.eql(0);
            expect(exitCalled).to.eql(1);

        });
    });

    it("must create without systems", () => {
        let world = new ECS();

        expect((world as any).systems).to.eql([]);
    });

    it("must create with systems", () => {

        class Sys extends System {
            constructor() {
                super([-1]);
            }
        }

        let world = new ECS([new Sys]);

        expect((world as any).systems.length).to.eql(1);
    });
});
