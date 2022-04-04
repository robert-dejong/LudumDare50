import { Sprites } from "../sprites/sprites";
import { Ingredient } from "./ingredient";

export class Ingredients {
    public static hamburger = new Ingredient('Hamburger', Sprites.hamburger, true, 900);
    public static burgerTop = new Ingredient('Burger top', Sprites.burgerTop, null, 550);
    public static burgerBottom = new Ingredient('Burger bottom', Sprites.burgerBottom, null, 550);
    public static cheese = new Ingredient('Cheese', Sprites.cheese, false);
    public static egg = new Ingredient('Fried egg', Sprites.egg, true, 700);
    public static lettuce = new Ingredient('Lettuce', Sprites.lettuce, false, 0, -10, -5);
    public static onion = new Ingredient('Onion', Sprites.onion, null, 700, 10, 5);
    public static tomato = new Ingredient('Tomato', Sprites.tomato, false, 0, -7, 10);

    public static getIngredients(): Array<Ingredient> {
        return [ 
            this.burgerBottom, 
            this.burgerTop, 
            this.hamburger, 
            this.egg, 
            this.onion, 
            this.cheese, 
            this.lettuce, 
            this.tomato
        ];
    }
}