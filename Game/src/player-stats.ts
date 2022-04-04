import { config } from "./config";
import { DialogueManager } from "./dialogue/dialogue-manager";

export class PlayerStats {
    public ordersFinished: number;
    public score: number;
    public fireMeter: number;
    public level: number;
    public orderTime: number;
    private elapsedTicks: number;

    constructor(private dialogueManager: DialogueManager) {
        this.ordersFinished = 0;
        this.score = 0;
        this.fireMeter = 100;
        this.level = 0;
        this.elapsedTicks = 0;
        this.orderTime = config.order.defaultOrderTime;
    }

    public tick(): void {
        this.elapsedTicks++;

        if (this.elapsedTicks < config.increaseLevelTickCount) return;

        this.elapsedTicks = 0;
        this.level++;
        this.orderTime -= config.order.decreaseOrderCountPerLevel;

        if (this.orderTime < config.order.minimumOrderTime) this.orderTime = config.order.minimumOrderTime;
    }

    public lowerFireMeter(amount: number): void {
        this.fireMeter -= amount;

        if (this.fireMeter <= 0) {
            this.fireMeter = 0;
            this.dialogueManager.showDialogue('I HAVE HAD ENOUGH OF YOU! GET OUT OF MY KITCHEN! YOU ARE ABSOLUTELY USELESS!');
        }
    }

    public upFireMeter(amount: number): void {
        this.fireMeter += amount;

        if (this.fireMeter > 100) {
            this.fireMeter = 100;
        }
    }

    public addScore(score: number): void {
        this.score += score;
    }

    public addFinishedOrder(upFireMeter: number = 1): void {
        this.ordersFinished++;
        this.upFireMeter(upFireMeter);
    }

    public reset(): void {
        this.ordersFinished = 0;
        this.score = 0;
        this.fireMeter = 100;
        this.level = 0;
        this.elapsedTicks = 0;
        this.orderTime = config.order.defaultOrderTime;
    }
}