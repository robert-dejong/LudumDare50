import { Offence } from "./offence";

export class Offences {
    public static rawBurgerAdded = new Offence('That burger is so raw you can still hear it mooing!', 500);
    public static rawEggAdded = new Offence('Did you really just crack open a raw egg on that burger?', 5);
    public static wrongIngredientAdded = new Offence('The customer doesn\'t want that on their burger!', 2);
    public static ingredientAlreadyAdded = new Offence('You already put that on the burger! That stuff costs money you know!', 2);
    public static addBurgerBottomFirst = new Offence('Don\'t you think you should start with the bottom of the burger before adding toppings?', 1);
    public static addBurgerTopLast = new Offence('What is your plan here? Add the top of the burger and then pour the remaining ingredients on top of it?', 1);
    public static nonCookableIngredientCooked = new Offence('What is wrong with you? Who on earth grills that!', 5);
    public static ingredientBurned = new Offence('You burned that {name}! You have ONE job and you can\'t even do that!', 5);
    public static orderOverflow = new Offence('What are you doing back there!? Orders are overflowing!', 3);
    public static orderOverflowContinue = new Offence('', 2);
}