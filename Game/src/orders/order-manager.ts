import { config } from "../config";
import { Screen } from "../core/screen";
import { Ingredient } from "../ingredients/ingredient";
import { Ingredients } from "../ingredients/ingredients";
import { Offences } from "../offences/offences";
import { PlayerStats } from "../player-stats";
import { Settings } from "../settings";
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

        for(let i = 0; i < config.order.initialOrders; i++) {
            this.addNewOrder();
        }
    }

    public tick(worldManager: WorldManager): void {
        this.lastOrder++;

        if (this.nextOrderIsUp()) {
            this.addNewOrder();

            if (!Settings.easyMode() && this.orders.length > config.order.maxVisibleOrders) {
                worldManager.applyOffence(Offences.orderOverflowContinue)
            }
        }

        if (Settings.easyMode()) return;

        if (this.orders.length > config.order.maxVisibleOrders && !this.orderOverflowWarning) {
            this.orderOverflowWarning = true;
            worldManager.applyOffence(Offences.orderOverflow);
        }

        if (this.orders.length <= config.order.maxVisibleOrders && this.orderOverflowWarning) {
            this.orderOverflowWarning = false;
        }

        this.orders.forEach((order, index) => {
            if (index + 1 > config.order.maxVisibleOrders) return;

            if (order.orderTime > 0) order.orderTime--;

            if (order.orderTime <= 0) {
                worldManager.applyOffence(Offences.orderOvertime);
            }
        });
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

            if (!Settings.easyMode()) {
                screen.renderRectangle(x, y - 3, Sprites.plate.width, 18, '#ffffff');
                screen.renderRectangle(x + 1, y - 3 + 1, Sprites.plate.width - 2, 16, '#d30000');
                screen.renderRectangle(x + 1, y - 3 + 1, (Sprites.plate.width - 2) * (order.orderTime / order.initialOrderTime), 16, '#00a12a');
                screen.renderText('Time left', x + 38, y - 3 + 14, 14);
            }

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
                screen.render(ingredient.sprite, x + ingredient.renderOffsetX + (Sprites.plate.width / 2) - (ingredient.sprite.width / 2), y + ingredient.renderOffsetY + (Sprites.plate.height / 2) - (ingredient.sprite.height / 2));
            });
        });

        if (this.orders.length > config.order.maxVisibleOrders) {
            const overflowCount = this.orders.length - config.order.maxVisibleOrders;
            screen.renderText(`+ ${overflowCount} more orders`, screen.width - 90, 80, 16, '#ffffff', 100, 600);
        }
    }

    public reset(): void {
        this.orders = new Array<Order>();
        this.lastOrder = 0;
        this.orderOverflowWarning = false;

        for(let i = 0; i < config.order.initialOrders; i++) {
            this.addNewOrder();
        }
    }

    public addNewOrder(): void {
        this.orders.push(this.getNewOrder());
        this.lastOrder = 0;
    }
    
    private getNewOrder(): Order {
        let ingredientList = Ingredients.getIngredients();
        let ingredients = new Array<Ingredient>();

        ingredientList = ingredientList.filter(ingredient => 
            ingredient !== Ingredients.burgerTop && 
            ingredient !== Ingredients.burgerBottom && 
            ingredient !== Ingredients.hamburger && 
            this.shouldAddIngredient());

        ingredients.push(Ingredients.burgerBottom);
        ingredients.push(Ingredients.hamburger);
        ingredients = ingredients.concat(ingredientList);
        ingredients.push(Ingredients.burgerTop);

        return new Order(this.playerStats, ingredients);
    }

    private nextOrderIsUp(): boolean {
        if (this.lastOrder < config.order.minimumOrderDelay) return false;
        if (this.playerStats.level >= 33) return true;
        
        const random = (Math.random()) * (500 - (this.playerStats.level * 15));

        return random <= 2;
    }

    private shouldAddIngredient(): boolean {
        if (this.playerStats.level <= 5) return (Math.random() * 4) <= 1;
        if (this.playerStats.level <= 10) return (Math.random() * 3) <= 1;
        if (this.playerStats.level <= 15) return (Math.random() * 5) <= 2;
        if (this.playerStats.level <= 20) return (Math.random() * 6) <= 3;
        if (this.playerStats.level <= 25) return (Math.random() * 7) <= 4;
        
        return (Math.random() * 10) <= 6;
    }
}