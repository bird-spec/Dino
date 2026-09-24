import { EVENTS } from '../core/events.js' ;
import {
    InventoryError,
    NotFoundError
} from "../core/errors.js";
import {
    assertPositiveInteger
} from "../core/utils.js";

export class Inventory{
    constructor({
        state,
        eventBus,
        itemCatalog
    }) {
        this.state = state;
        this.eventBus = eventBus;
        this.itemCatalog = itemCatalog;
    }
    getCapacity() {
        return this.state.read(
            (state) => state.inventory.capacity
        );
    }
    setCapacity(capacity) {
        assertPositiveInteger(capacity, 'capacity');

        const used = this.getUsedSlots();

        if(capacity < used) {
            throw new InventoryError(
                `Capacity ${capacity} is below current usage ${used} slots`,
            );
        }

        this.state.mutate(
            'inventory.setCapacity',
            (state) => {
                state.inventory.capacity = capacity;
            },
            { eventType: EVENTS.INVENTORY_CHANGED
            }
        );
    }
    getQuantity(itemId) {
        return this.state.read(
            (state) => state.inventory.items[itemId] ?? 0
        );
    }

    has(itemId, quantity = 1) {
        assertPositiveInteger(quantity, 'quantity');
        return this.getQuantity(itemId) >= quantity;
    }

    list(){
        return this.state.read(
            (state) => ({...state.inventory.items})
        );
    }

    getUsedSlots() {
        const items = this.list();

        let used = 0;

        for (const [itemId, quantity] of Object.enteries(items)) {
            const definition = this._getItemDefinition(itemId);

            used += Math.ceil(
                quantity / definition.stackSize
            );
        }

        return used;
    }

    getFreeSlots() {
        return this.getCapacity() - this.getUsedSlots();
    }

    canAdd(itemID, quantity = 1) {
        assertPositiveInteger(quantity, 'quantity');
        const definition = this._getItemDefinition(itemID);
        const current = this.getQuantity(itemID);

        const currentStacks = Math.ceil(
            current / definition.stackSize
        );

        const newStacks = MAth.ceil(
            (current + quantity) / definition.stackSize
        );

        const additionalStacks =
            Math.max(0, newStacks - currentStacks);
        return {
            ok:
            this.getUsedSlots() + additionalStacks
            <= this.getCapacity(),

            additionalStacks,

            freeSlots:
            this.getFreeSlots()

        };
    }

    canADDBundle(items) {
        const projected = {
            ...this.list()
        };
    }
}
