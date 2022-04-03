import { config } from "../config";
import { Sprite } from "./sprite";

export class Sprites {
    public static game = Sprites.loadImage('game.png');
    public static plate = Sprites.loadImage('plate.png');

    public static hamburger = Sprites.loadImage('hamburger.png');
    public static burgerTop = Sprites.loadImage('burger_top.png');
    public static burgerBottom = Sprites.loadImage('burger_bottom.png');
    public static cheese = Sprites.loadImage('cheese.png');
    public static egg = Sprites.loadImage('egg.png');
    public static lettuce = Sprites.loadImage('lettuce.png');
    public static onion = Sprites.loadImage('onion.png');
    public static tomato = Sprites.loadImage('tomato.png');
    public static check = Sprites.loadImage('check.png');
    public static dialogue = Sprites.loadImage('dialogue.png');
    public static button = Sprites.loadImage('button.png');

    private static loadImage(image: string): Sprite {
        let sprite = new Sprite(`${config.imageBasePath}/${image}`);

        return sprite;
    }
}