import { EVENTS } from '../core/events.js';

import {
    NotFoundError,
    ValidationError,
} from "../core/errors.js";
import {deepClone} from "../core/utils.js";

export class CraftingSystem {
    constructor({
        state,
        eventBus,
        inventory,
        recipes,
        storyFlags,
        time
                }) {
        this.state = state;
        this.eventBus = eventBus;
        this.inventory = inventory;
        this.recipes = recipes;
        this.storyFlags = storyFlags;
        this.time = time;
    }

    getRecipe(recipeId) {
        const recipe =
            this.recipes[recipeId];
        if (!recipe) {
            throw new NotFoundError(
                `Unknown recipe: ${recipeId}`
            );
        }
        return deepClone()
        }
        listRecipes() {
        return deepClone(this.recipes);
    }
    canCraft(
        recipeId,
        quantity =1,
        {
            station = null
        } = {}
    ) {
        const recipe = this.getRecipe(recipeId);

        this._validateQuantity(quantity);
        if (
            recipe.station !== station
        ) {
            return {
                ok: false,
                reason: 'wrong_station',

                requiredStation:
                recipe.station
            };
        }
        for (
            const [key,expected]
            of Object.entries(recipe.requiresFlags ?? {}
        )
        ){
            if(
                this.storyFlags.get(
                    key
                ) !== expected
            ) {
                return {
                    ok: false,
                    reason: 'missing_story_flag',
                    key,
                    expected
                } ;
            }
        }

        const ingredients =
            multiplyMap(
                recipe.ingredients,
                quantity
            );

        for (
            const [itemId,needed]
            of Object.entries(ingredients)
            ){
            if (
                !this.inventory.has(
                    itemId,
                    needed
                )
            ) {
                return {
                    ok: false,
                    reason: 'missing_ingredient',
                    itemId,
                    needed
                };
            }
        }
        const outputs =
            multiplyMap(
                recipe.outputs,
                quantity
            );

        const bundle =
            this.inventory.canAddBundle(
                outputs
            );

        if (!bundle.ok) {
            return {
                ok: false,
                reason: 'inventory_full',
                details: bundle
            };
        }

        return {
            ok: true,
            ingredients,
            outputs
        };
    }

    craft(
        recipeId,
        quantity = 1,
        {
            station = null,
            source = 'crafting'
        } = {}
    ) {
        const check =
            this.canCraft(
                recipeId,
                quantity,
                {
                    station
                }
            );

        if (!check.ok) {
            throw new ValidationError(
                `Cannot craft ${recipeId}`,
                check
            );
        }

        const recipe =
            this.getRecipe(
                recipeId
            );
        for (
            const [
                itemId,
                amount
            ] of Object.entries(check.ingredients)
        ) {
            this.inventory.remove(
                itemId,
                amount,
                {
                    source
                }
            );
        }

        for (
            const [
                itemId,
                amount
            ] of Object.entries(
                check.outputs
        )
        ) {
            this.inventory.add(
                itemId,
                amount,
                {
                    source
                }
            );
        }

        if (
            recipe.craftTimeSeconds
        ) {
            this.time.advance(
                recipe.craftTimeSeconds * quantity,
                {
                    reason:
                    `craft: ${recipeId}`
                }
            );
        }

        this.eventBus.emit (
            EVENTS.CRAFTED,
            {
                recipeId,
                quantity,
                ingredients:
                check.ingredients,
                outputs:
                check.outputs,
                station
            }
        );

        return {
            recipeId,
            quantity,
            outputs:
            deepClone(
                check.outputs
            )
        };
    }

    _validateQuantity(quantity) {
        if (
            !Number.isInteger(quantity
        ) ||
        quantity < 0
        ){
            throw new ValidationError(
                'Craft quantity must be an integer'
            );
        }
    }
}

function multiplyMap(
    map,
    quantity
) {
    return Object.fromEntries(
        Object.entries(map).map(
            ([key, value]) => [key,
            value * quantity
            ]
        )
    );
}