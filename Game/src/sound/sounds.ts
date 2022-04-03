import { config } from "../config";
import { Sound } from "./sound";

export class Sounds {
    public static cook = Sounds.loadSound('cook.wav');
    public static ingredientAdded = Sounds.loadSound('ingredient_added.wav');
    public static orderCompleted = Sounds.loadSound('order_completed.wav');
    public static offence = Sounds.loadSound('offence.wav');

    private static loadSound(sound: string): Sound {
        return new Sound(`${config.soundBasePath}/${sound}`);
    }
}