export class Settings {
    public static sound = (): boolean => {
        return window['playSound'];
    };
}