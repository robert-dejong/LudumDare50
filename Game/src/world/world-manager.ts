import { config } from "../config";
import { Screen } from "../core/screen";
import { DialogueManager } from "../dialogue/dialogue-manager";
import { Entity } from "../entity/entity";
import { Ingredient } from "../ingredients/ingredient";
import { Ingredients } from "../ingredients/ingredients";
import { InputHandler } from "../input/input-handler";
import { Offence } from "../offences/offence";
import { Offences } from "../offences/offences";
import { AddIngredientResult } from "../orders/add-ingredient-result";
import { OrderManager } from "../orders/order-manager";
import { PlayerStats } from "../player-stats";
import { Sounds } from "../sound/sounds";
import { Sprites } from "../sprites/sprites";

export class WorldManager {
    public selectedEntity: Entity;
    public selectedIngredient: Ingredient;
    public burnedIngredientsWarning: number;
    private entities: Array<Entity>;

    constructor(private orderManager: OrderManager, private inputHandler: InputHandler, private dialogueManager: DialogueManager, private playerStats: PlayerStats) {
        this.entities = new Array<Entity>();
        this.burnedIngredientsWarning = 0;
    }

    public tick(screen: Screen): void {
        let ingredientX = 20;
        this.orderManager.tick(this);

        if (this.selectedEntity === undefined && this.selectedIngredient === undefined && this.inputHandler.mousePressed) {
            const mouseX = this.inputHandler.mouseX;
            const mouseY = this.inputHandler.mouseY;

            for(let ingredient of Ingredients.getIngredients()) {
                let maxX = ingredientX + ingredient.sprite.width + 15;
                let x = ingredientX - 15;
                let y = (screen.height - 85) + ((config.ingredientSlotHeight - ingredient.sprite.height) / 2) - 15;
                let maxY = y + ingredient.sprite.height + 30;
    
                if (mouseX >= x && mouseX <= maxX && mouseY >= y && mouseY <= maxY) {
                    this.selectedIngredient = ingredient;
                    break;
                }
    
                ingredientX += (ingredient.sprite.width + 30);
            }
        }

        if (this.selectedEntity === undefined && this.selectedIngredient !== undefined && !this.inputHandler.mousePressed) {
            const selectedIngredient = this.selectedIngredient;
            this.selectedIngredient = undefined;

            if (this.inputHandler.mouseY <= config.orderUiY) {
                this.orderManager.orders.forEach((order, index) => {
                    const x = 20 + (index * 150);
                    const y = 10;
    
                    if (this.inputHandler.mouseX >= x && this.inputHandler.mouseX <= x + Sprites.plate.width && 
                        this.inputHandler.mouseY >= y && this.inputHandler.mouseY <= y + Sprites.plate.height) {
                            const addIngredientStatus = order.canAddIngredient(selectedIngredient);

                            if (addIngredientStatus === AddIngredientResult.AddBurgerBottomFirst || addIngredientStatus === AddIngredientResult.AddBurgerTopLast) {
                                this.applyOffenceByAddedIngredientResult(addIngredientStatus);
                                return;
                            }

                            if (selectedIngredient.shouldCook === true) {
                                this.applyOffence(selectedIngredient === Ingredients.hamburger ? Offences.rawBurgerAdded : Offences.rawEggAdded);
                                return;
                            }

                            if (addIngredientStatus !== AddIngredientResult.Ok) {
                                this.applyOffenceByAddedIngredientResult(addIngredientStatus);
                                return;
                            }
    
                            order.addIngredient(selectedIngredient);
                    }
                });

                return;
            }
            
            if (this.inputHandler.mouseY >= config.ingredientUiY) {
                return;
            }

            if (selectedIngredient.shouldCook === false) {
                this.applyOffence(Offences.nonCookableIngredientCooked);
                return;
            }

            this.addEntity(new Entity(selectedIngredient, this.inputHandler.mouseX - (selectedIngredient.sprite.width / 2), this.inputHandler.mouseY - (selectedIngredient.sprite.height / 2)));
            Sounds.cook.play();
        }

        this.entities.forEach((entity) => {
            entity.tick(this, this.inputHandler, this.orderManager);
        });

        this.entities = this.entities.filter(entity => entity.removed === false);
        this.orderManager.orders = this.orderManager.orders.filter(order => order.orderCompleted === false && order.orderTime > 0);

        if (this.orderManager.orders.length === 0) {
            for(let i = 0; i < config.order.initialOrders; i++) {
                // All available orders were completed
                this.orderManager.addNewOrder();
            }

            this.playerStats.addScore(50);
            this.playerStats.upFireMeter(8);
            this.playerStats.level += 3;
        }
    }

    public render(screen: Screen): void {
        let ingredientX = 20;

        screen.render(Sprites.game, 0, 0);

        this.orderManager.render(screen);

        Ingredients.getIngredients().forEach(ingredient => {
            let y = (screen.height - 85) + ((config.ingredientSlotHeight - ingredient.sprite.height) / 2);
            screen.render(ingredient.sprite, ingredientX, y);
            screen.renderText(ingredient.name, ingredientX, screen.height - 10, 12);
            ingredientX += (ingredient.sprite.width + 30);
        });

        this.entities.forEach(entity => {
            entity.render(screen, this, this.inputHandler);
        });

        if (this.selectedIngredient !== undefined) {
            screen.render(this.selectedIngredient.sprite, this.inputHandler.mouseX - (this.selectedIngredient.sprite.width / 2), this.inputHandler.mouseY - (this.selectedIngredient.sprite.height / 2));
        }
    }

    public applyOffenceByAddedIngredientResult(addIngredientResult: AddIngredientResult): void {
        if (addIngredientResult === AddIngredientResult.Ok) return;
        
        let offence: Offence;

        if (addIngredientResult === AddIngredientResult.IngredientAlreadyAdded) offence = Offences.ingredientAlreadyAdded;
        if (addIngredientResult === AddIngredientResult.WrongIngredient) offence = Offences.wrongIngredientAdded;
        if (addIngredientResult === AddIngredientResult.AddBurgerBottomFirst) offence = Offences.addBurgerBottomFirst;
        if (addIngredientResult === AddIngredientResult.AddBurgerTopLast) offence = Offences.addBurgerTopLast;

        this.applyOffence(offence);
    }

    public applyOffence(offence: Offence): void {
        this.playerStats.lowerFireMeter(offence.cost);
        Sounds.offence.play();

        if (offence.text.length !== 0 && this.playerStats.fireMeter > 0) {
            this.selectedEntity = undefined;
            this.selectedIngredient = undefined;
            this.inputHandler.resetClick();
            this.inputHandler.mousePressed = false;
            this.inputHandler.mouseX = undefined;
            this.inputHandler.mouseY = undefined;
            this.dialogueManager.showDialogue(offence.text);
        }
    }

    public removeEntity(entityToRemove: (entity: Entity) => boolean): void {
        if(!this.entities.some((entity) => entityToRemove(entity))) return;

        this.entities = this.entities.filter((entity) => !entityToRemove(entity));
    }

    public addEntity(entity: Entity): void {
        this.entities.push(entity);
    }

    public reset(): void {
        this.selectedEntity = undefined;
        this.selectedIngredient = undefined;
        this.entities = new Array<Entity>();
        this.burnedIngredientsWarning = 0;
    }
}