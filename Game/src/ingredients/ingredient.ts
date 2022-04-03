import { Sprite } from "../sprites/sprite";

export class Ingredient {
    public name: string;
    public sprite: Sprite;
    public shouldCook: boolean;
    public cookDuration: number;

    constructor(name: string, sprite: Sprite, shouldCook: boolean, cookDuration: number = 0) {
        this.name = name;
        this.sprite = sprite;
        this.shouldCook = shouldCook;
        this.cookDuration = cookDuration;
    }
}