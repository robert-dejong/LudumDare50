import { config } from "../config";
import { Sound } from "./sound";

export class Sounds {
    public static test = Sounds.loadSound('hurt.wav');

    private static loadSound(sound: string): Sound {
        return new Sound(`${config.soundBasePath}/${sound}`);
    }
}