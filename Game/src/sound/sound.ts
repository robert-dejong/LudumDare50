import { Settings } from "../settings";

export class Sound {
    private clip: HTMLAudioElement;
    private loaded: boolean;

    constructor(path: string) {
        this.clip = new Audio(path);
        
        this.clip.oncanplay = () => {
            this.loaded = true;
        }
    }

    public play(): void {
        if (!this.loaded || !Settings.sound()) return;
        
        this.clip.play();
    }
}