import { Offence } from "./offence";

export class Offences {
    public static rawBurgerAdded = new Offence('That burger is so raw you can still hear it mooing!', 17);
    public static rawEggAdded = new Offence('Are you really cracking open a raw egg on that burger?', 17);
    public static wrongIngredientAdded = new Offence('The customer doesn\'t want that on their burger!', 8);
    public static ingredientAlreadyAdded = new Offence('You already put that on the burger! That stuff costs money you know!', 7);
    public static addBurgerBottomFirst = new Offence('Don\'t you think you should start with the bottom of the burger before adding toppings?', 7);
    public static addBurgerTopLast = new Offence('What is your plan here? Add the top of the burger and then pour the remaining ingredients on top of it?', 7);
    public static nonCookableIngredientCooked = new Offence('What is wrong with you? Who on earth grills that!', 10);
    public static ingredientBurned = new Offence('You burned that {name}! You have one job and you can\'t even do that!', 10);
    public static orderOvertime = new Offence('You took so long on an order the customer left! Pull yourself together or you\'re fired!', 15);
    public static orderOverflow = new Offence('What are you doing back there!? Orders are overflowing!', 8);
    public static orderOverflowContinue = new Offence('', 4);
}