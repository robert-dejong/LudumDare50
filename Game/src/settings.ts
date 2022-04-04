export class Settings {
    public static sound = (): boolean => {
        return window['playSound'];
    };
    public static easyMode = (): boolean => {
        return window['easyMode'];
    };
}