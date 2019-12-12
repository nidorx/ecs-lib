/**
 * From: http://learningthreejs.com/data/THREEx/THREEx.KeyboardState.js
 */
class KeyboardState {

    static MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];

    static ALIAS: {
        [key: string]: number
    } = {
        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40,
        'space': 32,
        'pageup': 33,
        'pagedown': 34,
        'tab': 9
    };

    private keyCodes: {
        [key: number]: boolean
    } = {};

    private modifiers: {
        [key: string]: boolean
    } = {};

    private onKeyDown = (event: KeyboardEvent) => {
        this.onKeyChange(event, true)
    };

    private onKeyUp = (event: KeyboardEvent) => {
        this.onKeyChange(event, false);
    };

    private onKeyChange = (event: KeyboardEvent, pressed: boolean) => {
        var keyCode = event.keyCode;

        this.keyCodes[keyCode] = pressed;

        // update this.modifiers
        this.modifiers['alt'] = event.altKey;
        this.modifiers['meta'] = event.metaKey;
        this.modifiers['ctrl'] = event.ctrlKey;
        this.modifiers['shift'] = event.shiftKey;
    };

    constructor() {
        // bind keyEvents
        document.addEventListener("keydown", this.onKeyDown, false);
        document.addEventListener("keyup", this.onKeyUp, false);

        (window as any).joypadKeyDown = (key: number) => {
            this.onKeyDown({
                keyCode: KeyboardState.ALIAS[key],
                altKey: false,
                metaKey: false,
                ctrlKey: false,
                shiftKey: false
            } as any);
        };

        (window as any).joypadKeyUp = (key: string) => {
            this.onKeyUp({
                keyCode: KeyboardState.ALIAS[key],
                altKey: false,
                metaKey: false,
                ctrlKey: false,
                shiftKey: false
            } as any);
        };
    }

    pressed(keyDesc: string) {

        var keys = keyDesc.split("+");
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var pressed;
            if (KeyboardState.MODIFIERS.indexOf(key) !== -1) {
                pressed = this.modifiers[key];
            } else if (Object.keys(KeyboardState.ALIAS).indexOf(key) != -1) {
                pressed = this.keyCodes[KeyboardState.ALIAS[key]];
            } else {
                pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)]
            }
            if (!pressed) return false;
        }

        return true;
    }
}

export default new KeyboardState();
