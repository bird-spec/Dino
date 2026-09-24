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

        for (const [itemId, quantity] of Object.entries(items)) {
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

        const newStacks = Math.ceil(
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

    canAddBundle(items) {
        const projected = {
            ...this.list()
        };

        let usedSlots = this.getUsedSlots();

        for (const [itemId, quantity] of Object.entries(items)) {
            assertPositiveInteger(quantity, `quantity for ${itemId} `);

          const definition =
              this._getItemDefinition(itemId);
          const oldQuantity =
              projected[itemId] ?? 0;

          const oldStacks =
              Math.ceil(oldQuantity / definition.stackSize);

          const newQuantity =
              oldQuantity + quantity;

          const newStacks =
              Math.ceil(newQuantity / definition.stackSize);

          usedSlots += Math.max(
              0,
              newStacks - oldStacks
          );

          projected[itemId] = newQuantity;
        }

        return {
            ok: usedSlots <= this.getCapacity(),
            projectedSlots: usedSlots,
            freeSlotsAfter:
            this.getCapacity() - usedSlots
        };
    }
    add(
        itemId,
        quantity = 1,
        { source = 'gameplay'
        } = {}
    ) {
        assertPositiveInteger(quantity, 'quantity');

        this._getItemDefinition(itemId);

        const capacityCheck =
            this.canAdd(itemId, quantity);
        if (!capacityCheck.ok) {
            throw new InventoryError(
                `Not enough inventory space for ${quantity} x ${itemId}.`
            );
        }
        this.state.mutate(
            'inventory.add',
            (state) => {
                state.inventory.items[itemId] =
                    (state.inventory.items[itemId] ?? 0)
                + quantity ;
            },
            {
                eventType: EVENTS.INVENTORY_CHANGED,

                payload: {
                    itemId,
                    quantity,
                    source
                }
            }
        );
        this.eventBus.emit(
            EVENTS.ITEM_ADDED,
            {
                itemId,
                quantity,
                source
            }
        );
        return this.getQuantity(itemId);
    }
    remove(
        itemId,
        quantity =1,{
            source = 'gameplay'
        } = {}
    ) {
        assertPositiveInteger(quantity, 'quantity');

        const current = this.getQuantity(itemId);

        if(current < quantity) {
            throw new InventoryError(
                `Not enough ${itemId}. Required ${quantity}, have ${current}`
            );
        }

        this.state.mutate(
            'inventory.remove',
            (state) => {
                const next = state.inventory.items[itemId]
                - quantity;
               if(next === 0) {
                   delete state.inventory.items[itemId];
               } else {
                   state.inventory.items[itemId] =
                       next;
               }
            },
            {
                eventType: EVENTS.INVENTORY_CHANGED,
                payload: {
                    itemId,
                    quantity,
                    source
                }
            }
        );
        this.eventBus.emit(EVENTS.ITEM_REMOVED,
            {
                itemId,
                quantity,
                source,
                inventory: this.list()
            });
        return this.getQuantity(itemId);
    }

    clear({ source = 'system'} = {}) {
        const oldItems = this.list();

        this.state.mutate(
            'inventory.clear',
            (state) => {
                state.inventory.items = {};
            },
            {
                eventType:
                EVENTS.INVENTORY_CHANGED,
                payload: {
                    source
                }
            }
        );

        for (const [itemId, quantity] of Object.entries(oldItems)) {
            this.eventBus.emit(
                EVENTS.ITEM_REMOVED,
                {
                    itemId,
                    quantity,
                    source,
                    inventory: this.list()
                }

            );
        }
    }
    _getItemDefinition(itemId) {
        const definition =
            this.itemCatalog[itemId];

        if (!definition) {
            throw new NotFoundError(
                `Unknown item: ${itemId}`
            );
        }
        return definition;
    }
}
