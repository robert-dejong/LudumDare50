import { config } from "../config";
import { Screen } from "../core/screen";
import { Ingredient } from "../ingredients/ingredient";
import { Ingredients } from "../ingredients/ingredients";
import { Offences } from "../offences/offences";
import { PlayerStats } from "../player-stats";
import { Sprites } from "../sprites/sprites";
import { WorldManager } from "../world/world-manager";
import { Order } from "./order";

export class OrderManager {
    public orders: Array<Order>;

    private lastOrder: number;
    private orderOverflowWarning: boolean;

    constructor(private playerStats: PlayerStats) { 
        this.orders = new Array<Order>();
        this.lastOrder = 0;
        this.orderOverflowWarning = false;

        this.orders.push(new Order(this.playerStats, [ Ingredients.burgerBottom, Ingredients.hamburger, Ingredients.burgerTop ]));
        this.orders.push(new Order(this.playerStats, [ Ingredients.burgerBottom, Ingredients.hamburger, Ingredients.cheese, Ingredients.egg, Ingredients.onion, Ingredients.tomato, Ingredients.lettuce, Ingredients.burgerTop ]));
    }

    public tick(worldManager: WorldManager): void {
        this.lastOrder++;

        if (this.nextOrderIsUp()) {
            this.orders.push(this.getNewOrder());
            this.lastOrder = 0;

            if (this.orders.length > config.order.maxVisibleOrders) {
                worldManager.applyOffence(Offences.orderOverflowContinue)
            }
        }

        if (this.orders.length > config.order.maxVisibleOrders && !this.orderOverflowWarning) {
            this.orderOverflowWarning = true;
            worldManager.applyOffence(Offences.orderOverflow);
        }

        if (this.orders.length <= config.order.maxVisibleOrders && this.orderOverflowWarning) {
            this.orderOverflowWarning = false;
        }
    }

    public render(screen: Screen): void {
        this.orders.forEach((order, index) => {
            if (index + 1 > config.order.maxVisibleOrders) return;

            const x = 20 + (index * 150);
            const y = 10;
            let rowCount = 0;
            let indicatorX = x;
            let indicatorY = 15 + Sprites.plate.height;
            screen.render(Sprites.plate, x, y);

            order.requiredIngredients.forEach((ingredient) => {
                screen.render(ingredient.sprite, indicatorX + config.order.indicatorIngredientSpacing, indicatorY, 1, config.order.indicatorIngredientMaxHeight);

                if (order.isIngredientAdded(ingredient)) {
                    screen.render(Sprites.check, indicatorX + config.order.indicatorIngredientSpacing, indicatorY);
                }

                if (ingredient.sprite.height > config.order.indicatorIngredientMaxHeight)
                    indicatorX += config.order.indicatorIngredientSpacing + (ingredient.sprite.width * (config.order.indicatorIngredientMaxHeight / ingredient.sprite.height));
                else
                    indicatorX += config.order.indicatorIngredientSpacing + ingredient.sprite.width;

                rowCount++;

                if (rowCount === config.order.indicatorMaxPerRow) {
                    rowCount = 0;
                    indicatorX = x;
                    indicatorY += config.order.indicatorIngredientMaxHeight + config.order.indicatorIngredientSpacing;
                }
            });

            order.addedIngredients.forEach(ingredient => {
                screen.render(ingredient.sprite, x + (Sprites.plate.width / 2) - (ingredient.sprite.width / 2), y + (Sprites.plate.height / 2) - (ingredient.sprite.height / 2));
            });
        });

        if (this.orders.length > config.order.maxVisibleOrders) {
            const overflowCount = this.orders.length - config.order.maxVisibleOrders;
            screen.renderText(`+ ${overflowCount} more orders`, screen.width - 90, 80, 16, '#ffffff', 100, 600);
        }
    }
    
    private getNewOrder(): Order {
        let ingredientList = Ingredients.getIngredients();
        let ingredients = new Array<Ingredient>();

        ingredientList = ingredientList.filter(ingredient => 
            ingredient !== Ingredients.burgerTop && 
            ingredient !== Ingredients.burgerBottom && 
            ingredient !== Ingredients.hamburger && 
            (Math.random() * 5) <= 2);

        ingredients.push(Ingredients.burgerBottom);
        ingredients.push(Ingredients.hamburger);
        ingredients = ingredients.concat(ingredientList);
        ingredients.push(Ingredients.burgerTop);

        return new Order(this.playerStats, ingredients);
    }

    private nextOrderIsUp(): boolean {
        if (this.lastOrder < config.order.minimumOrderDelay) return false;
        
        const random = Math.random() * 10;

        return random <= 1;
    }
}