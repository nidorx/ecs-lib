import {GUI, GUIController} from "dat.gui";


export class GUISessionController {

    initSession: (name: string) => void = () => {
    }
}

export default class GUISession {

    private gui: GUI;

    private sessions: Array<GUIController | GUI> = [];

    constructor(gui: GUI, group: string) {
        // Cria um grupo específico para essa sessão
        this.gui = gui.addFolder(group);

        // Já exibe o seu conteúdo
        this.gui.open();
    }

    /**
     * Salva uma controller na sessão atual
     *
     * @param instance
     */
    private save(instance: GUIController | GUI): GUIController | GUI {
        if (this.sessions.indexOf(instance) < 0) {
            this.sessions.push(instance);
        }
        return instance;
    }

    destroy() {
        this.sessions.forEach(comp => {
            if ((comp as GUI).__folders || (comp as GUI).__controllers) {
                this.removeFolder(comp as GUI);
            } else {
                this.remove(comp as GUIController);
            }
        });
        this.sessions = [];

        // Remove o próprio grupo
        this.gui.parent.removeFolder(this.gui);
    };

    add(target: Object, propName: string, itemsOrMin?: number | boolean | string[] | Object, max?: number, step?: number): GUIController {
        return this.save(this.gui.add(target, propName, itemsOrMin as any, max, step)) as GUIController;
    };

    addColor(target: Object, propName: string): GUIController {
        return this.save(this.gui.addColor(target, propName)) as GUIController;
    };

    addFolder(propName: string): GUI {
        return this.save(this.gui.addFolder(propName)) as GUI;
    };

    removeFolder(subFolder: GUI): void {
        this.gui.removeFolder(subFolder);
        var idx = this.sessions.indexOf(subFolder);
        if (idx >= 0) {
            this.sessions.splice(idx, 1);
        }
    };

    remove(controller: GUIController): void {
        this.gui.remove(controller);
        var idx = this.sessions.indexOf(controller);
        if (idx >= 0) {
            this.sessions.splice(idx, 1);
        }
    };


    // remember(target: Object, ...additionalTargets: Object[]): void;

    // listen(controller: GUIController): void;

    // updateDisplay(): void;
}
