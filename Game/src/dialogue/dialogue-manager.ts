import { Screen } from "../core/screen";
import { InputHandler } from "../input/input-handler";
import { PlayerStats } from "../player-stats";
import { ResetGame } from "../reset-game";
import { Sprites } from "../sprites/sprites";

export class DialogueManager {
    public isShowingDialogue: boolean;
    private dialogueText: string;
    private minimumOpenDuration: number;
    private openDuration: number;

    constructor() {
        this.isShowingDialogue = false;
        this.dialogueText = '';
        this.minimumOpenDuration = 30;
        this.openDuration = 0;
    }

    public tick(screen: Screen, inputHandler: InputHandler, playerStats: PlayerStats, resetGame: ResetGame): void {
        if (!this.isShowingDialogue) return;
        
        this.openDuration++;

        if (this.openDuration < this.minimumOpenDuration) {
            inputHandler.resetClick();
            return;
        }

        const x = this.getButtonRenderX(screen);
        const y = this.getButtonRenderY(screen);

        if (inputHandler.clickX >= x && inputHandler.clickX <= x + Sprites.button.width && 
            inputHandler.clickY >= y && inputHandler.clickY <= y + Sprites.button.height) {
                this.hideDialogue();
                inputHandler.resetClick();

                if (playerStats.fireMeter <= 0) {
                    window['gamePaused'] = true;
                    resetGame.reset();
                    const event = new Event('restart');
                    window.dispatchEvent(event);
                }
        }
    }

    public render(screen: Screen, playerStats: PlayerStats): void {
        if (!this.isShowingDialogue) return;

        screen.renderRectangle(0, 0, screen.width, screen.height, '#000000', 0.5);

        const x = this.getRenderX(screen);
        const y = this.getRenderY(screen);
        screen.render(Sprites.dialogue, x, y, 1.5);
        screen.renderText(this.dialogueText, x + 15, y + 25, 16, '#000000', 270);

        const buttonX = this.getButtonRenderX(screen);
        const buttonY = this.getButtonRenderY(screen);
        screen.render(Sprites.button, buttonX, buttonY);
        screen.renderText(playerStats.fireMeter > 0 ? 'Click to continue' : 'Back to main menu', playerStats.fireMeter > 0 ? (buttonX + 17) : (buttonX + 12), buttonY + 28, 16, '#000000', undefined, 600);
    }

    public showDialogue(text: string) {
        this.dialogueText = text;
        this.isShowingDialogue = true;
        this.openDuration = 0;
    }

    public hideDialogue(): void {
        this.isShowingDialogue = false;
    }

    private getRenderX(screen: Screen): number {
        return (screen.width / 2) - ((Sprites.dialogue.width * 1.5) / 2);
    }

    private getRenderY(screen: Screen): number {
        return (screen.height / 2) - ((Sprites.dialogue.height * 1.5) / 2);
    }

    private getButtonRenderX(screen: Screen): number {
        return this.getRenderX(screen) + ((Sprites.dialogue.width * 1.5) / 2) - (Sprites.button.width / 2);
    }

    private getButtonRenderY(screen: Screen): number {
        return this.getRenderY(screen) + (Sprites.dialogue.height * 1.5) + 10;
    }
}