import { DialogueManager } from "./dialogue/dialogue-manager";

export class PlayerStats {
    public ordersFinished: number;
    public score: number;
    public fireMeter: number;

    constructor(private dialogueManager: DialogueManager) {
        this.ordersFinished = 0;
        this.score = 0;
        this.fireMeter = 100;
    }

    public lowerFireMeter(amount: number): void {
        this.fireMeter -= amount;

        if (this.fireMeter <= 0) {
            this.dialogueManager.showDialogue('I HAVE HAD ENOUGH OF YOU! GET OUT OF MY KITCHEN YOU ARE ABSOLUTELY USELESS!');
        }
    }

    public upFireMeter(amount: number): void {
        this.fireMeter += amount;
    }

    public addScore(score: number): void {
        this.score += score;
    }

    public addFinishedOrder(): void {
        this.ordersFinished++;
        this.upFireMeter(3);
    }
}