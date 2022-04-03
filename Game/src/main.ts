import { Screen } from './core/screen';
import { InputHandler } from './input/input-handler';
import { WorldManager } from './world/world-manager';
import { Input } from './input/input.enum';
import { OrderManager } from './orders/order-manager';
import { PlayerStats } from './player-stats';
import { DialogueManager } from './dialogue/dialogue-manager';

window['gamePaused'] = true;
window['playSound'] = true;

class Main {
    private inputHandler: InputHandler;
    private screen: Screen;
    private playerStats: PlayerStats;
    private orderManager: OrderManager;
    private worldManager: WorldManager;
    private dialogueManager: DialogueManager;

    private lastFrameTimeMs = 0;
    private timestep = 1000 / 60;
    private delta = 0;
    private frames = 0;
    private last = new Date().getTime();
    private ticks = 0;

    constructor() {
        this.dialogueManager = new DialogueManager();
        this.playerStats = new PlayerStats(this.dialogueManager);
        this.orderManager = new OrderManager(this.playerStats);
        this.screen = new Screen();
        this.inputHandler = new InputHandler(this.screen);
        this.worldManager = new WorldManager(this.orderManager, this.inputHandler, this.dialogueManager, this.playerStats);
    }

    public startGame(): void {
        this.tick(0);
    }

    private tick(timestamp: number): void {
        this.delta += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;
        
        while (this.delta >= this.timestep) {
            this.delta -= this.timestep;
    
            if (this.inputHandler.isPressingKey(Input.Pause)) {
                this.inputHandler.releaseKey(Input.Pause);
                window['gamePaused'] = !window['gamePaused'];
            }

            if (!window['gamePaused']) {
                this.dialogueManager.tick(this.screen, this.inputHandler, this.playerStats);

                if (!this.dialogueManager.isShowingDialogue) {
                    this.worldManager.tick(this.screen);
                }
            }

            this.ticks++;
        }
    
        this.render();
        this.frames++;
    
        let current = new Date().getTime();
        if (current - this.last >= 1000) {
            this.last = current;
            console.log(`Ticks: ${this.ticks}, FPS: ${this.frames}`);
            this.frames = 0;
            this.ticks = 0;
        }
    
        requestAnimationFrame((timestamp) => this.tick(timestamp));
    }

    private render(): void {
        this.worldManager.render(this.screen);

        this.screen.renderText(`Score: ${this.playerStats.score}`, this.screen.width - 100, this.screen.height - 67, 16, '#ffffff', undefined, 600);
        this.renderFireMeter();

        this.dialogueManager.render(this.screen, this.playerStats);

        if (this.playerStats.fireMeter <= 0) {
            this.screen.renderText(`Your score: ${this.playerStats.score}, completed orders: ${this.playerStats.ordersFinished}`, (this.screen.width / 2) - 150, (this.screen.height / 2) - 75, 18, '#ffffff', undefined, 600);
        }

        if(window['gamePaused']) {
            let pauseText = 'Game is paused';
            let width = pauseText.length * 2.4;
            this.screen.renderText(pauseText, width, (this.screen.height / 2));
        }
    }

    private renderFireMeter(): void {
        let x = this.screen.width - 330;
        let y = this.screen.height - 50;
        let width = 310;
        let height = 35;

        this.screen.renderText('Fired-o-meter:', x, y - 17, 16, '#ffffff', undefined, 600); 

        this.screen.renderRectangle(x, y, width, height, '#ffffff');

        x += 2;
        y += 2;
        width -= 4;
        height -= 4;

        this.screen.renderRectangle(x, y, width, height, '#d30000');

        width *= (this.playerStats.fireMeter / 100);
        this.screen.renderRectangle(x, y, width, height, '#00a12a');
    }
}

const main = new Main();
main.startGame();