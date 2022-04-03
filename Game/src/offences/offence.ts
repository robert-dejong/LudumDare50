import { PlayerStats } from "../player-stats";

export class Offence {
    public text: string;
    public cost: number;

    constructor(text: string, cost: number) {
        this.text = text;
        this.cost = cost;
    }

    public apply(playerStats: PlayerStats): void {
        playerStats.lowerFireMeter(this.cost);
    }
}