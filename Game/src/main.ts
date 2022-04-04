import { Screen } from './core/screen';
import { InputHandler } from './input/input-handler';
import { WorldManager } from './world/world-manager';
import { Input } from './input/input.enum';
import { OrderManager } from './orders/order-manager';
import { PlayerStats } from './player-stats';
import { DialogueManager } from './dialogue/dialogue-manager';
import { ResetGame } from './reset-game';
import { Settings } from './settings';
import { Sprites } from './sprites/sprites';

window['gamePaused'] = true;
window['playSound'] = true;
window['easyMode'] = false;

class Main {
    private inputHandler: InputHandler;
    private screen: Screen;
    private playerStats: PlayerStats;
    private orderManager: OrderManager;
    private worldManager: WorldManager;
    private dialogueManager: DialogueManager;
    private resetGame: ResetGame;

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
        this.resetGame = new ResetGame(this.playerStats, this.worldManager, this.orderManager);
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
                this.inputHandler.resetClick();
                this.inputHandler.mouseX = undefined;
                this.inputHandler.mouseY = undefined;
                this.worldManager.selectedEntity = undefined;
                this.worldManager.selectedIngredient = undefined;

                if (!this.dialogueManager.isShowingDialogue)
                    window['gamePaused'] = !window['gamePaused'];
                else
                    this.dialogueManager.hideDialogue();
            }

            if (!window['gamePaused']) {
                this.dialogueManager.tick(this.screen, this.inputHandler, this.playerStats, this.resetGame);

                if (!this.dialogueManager.isShowingDialogue) {
                    this.playerStats.tick();
                    this.worldManager.tick(this.screen);
                }
            }

            if (window['gamePaused']) {
                const clickX = this.inputHandler.clickX;
                const clickY = this.inputHandler.clickY;
                if (clickX >= this.resumeGameButtonX() && clickX <= this.resumeGameButtonX() + Sprites.button.width && 
                    clickY >= this.resumeGameButtonY() && clickY <= this.resumeGameButtonY() + Sprites.button.height) {
                        this.inputHandler.resetClick();
                        window['gamePaused'] = false;
                } else if (clickX >= this.backToMainMenuButtonX() && clickX <= this.backToMainMenuButtonX() + Sprites.button.width && 
                    clickY >= this.backToMainMenuButtonY() && clickY <= this.backToMainMenuButtonY() + Sprites.button.height) {
                        this.inputHandler.resetClick();
                        window['gamePaused'] = true;
                        this.resetGame.reset();
                        const event = new Event('restart');
                        window.dispatchEvent(event);
                }
            }

            this.ticks++;
        }
    
        this.render();
        this.frames++;
    
        let current = new Date().getTime();
        if (current - this.last >= 1000) {
            this.last = current;
            this.frames = 0;
            this.ticks = 0;
        }
    
        requestAnimationFrame((timestamp) => this.tick(timestamp));
    }

    private render(): void {
        this.worldManager.render(this.screen);

        if (!Settings.easyMode())
            this.screen.renderText(`Score: ${this.playerStats.score}`, this.screen.width - 100, this.screen.height - 67, 16, '#ffffff', undefined, 600);
        else
            this.screen.renderText(`Completed orders: ${this.playerStats.ordersFinished}`, this.screen.width - 200, this.screen.height - 67, 16, '#ffffff', undefined, 600);

        this.renderFireMeter();

        this.dialogueManager.render(this.screen, this.playerStats);

        if (this.playerStats.fireMeter <= 0) {
            this.screen.renderText(`Your score: ${this.playerStats.score}, completed orders: ${this.playerStats.ordersFinished}`, (this.screen.width / 2) - 150, (this.screen.height / 2) - 100, 18, '#ffffff', undefined, 600);

            if (localStorage.getItem('highscore') != null) {
                if (+localStorage.getItem('highscore') > this.playerStats.score)
                    this.screen.renderText(`You did not beat your highscore of ${localStorage.getItem('highscore')}`, (this.screen.width / 2) - 163, (this.screen.height / 2) - 70, 18, '#ffffff', undefined, 600);
                else
                    this.screen.renderText(`Congratulations! You beat your previous highscore of ${localStorage.getItem('highscore')}`, (this.screen.width / 2) - 235, (this.screen.height / 2) - 70, 18, '#ffffff', undefined, 600);
            } else if(this.playerStats.score > 0) {
                this.screen.renderText(`Congratulations! You beat your previous highscore of 0`, (this.screen.width / 2) - 235, (this.screen.height / 2) - 70, 18, '#ffffff', undefined, 600);
            }
        }

        if(window['gamePaused']) {
            const width = (this.screen.width / 2) - 60;
            const height = (this.screen.height / 2) - 100;
            this.screen.renderRectangle(0, 0, this.screen.width, this.screen.height, '#000000', 0.5);
            this.screen.renderText('Game paused', width, height, 18, '#ffffff', undefined, 600);

            this.screen.render(Sprites.button, this.resumeGameButtonX(), this.resumeGameButtonY());
            this.screen.renderText('Resume game', this.resumeGameButtonX() + 30, this.resumeGameButtonY() + 28, 16, '#000000', undefined, 600);

            this.screen.render(Sprites.button, this.backToMainMenuButtonX(), this.backToMainMenuButtonY());
            this.screen.renderText('Back to main menu', this.backToMainMenuButtonX() + 11, this.backToMainMenuButtonY() + 28, 16, '#000000', undefined, 600);
        }
    }

    private renderFireMeter(): void {
        if (Settings.easyMode()) return;

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

    private resumeGameButtonX(): number {
        return (this.screen.width / 2) - 60 - 25;
    }

    private resumeGameButtonY(): number {
        return (this.screen.height / 2) - 100 + 40;
    }

    private backToMainMenuButtonX(): number {
        return this.resumeGameButtonX();
    }

    private backToMainMenuButtonY(): number {
        return this.resumeGameButtonY() + 65;
    }
}

const main = new Main();
main.startGame();