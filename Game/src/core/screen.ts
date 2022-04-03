import { config } from "../config";
import { Sprite } from "../sprites/sprite";

export class Screen {
    width: number;
    height: number;
    
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;

        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.context.scale(config.renderScale, config.renderScale);

        this.width = this.canvas.width / config.renderScale;
        this.height = this.canvas.height / config.renderScale;
    }

    public renderRectangle(x: number, y: number, width: number, height: number, color: string = '#000000', transparency: number = 1.0) {
        this.context.fillStyle = color;
        this.context.globalAlpha = transparency;
        this.context.fillRect(x, y, width, height);
        this.context.globalAlpha = 1.0;
    }

    public render(sprite: Sprite, x: number, y: number, scale: number = 1, maxHeight: number = undefined): void {
        if (sprite === undefined || !sprite.loaded) return;

        let width = sprite.width * scale;
        let height = sprite.height * scale;

        if (maxHeight !== undefined && sprite.height > maxHeight) {
            width *= (maxHeight / sprite.height);
            height = maxHeight;
        }
        
        this.context.drawImage(sprite.image, x, y, width, height);
    }

    public renderText(text: string, x: number, y: number, size: number = 8, color: string = '#ffffff', maxWidth: number = undefined, fontWeight: number = 400): void {
        this.context.fillStyle = color;
        this.context.font = `${fontWeight} ${size}px Arial`;

        if (maxWidth === undefined) {
            this.context.fillText(text, x, y);
            return;
        }
        
        const words = text.split(' ');
        let currentLine = '';
        let lineHeight = 0;

        words.forEach(word => {
            const line = `${currentLine}${currentLine.length !== 0 ? ' ' : ''}${word}`;

            if (this.context.measureText(line).width > maxWidth) {
                this.context.fillText(currentLine, x, y + lineHeight);
                currentLine = word;
                lineHeight += (size * 1.2);
                return;
            }

            currentLine = line;
        });

        if (currentLine.length > 0) {
            this.context.fillText(currentLine, x, y + lineHeight);
        }
    }
}