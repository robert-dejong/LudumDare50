export class Sprite {
    public loaded: boolean;
    public width: number;
    public height: number;
    public image: HTMLImageElement;

    constructor(path: string) {
        this.image = new Image();
        this.image.src = path;

        this.image.onload = () => {
            this.width = this.image.width;
            this.height = this.image.height;
            this.loaded = true;
        }
    }
}