import { CookState } from "../entity/cook-state";
import { Ingredient } from "../ingredients/ingredient";
import { Ingredients } from "../ingredients/ingredients";
import { PlayerStats } from "../player-stats";
import { AddIngredientResult } from "./add-ingredient-result";

export class Order {
    public requiredIngredients: Array<Ingredient>;
    public addedIngredients: Array<Ingredient>;
    public orderCompleted: boolean;
    private orderScore: number;

    constructor(private playerStats: PlayerStats, ingredients: Array<Ingredient>) {
        this.requiredIngredients = ingredients;
        this.addedIngredients = new Array<Ingredient>();
        this.orderCompleted = false;
        this.orderScore = 0;
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

        if (ingredient.shouldCook === true) {
            // Extra score for a cooked ingredient
            this.orderScore++;
        }

        if (ingredient.shouldCook === null && cookState === CookState.Done) {
            // 2 extra score for cooking an ingredient that doesnt require cooking
            this.orderScore += 2;
        }

        if (this.addedIngredients.length === this.requiredIngredients.length) {
            this.orderCompleted = true;
            this.playerStats.addFinishedOrder();
            this.playerStats.addScore(this.orderScore);
        }
    }

    public isIngredientAdded(ingredient: Ingredient): boolean {
        return this.addedIngredients.some(addedIngredient => addedIngredient === ingredient);
    }
}