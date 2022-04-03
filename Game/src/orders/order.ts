import { CookState } from "../entity/cook-state";
import { Ingredient } from "../ingredients/ingredient";
import { Ingredients } from "../ingredients/ingredients";
import { PlayerStats } from "../player-stats";
import { Sounds } from "../sound/sounds";
import { AddIngredientResult } from "./add-ingredient-result";

export class Order {
    public requiredIngredients: Array<Ingredient>;
    public addedIngredients: Array<Ingredient>;
    public orderCompleted: boolean;
    public initialOrderTime: number;
    public orderTime: number;
    private orderScore: number;

    constructor(private playerStats: PlayerStats, ingredients: Array<Ingredient>) {
        this.requiredIngredients = ingredients;
        this.addedIngredients = new Array<Ingredient>();
        this.orderCompleted = false;
        this.orderScore = 0;
        this.initialOrderTime = playerStats.orderTime;
        this.orderTime = playerStats.orderTime;
    }

    public canAddIngredient(ingredient: Ingredient): AddIngredientResult {
        if (this.addedIngredients.length === 0 && ingredient.name !== Ingredients.burgerBottom.name) return AddIngredientResult.AddBurgerBottomFirst;
        if (this.addedIngredients.length < this.requiredIngredients.length - 1 && ingredient === Ingredients.burgerTop) return AddIngredientResult.AddBurgerTopLast;
        if (!this.requiredIngredients.some(requiredIngredient => requiredIngredient === ingredient)) return AddIngredientResult.WrongIngredient;
        if (this.isIngredientAdded(ingredient)) return AddIngredientResult.IngredientAlreadyAdded;

        return AddIngredientResult.Ok;
    }

    public addIngredient(ingredient: Ingredient, cookState: CookState = CookState.NonCookable): void {
        this.addedIngredients.push(ingredient);
        this.orderScore++;

        if (ingredient.shouldCook === true && cookState === CookState.Done) {
            // 2 extra score for a cooked ingredient
            this.orderScore += 2;
        }

        if (ingredient.shouldCook === null && cookState === CookState.Done) {
            // 3 extra score for cooking an ingredient that doesnt require cooking
            this.orderScore += 3;
        }

        if (ingredient.shouldCook === null && cookState === CookState.Overcooked) {
            // 1 extra score for overcooking an ingredient that doesnt require cooking
            this.orderScore += 1;
        }

        if (this.addedIngredients.length === this.requiredIngredients.length) {
            let upFireMeter = 1;

            if (this.addedIngredients.length > 4) {
                this.orderScore += 1;
                upFireMeter = 2;
            }
            if (this.addedIngredients.length >= Ingredients.getIngredients().length) {
                this.orderScore += 1;
                upFireMeter = 3;
            }

            this.orderCompleted = true;
            this.playerStats.addFinishedOrder(upFireMeter);
            this.playerStats.addScore(this.orderScore);
            Sounds.orderCompleted.play();
        } else {
            Sounds.ingredientAdded.play();
        }
    }

    public isIngredientAdded(ingredient: Ingredient): boolean {
        return this.addedIngredients.some(addedIngredient => addedIngredient === ingredient);
    }
}