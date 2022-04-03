import { Sprites } from "../sprites/sprites";
import { Ingredient } from "./ingredient";

export class Ingredients {
    public static hamburger = new Ingredient('Hamburger', Sprites.hamburger, true, 1000);
    public static burgerTop = new Ingredient('Burger top', Sprites.burgerTop, null, 600);
    public static burgerBottom = new Ingredient('Burger bottom', Sprites.burgerBottom, null, 600);
    public static cheese = new Ingredient('Cheese', Sprites.cheese, false);
    public static egg = new Ingredient('Fried egg', Sprites.egg, true, 700);
    public static lettuce = new Ingredient('Lettuce', Sprites.lettuce, false);
    public static onion = new Ingredient('Onion', Sprites.onion, null, 700);
    public static tomato = new Ingredient('Tomato', Sprites.tomato, false);

    public static getIngredients(): Array<Ingredient> {
        return [ 
            this.burgerTop, 
            this.burgerBottom, 
            this.hamburger, 
            this.cheese, this.egg, 
            this.onion, 
            this.lettuce, 
            this.tomato
        ];
    }
}