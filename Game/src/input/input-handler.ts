import { Screen } from '../core/screen';
import { Input } from './input.enum';

export class InputHandler {
    private keysPressed: Array<boolean>;
    public mousePressed: boolean;
    public mouseX: number;
    public mouseY: number;
    public clickX: number;
    public clickY: number;

    constructor(private screen: Screen) {
        this.keysPressed = new Array<boolean>();

        this.keyEvent('keydown');
        this.keyEvent('keyup');

        this.mouseEvent('mousedown');
        this.mouseEvent('mousemove');
        this.mouseEvent('mouseup');
        this.mouseEvent('click');
    }

    private keyEvent(type: 'keydown' | 'keyup'): void {
        const pressed = type == 'keydown';

        window.addEventListener(type, (e: KeyboardEvent) => {
            //console.log("Pressing key: " + e.key);
            // e.preventDefault();
            this.keysPressed[e.key] = pressed;
        });
    }

    private mouseEvent(type: 'mousedown' | 'mouseup' | 'mousemove' | 'click'): void {
        this.screen.canvas.addEventListener(type, (e: MouseEvent) => {
            if (e.type === 'click') {
                this.clickX = e.offsetX;
                this.clickY = e.offsetY;
                return;
            }

            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;

            //console.log(`MouseX: ${this.mouseX}, MouseY: ${this.mouseY}`);
            
            if (e.type === 'mousemove') return;

            this.mousePressed = e.type === 'mousedown';
        });
    }

    public isPressingKey(key: Input) {
        return this.keysPressed[key];
    }

    public releaseKey(key: Input) {
        this.keysPressed[key] = false;
    }

    public resetClick(): void {
        this.clickX = -1;
        this.clickY = -1;
    }
}