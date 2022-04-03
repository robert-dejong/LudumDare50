import { OrderManager } from "./orders/order-manager";
import { PlayerStats } from "./player-stats";
import { WorldManager } from "./world/world-manager";

export class ResetGame {

    constructor(private playerStats: PlayerStats, private worldManager: WorldManager, private orderManager: OrderManager) {

    }

    public reset(): void {
        if (localStorage.getItem('highscore') != null) {
            const highscore = +localStorage.getItem('highscore');

            if (this.playerStats.score > highscore) {
                localStorage.setItem('highscore', `${this.playerStats.score}`);
            }
        } else {
            localStorage.setItem('highscore', `${this.playerStats.score}`);
        }
        
        this.playerStats.reset();
        this.worldManager.reset();
        this.orderManager.reset();
    }
}