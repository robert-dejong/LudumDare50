import { config } from "../config";
import { Screen } from "../core/screen";
import { DialogueManager } from "../dialogue/dialogue-manager";
import { Ingredient } from "../ingredients/ingredient";
import { Ingredients } from "../ingredients/ingredients";
import { InputHandler } from "../input/input-handler";
import { Offence } from "../offences/offence";
import { Offences } from "../offences/offences";
import { AddIngredientResult } from "../orders/add-ingredient-result";
import { OrderManager } from "../orders/order-manager";
import { Sprites } from "../sprites/sprites";
import { WorldManager } from "../world/world-manager";
import { CookState } from "./cook-state";

export class Entity {
    ingredient: Ingredient;
    x: number;
    y: number;
    cookDuration: number;
    removed: boolean;

    constructor(ingredient: Ingredient, x: number, y: number) {
        this.ingredient = ingredient;
        this.x = x;
        this.y = y;
        this.cookDuration = 0;
        this.removed = false;
    }

    public render(screen: Screen, worldManager: WorldManager, inputHandler: InputHandler): void {
        const cookState = this.getCookState();
        if (worldManager.selectedEntity === this) {
            const x = inputHandler.mouseX - (this.ingredient.sprite.width / 2);
            const y = inputHandler.mouseY - (this.ingredient.sprite.height / 2);
            screen.render(this.ingredient.sprite, x, y);
            screen.renderText(cookState.toString(), x, y + this.ingredient.sprite.height + 14, 13, this.getCookStateColor(cookState));
        } else {
            screen.render(this.ingredient.sprite, this.x, this.y);
            screen.renderText(cookState.toString(), this.x, this.y + this.ingredient.sprite.height + 14, 13, this.getCookStateColor(cookState));
        }
    }

    public tick(worldManager: WorldManager, inputHandler: InputHandler, orderManager: OrderManager): void {
        if (worldManager.selectedEntity !== this) {
            this.cookDuration++;

            if (this.getCookState() === CookState.Burned) {
                this.removed = true;
                const offence = new Offence(Offences.ingredientBurned.text.replace('{name}', this.ingredient.name), Offences.ingredientBurned.cost);
                worldManager.applyOffence(offence);
                return;
            }
        }

        if (worldManager.selectedIngredient === undefined && worldManager.selectedEntity === undefined && inputHandler.mousePressed) {
            if (inputHandler.mouseX >= this.x && inputHandler.mouseX <= this.x + this.ingredient.sprite.width && 
                inputHandler.mouseY >= this.y && inputHandler.mouseY <= this.y + this.ingredient.sprite.height) {
                    worldManager.selectedEntity = this;
            }
        }

        if (worldManager.selectedIngredient === undefined && worldManager.selectedEntity === this && !inputHandler.mousePressed) {
            const selectedEntity = worldManager.selectedEntity;
            worldManager.selectedEntity = undefined;

            orderManager.orders.forEach((order, index) => {
                const x = 20 + (index * 150);
                const y = 10;

                if (inputHandler.mouseX >= x && inputHandler.mouseX <= x + Sprites.plate.width && 
                    inputHandler.mouseY >= y && inputHandler.mouseY <= y + Sprites.plate.height) {
                        const cookState = selectedEntity.getCookState();
                        const addIngredientStatus = order.canAddIngredient(selectedEntity.ingredient);

                        if (addIngredientStatus === AddIngredientResult.AddBurgerBottomFirst || addIngredientStatus === AddIngredientResult.AddBurgerTopLast) {
                            worldManager.applyOffenceByAddedIngredientResult(addIngredientStatus);
                            return;
                        }

                        if (selectedEntity.ingredient.shouldCook === true && cookState !== CookState.Done) {
                            worldManager.applyOffence(selectedEntity.ingredient === Ingredients.hamburger ? Offences.rawBurgerAdded : Offences.rawEggAdded);
                            return;
                        }

                        if (addIngredientStatus !== AddIngredientResult.Ok) {
                            worldManager.applyOffenceByAddedIngredientResult(addIngredientStatus);
                            return;
                        }
                        
                        order.addIngredient(selectedEntity.ingredient, cookState);
                        selectedEntity.removed = true;
                }
            });
        }
    }

    private getCookState(): CookState {
        if (this.ingredient.shouldCook === null && this.cookDuration < this.ingredient.cookDuration) {
            return CookState.NonCookable;
        }

        if (this.cookDuration < this.ingredient.cookDuration) {
            return CookState.Raw;
        }

        if (this.cookDuration >= this.ingredient.cookDuration && this.cookDuration < this.ingredient.cookDuration * 2.0) {
            return CookState.Done;
        }

        return CookState.Burned;
    }

    private getCookStateColor(cookState: CookState): string {
        switch(cookState) {
            case CookState.Raw:
            case CookState.NonCookable:
                return '#ffffff';
            
            case CookState.Done:
                return '#00c12a';

            case CookState.Burned:
                return '#f50000';
        }
    }
}